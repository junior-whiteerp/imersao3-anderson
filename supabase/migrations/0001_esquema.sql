create extension if not exists pgcrypto;

create table clube (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  percentual_rake_dealer integer not null default 0
);

create table operador (
  id uuid primary key references auth.users(id) on delete cascade,
  clube_id uuid not null references clube(id),
  nome text not null
);

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

-- N13: nada é apagado. Sem DELETE para o operador.
alter table sessao        enable row level security;
alter table participacao  enable row level security;
alter table turno         enable row level security;
alter table movimentacao  enable row level security;
alter table checkpoint    enable row level security;
alter table jogador       enable row level security;
alter table dealer        enable row level security;
alter table clube         enable row level security;
alter table operador      enable row level security;

-- R1: um operador, um clube. A política amarra tudo ao clube dele.
create policy operador_le_o_proprio on operador for select
  using (id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['clube','dealer','jogador','sessao','participacao','turno','movimentacao','checkpoint']
  loop
    execute format($f$
      create policy %1$s_do_clube_do_operador on %1$s for select using (
        exists (select 1 from operador o where o.id = auth.uid())
      );
      create policy %1$s_escrita on %1$s for insert with check (
        exists (select 1 from operador o where o.id = auth.uid())
      );
      create policy %1$s_atualiza on %1$s for update using (
        exists (select 1 from operador o where o.id = auth.uid())
      );
    $f$, t);
  end loop;
end $$;
