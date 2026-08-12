---
owner: Anderson
version: v0.2
updated: 2026-08-11
status: rascunho
tipo: spec
gerado-de: PKG-Modelo-de-Dados-v1
---

# SPEC — Modelo de Dados Supabase (StackTrack)

> Gerado a partir de [[PKG-Modelo-de-Dados-v1]] · 12 fontes do vault.
> Status `rascunho` até rodar contra o Supabase e validar no modo sombra.

## Decisões estruturais

| Decisão | Motivo |
|---|---|
| **Um livro-razão único** (`movimentacoes`) com `dominio` = fichas ou financeiro | Um só relacionamento de aceite e uma só política de RLS. O invariante filtra por `dominio='fichas'` |
| **Saldo é derivado, nunca coluna** | Saldo denormalizado é a origem clássica de divergência. Vem de view |
| **Fichas ≠ dinheiro** | O invariante vale sobre fichas. Liquidação e pagamento de dealer são financeiro e não entram na conta |
| **Jogador e dealer não são usuários** | Sem linha em `auth.users`. Acesso por token de uso único, validado em RPC |
| **Consentimento LGPD é `not null`** | Não existe jogador cadastrado sem consentimento — a lei vira estrutura, não lembrete |

---

## 1. Extensões e enums

```sql
create extension if not exists "pgcrypto";   -- gen_random_uuid
create extension if not exists "btree_gist"; -- exclusão de turnos sobrepostos

create type papel_perfil as enum ('admin_geral', 'admin_clube');

create type dominio_movimentacao as enum ('fichas', 'financeiro');

create type tipo_movimentacao as enum (
  -- domínio FICHAS (entram no invariante)
  'buy_in',                 -- clube → jogador
  'recompra',               -- clube → jogador
  'devolucao',              -- jogador → clube
  'rake',                   -- mesa   → caixa do clube
  -- domínio FINANCEIRO (fora do invariante)
  'liquidacao_recebimento', -- jogador paga o clube
  'liquidacao_pagamento',   -- clube paga o jogador
  'quitacao_divida',        -- jogador quita dívida de sessão anterior
  'pagamento_dealer'        -- clube paga o dealer
);

create type status_movimentacao as enum (
  'pendente',      -- lançada, aguardando aceite. FICHA NÃO SAI
  'aceita',        -- contraparte confirmou
  'recusada',      -- contraparte recusou — sistema funcionando
  'contingencia',  -- aceite presencial, exige justificativa
  'cancelada'
);

create type forma_pagamento  as enum ('pix', 'dinheiro', 'cartao');
create type contraparte      as enum ('jogador', 'dealer');
create type status_jogador   as enum ('adimplente', 'devedor', 'bloqueado');
create type status_sessao    as enum ('aberta', 'encerrada', 'encerrada_com_divergencia');
create type status_divida    as enum ('aberta', 'acordada', 'quitada', 'vencida');
```

---

## 2. Clube e acesso

```sql
create table clubes (
  id                      uuid primary key default gen_random_uuid(),
  nome                    text not null,
  rake_percentual_dealer  numeric(5,2) not null
                          check (rake_percentual_dealer between 0 and 100),
  retencao_dias           integer not null default 1825,  -- LGPD: 5 anos
  criado_em               timestamptz not null default now()
);

-- Admins são os únicos usuários reais do sistema
create table perfis (
  id         uuid primary key references auth.users(id) on delete cascade,
  nome       text not null,
  papel      papel_perfil not null,
  criado_em  timestamptz not null default now()
);

create table perfis_clubes (
  perfil_id  uuid not null references perfis(id)  on delete cascade,
  clube_id   uuid not null references clubes(id)  on delete cascade,
  primary key (perfil_id, clube_id)
);
```

## 3. Jogadores e dealers

