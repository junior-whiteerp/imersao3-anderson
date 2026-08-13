-- Esquema do Caixa Vivo. Postgres puro — sem Supabase, sem schema `auth`.
-- Ver DEC-007.

create extension if not exists pgcrypto;

create table clube (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  percentual_rake_dealer integer not null default 0
);

-- A identidade do operador mora aqui, não num schema de fornecedor.
-- `senha_hash` guarda o formato scrypt$N$r$p$salt$hash — ver servidor/auth/senha.ts.
create table operador (
  id uuid primary key default gen_random_uuid(),
  clube_id uuid not null references clube(id),
  nome text not null,
  email text not null check (btrim(email) <> ''),
  senha_hash text not null
);
create unique index operador_email on operador (lower(btrim(email)));

-- Sessão de login. Token opaco, não JWT: dá para revogar, e o navegador
-- guarda em cookie httpOnly, que XSS não alcança.
create table sessao_operador (
  token text primary key,
  operador_id uuid not null references operador(id) on delete cascade,
  criada_em timestamptz not null default now(),
  expira_em timestamptz not null
);
create index sessao_operador_expira on sessao_operador (expira_em);

create table dealer (
  id uuid primary key default gen_random_uuid(),
  clube_id uuid not null references clube(id),
  nome text not null
);

create table jogador (
  id uuid primary key default gen_random_uuid(),
  clube_id uuid not null references clube(id),
  nome text not null check (btrim(nome) <> ''),
  -- N15: sem WhatsApp não há cadastro. Vale o dígito, não o texto.
  whatsapp text not null check (length(regexp_replace(whatsapp, '\D', '', 'g')) > 0),
  cpf text,
  limite integer not null check (limite > 0),
  consentimento_em timestamptz not null
);
-- A16: o par nome + WhatsApp é único no clube.
create unique index jogador_identidade on jogador
  (clube_id, lower(btrim(nome)), regexp_replace(whatsapp, '\D', '', 'g'));

create table sessao (
  id uuid primary key default gen_random_uuid(),
  clube_id uuid not null references clube(id),
  aberta_em timestamptz not null,
  encerrada_em timestamptz,
  caixa_inicial integer not null check (caixa_inicial > 0),
  aberta boolean not null default true
);
-- N1: uma sessão aberta por clube.
create unique index sessao_uma_aberta_por_clube on sessao (clube_id) where aberta;

create table participacao (
  id uuid primary key default gen_random_uuid(),
  sessao_id uuid not null references sessao(id) on delete cascade,
  jogador_id uuid not null references jogador(id),
  entrou_as integer not null,
  saiu_as integer,
  encerrada boolean not null default false
);
create unique index participacao_uma_aberta on participacao (sessao_id, jogador_id)
  where not encerrada;

create table turno (
  id uuid primary key default gen_random_uuid(),
  sessao_id uuid not null references sessao(id) on delete cascade,
  dealer_id uuid not null references dealer(id),
  numero integer not null,
  inicio integer not null,
  fim integer,
  unique (sessao_id, numero),
  check (fim is null or fim >= inicio)
);
-- N4: turnos não se sobrepõem — um aberto por sessão.
create unique index turno_um_aberto on turno (sessao_id) where fim is null;

create table movimentacao (
  id uuid primary key default gen_random_uuid(),
  sessao_id uuid not null references sessao(id) on delete cascade,
  participacao_id uuid references participacao(id),
  turno_id uuid not null references turno(id),
  tipo text not null check (tipo in ('retirada', 'devolucao', 'rake')),
  valor integer not null check (valor > 0),
  -- Duas horas, sempre. Sem elas o rake cai no dealer errado (N3).
  hora_ocorrencia integer not null,
  hora_digitacao integer not null,
  hora_confirmacao integer,
  situacao text not null check (situacao in ('aguardando','confirmada','recusada','cancelada')),
  confirmacao text check (confirmacao in ('presencial', 'contingencia')),
  -- PRD v1.7 §9: as duas justificativas em campos separados.
  motivo_limite text,
  motivo_contingencia text,
  -- O PRD exige "quem lançou" em cada movimentação. A coluna aceita nulo só
  -- para os testes de unidade, que rodam sem autenticação; o app sempre
  -- preenche. Quando houver mais de um operador, vire NOT NULL.
  lancado_por uuid references operador(id),
  criada_em timestamptz not null default now(),
  -- O rake pertence ao turno, não a um jogador.
  check ((tipo = 'rake') = (participacao_id is null)),
  -- N16: contingência exige motivo escrito.
  check (confirmacao is distinct from 'contingencia'
         or coalesce(btrim(motivo_contingencia), '') <> '')
);