```sql
create table jogadores (
  id                     uuid primary key default gen_random_uuid(),
  clube_id               uuid not null references clubes(id) on delete restrict,
  nome                   text not null,
  whatsapp               text not null,
  cpf                    text,                       -- opcional por decisão de produto
  limite_credito         numeric(12,2) not null default 0
                         check (limite_credito >= 0), -- varia por jogador
  status                 status_jogador not null default 'adimplente',
  consentimento_lgpd_em  timestamptz not null,        -- LGPD por estrutura
  retencao_ate           date,
  criado_em              timestamptz not null default now()
);
create unique index jogadores_clube_whatsapp_uq on jogadores (clube_id, whatsapp);

-- Cadastro PERMANENTE e GLOBAL (DEC-004 + DEC-005).
-- O mesmo dealer freela roda em mais de um clube: identidade única.
create table dealers (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  whatsapp   text not null unique,
  ativo      boolean not null default true,
  criado_em  timestamptz not null default now()
);

-- Vínculo dealer ↔ clube. Um dealer pode servir vários clubes.
create table dealers_clubes (
  dealer_id     uuid not null references dealers(id)  on delete restrict,
  clube_id      uuid not null references clubes(id)   on delete cascade,
  ativo         boolean not null default true,
  vinculado_em  timestamptz not null default now(),
  primary key (dealer_id, clube_id)
);
```

## 4. Sessão, turnos e participação

```sql
create table sessoes (
  id                   uuid primary key default gen_random_uuid(),
  clube_id             uuid not null references clubes(id) on delete restrict,
  aberta_em            timestamptz not null default now(),
  encerrada_em         timestamptz,
  caixa_inicial_fichas numeric(12,2) not null default 0,
  status               status_sessao not null default 'aberta',
  divergencia_apurada  numeric(12,2),
  criado_por           uuid not null references perfis(id),
  check (encerrada_em is null or encerrada_em > aberta_em)
);

-- DEC-003: uma mesa por sessão ⇒ uma sessão aberta por clube
create unique index sessoes_uma_aberta_por_clube
  on sessoes (clube_id) where status = 'aberta';

-- Turnos SEQUENCIAIS, sem sobreposição — garantido pelo banco
create table turnos_dealer (
  id         uuid primary key default gen_random_uuid(),
  sessao_id  uuid not null references sessoes(id)  on delete cascade,
  dealer_id  uuid not null references dealers(id)  on delete restrict,
  periodo    tstzrange not null,
  criado_em  timestamptz not null default now(),
  exclude using gist (sessao_id with =, periodo with &&)
);

create table participacoes (
  id            uuid primary key default gen_random_uuid(),
  sessao_id     uuid not null references sessoes(id)    on delete cascade,
  jogador_id    uuid not null references jogadores(id)  on delete restrict,
  entrou_em     timestamptz not null default now(),
  encerrada_em  timestamptz,
  unique (sessao_id, jogador_id)
);
```

## 5. Livro-razão

```sql
create table movimentacoes (
  id                        uuid primary key default gen_random_uuid(),
  sessao_id                 uuid references sessoes(id)        on delete restrict,
  participacao_id           uuid references participacoes(id)  on delete restrict,
  turno_dealer_id           uuid references turnos_dealer(id)  on delete restrict,
  dealer_id                 uuid references dealers(id)        on delete restrict,

  dominio                   dominio_movimentacao not null,
  tipo                      tipo_movimentacao    not null,
  valor                     numeric(12,2) not null check (valor > 0),
  forma                     forma_pagamento,
  parcelas                  smallint check (parcelas is null or parcelas >= 1),
  status                    status_movimentacao not null default 'pendente',

  -- DEC-003: dois timestamps distintos
  hora_evento               timestamptz not null default now(), -- quando ocorreu de fato
  hora_lancamento           timestamptz not null default now(), -- quando entrou no sistema

  lancado_por               uuid not null references perfis(id),
  justificativa_contingencia text,
  criado_em                 timestamptz not null default now(),

  constraint dominio_coerente check (
    (tipo in ('buy_in','recompra','devolucao','rake') and dominio = 'fichas')
    or (tipo in ('liquidacao_recebimento','liquidacao_pagamento',
                 'quitacao_divida','pagamento_dealer') and dominio = 'financeiro')
  ),
  -- rake sempre atribuído a um turno (base do pagamento do dealer)
  constraint rake_exige_turno check (tipo <> 'rake' or turno_dealer_id is not null),
  -- movimentação de jogador sempre ligada a uma participação
  constraint jogador_exige_participacao check (
    tipo not in ('buy_in','recompra','devolucao',
                 'liquidacao_recebimento','liquidacao_pagamento')
    or participacao_id is not null
  ),
  constraint pagamento_exige_dealer check (
    tipo <> 'pagamento_dealer' or dealer_id is not null
  ),
  -- contingência nunca é silenciosa
  constraint contingencia_justificada check (
    status <> 'contingencia' or justificativa_contingencia is not null
  ),
  -- cartão parcelado só na cobrança ao jogador
  constraint parcela_so_em_cartao check (
    parcelas is null or (forma = 'cartao' and tipo = 'liquidacao_recebimento')
  )
);

create index on movimentacoes (sessao_id, dominio, status);
create index on movimentacoes (turno_dealer_id) where tipo = 'rake';
```

## 6. Prova de aceite

```sql
create table aceites (
  id                uuid primary key default gen_random_uuid(),
  movimentacao_id   uuid not null unique
                    references movimentacoes(id) on delete restrict,
  contraparte       contraparte not null,
  jogador_id        uuid references jogadores(id),
  dealer_id         uuid references dealers(id),
  valor_confirmado  numeric(12,2) not null,
  assinatura_url    text not null,   -- Supabase Storage
  dispositivo       text,
  ip                inet,
  aceito_em         timestamptz not null default now(),

  constraint contraparte_coerente check (
    (contraparte = 'jogador' and jogador_id is not null and dealer_id is null)
    or (contraparte = 'dealer' and dealer_id is not null and jogador_id is null)
  )
);

-- Acesso do jogador e do dealer: token de uso único, nunca login
create table tokens_aceite (
  id               uuid primary key default gen_random_uuid(),
  movimentacao_id  uuid not null references movimentacoes(id) on delete cascade,
  token_hash       text not null unique,   -- guarda o hash, nunca o token
  expira_em        timestamptz not null,
  usado_em         timestamptz,
  criado_em        timestamptz not null default now()
);
create index on tokens_aceite (movimentacao_id) where usado_em is null;
```

## 7. Dívida e obrigações

```sql
create table dividas (
  id              uuid primary key default gen_random_uuid(),
  jogador_id      uuid not null references jogadores(id) on delete restrict,
  sessao_id       uuid not null references sessoes(id)   on delete restrict,
  valor_original  numeric(12,2) not null check (valor_original > 0),
  status          status_divida not null default 'aberta',
  criado_em       timestamptz not null default now(),
  unique (jogador_id, sessao_id)
);

create table acordos_divida (
  id              uuid primary key default gen_random_uuid(),
  divida_id       uuid not null references dividas(id) on delete cascade,
  valor           numeric(12,2) not null check (valor > 0),
  forma           forma_pagamento,
  vence_em        date not null,
  aceito_em       timestamptz,          -- discricionário na condição,
  assinatura_url  text,                 -- obrigatório no registro
  criado_em       timestamptz not null default now()
);

create table tentativas_cobranca (
  id          uuid primary key default gen_random_uuid(),
  divida_id   uuid not null references dividas(id) on delete cascade,
  canal       text not null default 'whatsapp',
  observacao  text,
  criado_em   timestamptz not null default now()
);

-- Pagamento diferido ao dealer, acumulando entre sessões (DEC-004)
create table obrigacoes_dealer (
  id            uuid primary key default gen_random_uuid(),
  dealer_id     uuid not null references dealers(id)  on delete restrict,
  sessao_id     uuid not null references sessoes(id)  on delete restrict,
  rake_apurado  numeric(12,2) not null,
  percentual    numeric(5,2)  not null,
  valor_devido  numeric(12,2) not null,
  quitada_em    timestamptz,
  criado_em     timestamptz not null default now(),
  unique (dealer_id, sessao_id)
);
```