create table checkpoint (
  id uuid primary key default gen_random_uuid(),
  sessao_id uuid not null references sessao(id) on delete cascade,
  numero integer not null,
  hora integer not null,
  contado_em integer not null,
  caixa_esperado integer not null,
  caixa_contado integer not null,
  diferenca integer not null,
  veredito text not null check (veredito in ('fechado','registrar','revisar','suspender')),
  janela_inicio integer not null,
  janela_fim integer not null,
  turno_id uuid not null references turno(id),
  turno_ids_na_janela uuid[] not null default '{}',
  rake_acumulado integer not null,
  final boolean not null default false,
  unique (sessao_id, numero),
  -- Nenhuma janela nasce invertida.
  check (janela_fim >= janela_inicio)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- Identidade da requisição
--
-- Substitui o `auth.uid()` do Supabase. O servidor faz, dentro da transação:
--
--     set local role caixa_app;
--     set local app.operador_id = '<uuid>';
--
-- `set local` morre com a transação — uma requisição nunca vaza identidade
-- para a seguinte.
-- ═══════════════════════════════════════════════════════════════════════════

create function app_operador_id() returns uuid
  language sql stable
  as $$ select nullif(current_setting('app.operador_id', true), '')::uuid $$;

-- SECURITY DEFINER de propósito: esta função é consultada DENTRO das políticas
-- de `operador`. Se ela mesma passasse por RLS, a política dependeria de si
-- própria para ser avaliada.
create function app_clube_id() returns uuid
  language sql stable security definer set search_path = public, pg_temp
  as $$ select o.clube_id from operador o where o.id = app_operador_id() $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS
--
-- Duas correções em relação ao que existia antes:
--
--   1. As políticas antigas só perguntavam "existe algum operador com este
--      id?" — nunca filtravam por clube. Qualquer operador autenticado lia os
--      dados de qualquer clube. Agora tudo é amarrado ao clube dele.
--   2. Nenhum `grant` existia (X12 do PRD). Os privilégios do banco local
--      vinham de comando aplicado à mão, e ambiente novo nascia quebrado.
-- ═══════════════════════════════════════════════════════════════════════════

alter table clube            enable row level security;
alter table operador         enable row level security;
alter table dealer           enable row level security;
alter table jogador          enable row level security;
alter table sessao           enable row level security;
alter table participacao     enable row level security;
alter table turno            enable row level security;
alter table movimentacao     enable row level security;
alter table checkpoint       enable row level security;

-- R1: um operador, um clube. Ele lê o próprio cadastro e mais nada.
create policy operador_le_o_proprio on operador for select
  using (id = app_operador_id());

create policy clube_o_seu on clube for select using (id = app_clube_id());

-- Tabelas que carregam o clube na própria linha.
do $$
declare t text;
begin
  foreach t in array array['dealer','jogador','sessao'] loop
    execute format($f$
      create policy %1$s_le     on %1$s for select using (clube_id = app_clube_id());
      create policy %1$s_insere on %1$s for insert with check (clube_id = app_clube_id());
      create policy %1$s_altera on %1$s for update using (clube_id = app_clube_id());
    $f$, t);
  end loop;
end $$;

-- Tabelas que chegam ao clube pela sessão.
do $$
declare t text;
begin
  foreach t in array array['participacao','turno','movimentacao','checkpoint'] loop
    execute format($f$
      create policy %1$s_le on %1$s for select using (
        sessao_id in (select s.id from sessao s where s.clube_id = app_clube_id())
      );
      create policy %1$s_insere on %1$s for insert with check (
        sessao_id in (select s.id from sessao s where s.clube_id = app_clube_id())
      );
      create policy %1$s_altera on %1$s for update using (
        sessao_id in (select s.id from sessao s where s.clube_id = app_clube_id())
      );
    $f$, t);
  end loop;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- O papel da aplicação — fecha o X12
--
-- Dono de tabela ignora RLS no Postgres. Por isso o servidor não trabalha como
-- dono: ele assume `caixa_app`, que não é dono de nada e por isso obedece às
-- políticas acima.
--
-- Repare no que NÃO está aqui: `delete`. A N13 — "nada é apagado" — deixa de
-- ser promessa do código e vira privilégio do banco. Nem um bug apaga a noite.
-- ═══════════════════════════════════════════════════════════════════════════

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'caixa_app') then
    create role caixa_app;
  end if;
end $$;

grant usage on schema public to caixa_app;
grant select, insert, update on
  clube, operador, dealer, jogador, sessao, participacao, turno, movimentacao, checkpoint
  to caixa_app;
grant execute on function app_operador_id(), app_clube_id() to caixa_app;

-- `set local role caixa_app` só funciona se quem conecta for membro do papel.
-- O nome de quem conecta muda conforme o ambiente (postgres, railway, neondb),
-- então a concessão é feita a quem estiver rodando a migration.
do $$ begin execute format('grant caixa_app to %I', current_user); end $$;