---

## 8. Views — saldo e conciliação

```sql
-- Saldo do jogador na sessão. Só conta aceite válido.
create view v_saldo_participacao as
select
  p.id          as participacao_id,
  p.sessao_id,
  p.jogador_id,
  coalesce(sum(
    case m.tipo
      when 'devolucao' then  m.valor
      when 'buy_in'    then -m.valor
      when 'recompra'  then -m.valor
    end
  ), 0) as saldo
from participacoes p
left join movimentacoes m
  on  m.participacao_id = p.id
  and m.dominio = 'fichas'
  and m.status in ('aceita', 'contingencia')
group by p.id, p.sessao_id, p.jogador_id;

-- O detector de furo
create view v_conciliacao_sessao as
with saldos as (
  select sessao_id, sum(saldo) as soma_saldos
  from v_saldo_participacao group by sessao_id
),
rake as (
  select sessao_id, sum(valor) as rake_validado
  from movimentacoes
  where tipo = 'rake' and status in ('aceita', 'contingencia')
  group by sessao_id
),
rake_pendente as (
  select sessao_id, sum(valor) as rake_pendente
  from movimentacoes
  where tipo = 'rake' and status = 'pendente'
  group by sessao_id
)
select
  s.id as sessao_id,
  coalesce(sa.soma_saldos, 0)                                as soma_saldos,
  coalesce(r.rake_validado, 0)                               as rake_validado,
  coalesce(rp.rake_pendente, 0)                              as rake_pendente,
  coalesce(sa.soma_saldos, 0) + coalesce(r.rake_validado, 0) as divergencia,
  case
    when coalesce(sa.soma_saldos,0) + coalesce(r.rake_validado,0) = 0 then 'integro'
    when coalesce(rp.rake_pendente, 0) > 0                            then 'rake_pendente'
    else 'furo'
  end as estado
from sessoes s
left join saldos        sa on sa.sessao_id = s.id
left join rake          r  on r.sessao_id  = s.id
left join rake_pendente rp on rp.sessao_id = s.id;
```

> ⚠️ A coluna `estado` implementa a regra de alerta de
> [[SOP-Conferencia-de-Caixa]]: com rake pendente, divergência é
> **esperada** e não deve alertar. Só vira `furo` quando não há rake
> aguardando lançamento. É o que impede o falso positivo a cada 30 min.

### Query do invariante

```sql
-- Σ saldos = − rake  ⟺  divergencia = 0
select sessao_id, soma_saldos, rake_validado, divergencia, estado
from v_conciliacao_sessao
where sessao_id = $1;
```

### Exposição de crédito do jogador

```sql
create view v_exposicao_jogador as
select
  j.id as jogador_id,
  j.nome,
  j.limite_credito,
  coalesce((select sum(d.valor_original) from dividas d
            where d.jogador_id = j.id and d.status in ('aberta','acordada','vencida')), 0)
    as divida_aberta,
  coalesce((select count(*) from dividas d
            where d.jogador_id = j.id and d.status = 'vencida'), 0)
    as acordos_vencidos
from jogadores j;
```

> Esta view é a resposta ao gargalo **C2** de [[SOP-Cobranca-de-Jogador-Devedor]]:
> o dono deixa de decidir de memória. O sistema não decide — mostra.

---

## 9. RLS — isolamento por clube

```sql
alter table clubes            enable row level security;
alter table jogadores         enable row level security;
alter table dealers           enable row level security;
alter table sessoes           enable row level security;
alter table turnos_dealer     enable row level security;
alter table participacoes     enable row level security;
alter table movimentacoes     enable row level security;
alter table aceites           enable row level security;
alter table tokens_aceite     enable row level security;
alter table dividas           enable row level security;
alter table acordos_divida    enable row level security;
alter table obrigacoes_dealer enable row level security;

-- Helper: clubes que o perfil autenticado enxerga
create or replace function public.clubes_do_usuario()
returns setof uuid
language sql stable security definer set search_path = public as $$
  select c.id from clubes c
  where exists (select 1 from perfis p
                where p.id = auth.uid() and p.papel = 'admin_geral')
     or exists (select 1 from perfis_clubes pc
                where pc.perfil_id = auth.uid() and pc.clube_id = c.id);
$$;

create policy clube_visivel on clubes
  for all to authenticated
  using (id in (select clubes_do_usuario()));

create policy jogadores_do_clube on jogadores
  for all to authenticated
  using (clube_id in (select clubes_do_usuario()));

create policy sessoes_do_clube on sessoes
  for all to authenticated
  using (clube_id in (select clubes_do_usuario()));

create policy movimentacoes_do_clube on movimentacoes
  for all to authenticated
  using (sessao_id in (select id from sessoes
                       where clube_id in (select clubes_do_usuario())));
-- (demais tabelas seguem o mesmo padrão, via sessao_id ou clube_id)
```

### Dealer global — identidade compartilhada, financeiro isolado

O mesmo dealer atende mais de um clube. Isso cria uma fronteira de
privacidade que a RLS precisa respeitar:

| Dado do dealer | Visibilidade |
|---|---|
| Nome, WhatsApp, vínculo | Clubes aos quais está vinculado |
| Turnos, rake apurado, obrigações, pagamentos | **Somente o clube da sessão** |

```sql
alter table dealers        enable row level security;
alter table dealers_clubes enable row level security;

-- Identidade: visível a quem tem vínculo com o dealer
create policy dealer_visivel on dealers
  for select to authenticated
  using (exists (select 1 from dealers_clubes dc
                 where dc.dealer_id = dealers.id
                   and dc.clube_id in (select clubes_do_usuario())));

create policy vinculo_do_clube on dealers_clubes
  for all to authenticated
  using (clube_id in (select clubes_do_usuario()));

-- Financeiro: isolado pelo clube da sessão
create policy obrigacao_do_clube on obrigacoes_dealer
  for all to authenticated
  using (sessao_id in (select id from sessoes
                       where clube_id in (select clubes_do_usuario())));

-- Turno só existe dentro de uma sessão — herda o isolamento
create policy turno_do_clube on turnos_dealer
  for all to authenticated
  using (sessao_id in (select id from sessoes
                       where clube_id in (select clubes_do_usuario())));
```

> ⚠️ **Regra de negócio:** só é possível alocar em um turno um dealer
> **vinculado ao clube da sessão**. Validar no app e, preferencialmente,
> em trigger — a FK sozinha não garante isso.

### Saldo devido ao dealer, por clube

```sql
create view v_saldo_dealer_por_clube as
select
  o.dealer_id,
  s.clube_id,
  sum(o.valor_devido) filter (where o.quitada_em is null) as valor_em_aberto,
  count(*)            filter (where o.quitada_em is null) as sessoes_em_aberto,
  max(s.aberta_em)    filter (where o.quitada_em is null) as sessao_mais_recente
from obrigacoes_dealer o
join sessoes s on s.id = o.sessao_id
group by o.dealer_id, s.clube_id;
```

Resolve o problema de [[SOP-Pagamento-Diferido-ao-Dealer]]: *"o clube
deve R$ 840 ao Fulano, de 3 sessões"* — e sem vazar para o outro clube.

### Acesso de jogador e dealer — não passa por RLS

Jogador e dealer não existem em `auth.users`. O aceite é feito por
**RPC com `security definer`**, que valida o token e é a única porta de
entrada — a tabela nunca é exposta diretamente ao anônimo.

```sql
create or replace function public.registrar_aceite(
  p_token       text,
  p_assinatura  text,
  p_dispositivo text,
  p_ip          inet
) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_mov uuid; v_tok tokens_aceite%rowtype;
begin
  select * into v_tok from tokens_aceite
   where token_hash = encode(digest(p_token, 'sha256'), 'hex')
     and usado_em is null and expira_em > now()
   for update;

  if not found then
    raise exception 'token inválido ou expirado';
  end if;

  update tokens_aceite set usado_em = now() where id = v_tok.id;

  insert into aceites (movimentacao_id, contraparte, jogador_id, dealer_id,
                       valor_confirmado, assinatura_url, dispositivo, ip)
  select m.id,
         case when m.tipo = 'rake' then 'dealer' else 'jogador' end::contraparte,
         case when m.tipo = 'rake' then null else pa.jogador_id end,
         case when m.tipo = 'rake' then td.dealer_id else null end,
         m.valor, p_assinatura, p_dispositivo, p_ip
    from movimentacoes m
    left join participacoes  pa on pa.id = m.participacao_id
    left join turnos_dealer  td on td.id = m.turno_dealer_id
   where m.id = v_tok.movimentacao_id
  returning movimentacao_id into v_mov;

  update movimentacoes set status = 'aceita' where id = v_mov;
  return v_mov;
end; $$;
```

---

## 10. Como as regras do playbook viraram estrutura

| Regra do playbook | Onde vive no banco |
|---|---|
| Ficha não sai sem aceite | `status` inicia em `pendente`; app só libera em `aceita` |
| Toda movimentação tem prova | `aceites.movimentacao_id` **unique** |
| Contingência nunca é silenciosa | `constraint contingencia_justificada` |
| Rake atribuído por `hora_retirada` | `hora_evento` ≠ `hora_lancamento` + `rake_exige_turno` |
| Turnos não se sobrepõem | `exclude using gist` |
| Uma mesa por sessão | índice único parcial em `sessoes` |
| Invariante Σ saldos = −rake | `v_conciliacao_sessao.divergencia` |
| Alerta só após lançar rake | `v_conciliacao_sessao.estado` |
| Limite de crédito por jogador | `jogadores.limite_credito` + `v_exposicao_jogador` |
| Pagamento de dealer acumula | `obrigacoes_dealer` sem `quitada_em` |
| LGPD com consentimento | `consentimento_lgpd_em not null` |
| Jogador não é usuário | sem FK para `auth.users`; RPC + token |

**12 de 12 regras representadas em estrutura, não em comentário.**

---

## 11. Pontos em aberto

- [x] ~~Dealer freela entre clubes~~ · resolvido: `dealers` global +
      `dealers_clubes`, com financeiro isolado por clube na RLS
- [ ] 🔴 **ADJ-1** — a verificação de limite de crédito deve somar
      movimentações `aceita` **+ `pendente`**. Contando só aceitas, duas
      retiradas simultâneas passam o teto (caso B4 de
      [[ARV-Limites-de-Autoridade]]). Ajustar `v_exposicao_jogador`
- [ ] 🔴 **ADJ-3** — ao encerrar `participacoes`, cancelar em cascata as
      `movimentacoes` com status `pendente` e invalidar os
      `tokens_aceite` correspondentes. Sem isso, jogador que saiu da mesa
      pode aceitar retirada nunca entregue (caso B1)
- [ ] **CPF em claro:** avaliar `pgcrypto` ou Vault do Supabase. Hoje é `text`
- [ ] **Trigger de vínculo:** impedir alocar em turno um dealer não vinculado ao clube da sessão
- [ ] **Retenção LGPD:** `retencao_dias` existe, falta o job que expurga
- [ ] **Assinatura:** definir formato (SVG de traço vs PNG) e bucket no Storage
- [ ] **Envio do link por WhatsApp:** fora do banco — definir se é API oficial ou envio manual no piloto
- [ ] Rodar o DDL e validar as constraints com casos de borda

## Changelog

| Versão | Data | O que mudou |
|---|---|---|
| v0.1 | 2026-08-11 | Geração inicial a partir de [[PKG-Modelo-de-Dados-v1]] |
| v0.2 | 2026-08-11 | Dealer vira entidade global (`dealers` + `dealers_clubes`); RLS separa identidade compartilhada de financeiro isolado por clube; view `v_saldo_dealer_por_clube` |
