# Caixa Vivo — Fatia Vertical (Dia 1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Colocar de pé uma noite real do Caixa Vivo — abrir sessão, abrir turno, cadastrar e sentar jogador, lançar ficha com confirmação na tela girada, registrar contingência, lançar rake e ver o veredito do checkpoint — com tudo persistido em Postgres de verdade, usando os componentes exportados sem redesenhá-los.

**Architecture:** Repositório novo (`caixa-vivo/`), separado do Design OS. Os componentes de `product-plan/` são copiados **literalmente** e nunca editados: eles recebem props e disparam callbacks. As regras de negócio vêm de `product-plan/regras/` (também copiadas sem alteração) e continuam sendo a única fonte de verdade — o Postgres reforça, por constraint, apenas os invariantes que nunca podem ser violados. O ciclo de escrita é **carregar → reduzir → persistir delta**: cada ação carrega as linhas da sessão, monta o objeto `Noite`, roda o `reducer` já provado, e grava só as linhas novas ou alteradas.

**Tech Stack:** Vite 7 · React 19 · TypeScript 5.9 · Tailwind CSS v4 · Supabase (Postgres + Auth, CLI local via Docker) · Vitest 3 · Testing Library

---

## Global Constraints

- **Não redesenhar componente exportado.** Arquivos sob `src/sections/`, `src/shell/` e `src/regras/` são cópias byte a byte de `product-plan/`. Se um comportamento exigir mudança neles, **pare e registre** — não edite.
- **Tailwind CSS v4.** Sem `tailwind.config.js`. Sem cor customizada: só a paleta embutida.
- **A regra de cor do PRD.** Verde, âmbar e vermelho pertencem ao veredito do caixa e a mais nada. Ação primária é ciano (`cv-ch-live`). Vem da regra N8; um botão verde já gasta o canal que devia avisar do furo.
- **Tema do produto em `data-cv-tema`**, nunca na classe `dark` do documento. Escuro é o padrão.
- **Português no código e na interface.** Nomes de arquivo, função e variável em PT-BR, seguindo o padrão dos arquivos exportados.
- **Dinheiro em centavos inteiros?** Não. O produto inteiro trabalha com **reais inteiros** (`integer`), sem centavos — fichas de poker não têm centavo. Não introduza `numeric`.
- **Horas em `Minutos`**: inteiro de minutos desde a meia-noite do dia em que a sessão abriu, podendo passar de 1440. É o tipo `Minutos` de `regras/modelo.ts`.
- **`npm`**, não pnpm — o projeto é isolado e não faz parte do monorepo.
- Toda tarefa termina com commit. Mensagens em português, prefixo convencional (`feat:`, `test:`, `chore:`).

---

## Escopo desta fatia

### O que entra

| PRD | O que é | Por que está aqui |
|---|---|---|
| **F1** | Abrir sessão com caixa inicial | Sem ela não existe noite |
| **F5** | Abrir e trocar turno de dealer | O rake precisa de turno para pertencer a alguém |
| **F10** | Cadastro do jogador | **Não cortável** (PRD §8) |
| **F2** | Sentar jogador na mesa | Sem mesa não há lançamento |
| **F3** | Lançar retirada **com a tela girada** | A tela de confirmação é **não cortável** (PRD §8) |
| **F11** | Registro de contingência | **Não cortável** (PRD §8) |
| **F8** | Limite de crédito com liberação registrada | Vem quase de graça: o `reducer` já implementa N6 e N10, e `LancarRetirada` já desenha |
| **F6** | Lançar rake com hora de ocorrência | Dispara o checkpoint |
| **F7** | Painel de conciliação com checkpoint | **Não cortável** — sem ele não existe produto (PRD §8) |

### O que NÃO entra hoje — e continua no MVP

Estas quatro **não saem do escopo do MVP**. Elas são os próximos incrementos, cada uma com plano próprio:

| PRD | O que é | Por que fica para o incremento seguinte |
|---|---|---|
| **F4** | Devolução e fechamento de conta com extrato | Precisa de contagem física e do extrato linha a linha. É a próxima fatia, sozinha |
| **F1 (metade)** | **Encerrar** a sessão | N11 não deixa encerrar com jogador na mesa, e esvaziar a mesa exige F4. Encerrar anda junto com F4, não antes |
| **F9** | Relatório da sessão | Depende de F4: sem fechamento de conta não há noite encerrada |
| **F12** | Painel da noite | O próprio PRD v1.7 o coloca como **primeiro a cair** — ele não guarda regra nenhuma |
| — | Mesa visual "Ao vivo" | Pendência **D4** do PRD: foi construída contra o que estava escrito e aguarda decisão do dono do processo |

⚠️ **Ao fim desta fatia o produto ainda não é o MVP.** Ele é a espinha do MVP, com o coração (passo 7 do PRD) batendo de ponta a ponta e persistido. Não apresente esta fatia como "MVP pronto".

---

## Integrações obrigatórias, credenciais e contingência honesta

| # | Integração | Credencial | Depende de autorização externa? | Contingência honesta |
|---|---|---|---|---|
| 1 | **Supabase Postgres** (produção) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | **Sim** — só o dono da conta cria o projeto | O app **não sobe** sem as duas variáveis: lança erro no boot com a mensagem exata do que falta. **Nunca** cai para dados de exemplo. Task 3 tem teste que prova isso |
| 2 | **Supabase Auth** (operador) | Conta de e-mail e senha, criada à mão no painel | **Sim** — mesma conta acima | Sem conta criada, o login falha com o erro real do Supabase. Não existe caminho de bypass. Task 7 |
| 3 | **Supabase CLI local** (testes) | Nenhuma — roda em Docker | Não, mas **exige Docker rodando** | Sem Docker, os testes de banco **falham com a razão** (`banco de teste indisponível`). Não são pulados em silêncio: um teste pulado passando de verde é mentira. Task 2 |
| 4 | **Google Fonts** (Instrument Serif/Sans, Azeret Mono) | Nenhuma | Não | Rede do clube pode bloquear. A pilha de fallback já está nos tokens (`ui-serif`, `system-ui`, `ui-monospace`). O app fica feio, não quebra |
| 5 | **WhatsApp** | — | — | ⚠️ **Não é integração nesta versão.** O PRD §13 é explícito: *"Envio de mensagem por WhatsApp — nada é enviado nesta versão"*. O WhatsApp é **campo obrigatório de cadastro** (N15), não canal. **Não construa envio.** |

**Risco R2 do PRD — internet cair.** Não há modo offline, e não vamos inventar um. Toda falha de rede vira erro visível na tela, com o que o operador deve fazer. Nada de fila silenciosa que finge ter salvado.

---

## Estrutura de arquivos

```
caixa-vivo/                              ← repositório NOVO, irmão do Design OS
├── .env.example                          Task 3
├── .env.local                            (não versionado)
├── index.html                            Task 1
├── package.json                          Task 1
├── vite.config.ts                        Task 1
├── vitest.config.ts                      Task 1
├── supabase/
│   ├── config.toml                       Task 2
│   ├── migrations/0001_esquema.sql       Task 2
│   └── seed.sql                          Task 2
├── src/
│   ├── main.tsx                          Task 1
│   ├── App.tsx                           Task 8
│   ├── index.css                         Task 1  (tokens copiados)
│   ├── regras/                           Task 1  (CÓPIA — não editar)
│   │   ├── modelo.ts
│   │   └── reducer.ts
│   ├── sections/                         Task 1  (CÓPIA — não editar)
│   ├── shell/                            Task 1  (CÓPIA — não editar)
│   ├── dados/
│   │   ├── supabase.ts                   Task 3  cliente + guarda de credenciais
│   │   ├── tipos-banco.ts                Task 4  linhas do Postgres
│   │   ├── relogio.ts                    Task 4  agoraEmMinutos
│   │   ├── carregarNoite.ts              Task 4  linhas → Noite
│   │   ├── persistirDelta.ts             Task 5  Noite antes/depois → escritas
│   │   └── aplicar.ts                    Task 6  carregar → reduzir → persistir
│   ├── auth/
│   │   └── useOperador.ts                Task 7
│   ├── estado/
│   │   └── NoiteProvider.tsx             Task 8  carregando | pronto | erro
│   └── telas/
│       ├── SessaoTela.tsx                Task 9
│       ├── MesaTela.tsx                  Task 10
│       ├── FichasTela.tsx                Task 11
│       ├── RakeTela.tsx                  Task 12
│       └── CaixaTela.tsx                 Task 12
└── testes/
    ├── setup.ts                          Task 1
    ├── banco.ts                          Task 2  helpers de limpeza
    ├── relogio.test.ts                   Task 4
    ├── carregarNoite.test.ts             Task 4
    ├── persistirDelta.test.ts            Task 5
    ├── aplicar.test.ts                   Task 6
    ├── sem-dados-simulados.test.ts       Task 13
    └── fluxo-da-noite.test.ts            Task 14
```

**Por que `dados/` é separado de `telas/`:** as telas só traduzem `Noite` para as props que os componentes exportados esperam e despacham ações. Nenhuma tela fala com o Supabase. Quando a persistência mudar, `telas/` não muda.

---

## Task 1: Esqueleto do projeto e as regras já provadas

**Files:**
- Create: `caixa-vivo/package.json`, `caixa-vivo/vite.config.ts`, `caixa-vivo/vitest.config.ts`, `caixa-vivo/tsconfig.json`, `caixa-vivo/index.html`, `caixa-vivo/src/main.tsx`, `caixa-vivo/src/index.css`, `caixa-vivo/testes/setup.ts`
- Copy (sem editar): `product-plan/regras/{modelo,reducer}.ts` → `caixa-vivo/src/regras/`
- Copy (sem editar): `product-plan/sections/**` → `caixa-vivo/src/sections/**` (só `components/`)
- Copy (sem editar): `product-plan/shell/components/**` → `caixa-vivo/src/shell/components/`
- Copy: `product-plan/regras/provas/*.ts` → `caixa-vivo/testes/provas/`

**Interfaces:**
- Consumes: nada
- Produces: `src/regras/modelo.ts` exportando `type Noite`, `type Minutos`, `paraMinutos(hora: string): Minutos`, `formatarHora(m: Minutos): string`, `formatarDuracao(m: Minutos): string`, `reais(v: number): string`, `TETO_CONTINGENCIAS: 3`; `src/regras/reducer.ts` exportando `reducer(noite: Noite, acao: Acao): Noite` e `type Acao`.

- [ ] **Step 1: Criar o projeto e instalar**

```bash
mkdir -p caixa-vivo && cd caixa-vivo
npm init -y
npm i react@^19 react-dom@^19 @supabase/supabase-js@^2 lucide-react@^0.554 react-router-dom@^7
npm i -D vite@^7 @vitejs/plugin-react@^5 typescript@~5.9 @types/react@^19 @types/react-dom@^19 \
  tailwindcss@^4 @tailwindcss/vite@^4 vitest@^3 jsdom@^25 \
  @testing-library/react@^16 @testing-library/user-event@^14 @testing-library/jest-dom@^6 supabase@^1
```

- [ ] **Step 2: Copiar componentes e regras — sem abrir para editar**

```bash
# do diretório caixa-vivo/, com o Design OS como irmão
DESIGN=../imersao-teste-design/product-plan
mkdir -p src/regras src/shell src/sections testes/provas
cp $DESIGN/regras/modelo.ts $DESIGN/regras/reducer.ts src/regras/
cp -R $DESIGN/shell/components src/shell/components
cp $DESIGN/regras/provas/*.ts testes/provas/
for s in sessao-e-caixa jogadores-e-mesa fichas turnos-e-rake conciliacao-e-relatorio; do
  mkdir -p "src/sections/$s"
  cp -R "$DESIGN/sections/$s/components" "src/sections/$s/components"
done
cp $DESIGN/design-system/tokens.css src/tokens.css
```

- [ ] **Step 3: Configuração**

`caixa-vivo/vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { port: 3400, strictPort: false },
})
```

`caixa-vivo/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./testes/setup.ts'],
    include: ['testes/**/*.test.ts', 'testes/**/*.test.tsx'],
  },
})
```

`caixa-vivo/testes/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest'
```

`caixa-vivo/src/index.css`:
```css
@import 'tailwindcss';
@import './tokens.css';

html, body, #root { height: 100%; }
```

`caixa-vivo/package.json` — adicionar aos `scripts`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "provas": "vitest run testes/provas",
    "banco:subir": "supabase start",
    "banco:reset": "supabase db reset"
  }
}
```

- [ ] **Step 4: Rodar as provas herdadas — elas devem passar sem nenhuma alteração**

As três suítes exportadas provam as regras. Elas foram escritas como scripts de nó; converta-as para Vitest **sem tocar na lógica**, envolvendo cada bloco `── TÍTULO ──` num `it()`. Se alguma falhar, a cópia foi corrompida.

Run: `npm run provas`
Expected: PASS — 37 asserções verdes, três suítes.

- [ ] **Step 5: Commit**

```bash
git init && git add -A
git commit -m "chore: esqueleto do projeto com componentes e regras exportados"
```

---

## Task 2: Esquema no Postgres, com os invariantes que não podem depender do cliente

**Files:**
- Create: `caixa-vivo/supabase/migrations/0001_esquema.sql`
- Create: `caixa-vivo/supabase/seed.sql`
- Create: `caixa-vivo/testes/banco.ts`

**Interfaces:**
- Consumes: nada
- Produces: `testes/banco.ts` exportando `clienteDeTeste(): SupabaseClient`, `limparBanco(): Promise<void>`, `CLUBE_TESTE: string` (uuid fixo), `DEALER_JOAO: string`, `DEALER_MARCOS: string`

> **Por que constraint no banco se o `reducer` já valida?** Porque o `reducer` roda no navegador. Um operador com o DevTools aberto, um bug de corrida entre duas abas, ou um retry de rede podem produzir duas sessões abertas. Os invariantes abaixo são os que, se violados, **corrompem a conta do caixa** — e a conta é o produto. Os demais (limite, teto de contingência, faixas do veredito) ficam só no `reducer`, porque violá-los degrada a operação sem corromper o registro.

- [ ] **Step 1: Escrever o teste que falha**

`caixa-vivo/testes/banco.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { clienteDeTeste, limparBanco, CLUBE_TESTE, DEALER_JOAO } from './banco'

const db = clienteDeTeste()

describe('invariantes do banco', () => {
  beforeEach(limparBanco)

  it('N1 — recusa uma segunda sessão aberta no mesmo clube', async () => {
    const primeira = await db.from('sessao')
      .insert({ clube_id: CLUBE_TESTE, aberta_em: new Date().toISOString(), caixa_inicial: 20000 })
    expect(primeira.error).toBeNull()

    const segunda = await db.from('sessao')
      .insert({ clube_id: CLUBE_TESTE, aberta_em: new Date().toISOString(), caixa_inicial: 5000 })
    expect(segunda.error?.code).toBe('23505')
  })

  it('N4 — recusa dois turnos abertos na mesma sessão', async () => {
    const { data: s } = await db.from('sessao')
      .insert({ clube_id: CLUBE_TESTE, aberta_em: new Date().toISOString(), caixa_inicial: 20000 })
      .select().single()

    await db.from('turno').insert({ sessao_id: s!.id, dealer_id: DEALER_JOAO, numero: 1, inicio: 1140 })
    const segundo = await db.from('turno')
      .insert({ sessao_id: s!.id, dealer_id: DEALER_JOAO, numero: 2, inicio: 1200 })
    expect(segundo.error?.code).toBe('23505')
  })

  it('N15 — recusa jogador sem dígito no WhatsApp', async () => {
    const r = await db.from('jogador').insert({
      clube_id: CLUBE_TESTE, nome: 'Sem Zap', whatsapp: 'não informou',
      limite: 3000, consentimento_em: new Date().toISOString(),
    })
    expect(r.error?.code).toBe('23514')
  })

  it('N16 — recusa contingência sem motivo escrito', async () => {
    const { data: s } = await db.from('sessao')
      .insert({ clube_id: CLUBE_TESTE, aberta_em: new Date().toISOString(), caixa_inicial: 20000 })
      .select().single()
    const { data: t } = await db.from('turno')
      .insert({ sessao_id: s!.id, dealer_id: DEALER_JOAO, numero: 1, inicio: 1140 })
      .select().single()

    const r = await db.from('movimentacao').insert({
      sessao_id: s!.id, turno_id: t!.id, tipo: 'rake', valor: 180,
      hora_ocorrencia: 1175, hora_digitacao: 1177,
      situacao: 'confirmada', confirmacao: 'contingencia', motivo_contingencia: '   ',
    })
    expect(r.error?.code).toBe('23514')
  })

  it('nenhuma janela de checkpoint nasce invertida', async () => {
    const { data: s } = await db.from('sessao')
      .insert({ clube_id: CLUBE_TESTE, aberta_em: new Date().toISOString(), caixa_inicial: 20000 })
      .select().single()
    const { data: t } = await db.from('turno')
      .insert({ sessao_id: s!.id, dealer_id: DEALER_JOAO, numero: 1, inicio: 1140 })
      .select().single()

    const r = await db.from('checkpoint').insert({
      sessao_id: s!.id, numero: 1, hora: 1175, contado_em: 1175,
      caixa_esperado: 20000, caixa_contado: 20000, diferenca: 0, veredito: 'fechado',
      janela_inicio: 1200, janela_fim: 1140, turno_id: t!.id, rake_acumulado: 180,
    })
    expect(r.error?.code).toBe('23514')
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx supabase start && npm run test -- testes/banco.test.ts`
Expected: FAIL — `relation "sessao" does not exist`

- [ ] **Step 3: Escrever a migração**

`caixa-vivo/supabase/migrations/0001_esquema.sql`:
```sql
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
```

`caixa-vivo/supabase/seed.sql`:
```sql
insert into clube (id, nome, percentual_rake_dealer) values
  ('11111111-1111-1111-1111-111111111111', 'Clube Paris', 0);

insert into dealer (id, clube_id, nome) values
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'João Ribeiro'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Marcos Lima'),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Cris Andrade');
```

`caixa-vivo/testes/banco.ts`:
```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const CLUBE_TESTE = '11111111-1111-1111-1111-111111111111'
export const DEALER_JOAO = '22222222-2222-2222-2222-222222222221'
export const DEALER_MARCOS = '22222222-2222-2222-2222-222222222222'

/**
 * Cliente de teste com a chave de serviço do Supabase local.
 *
 * Ele ignora RLS de propósito: o que estamos provando aqui são as CONSTRAINTS,
 * não as políticas. As políticas são exercidas pelo app, com a chave anônima.
 */
export function clienteDeTeste(): SupabaseClient {
  const url = process.env.SUPABASE_URL_TESTE
  const chave = process.env.SUPABASE_SERVICE_ROLE_TESTE
  if (!url || !chave) {
    throw new Error(
      'Banco de teste indisponível. Rode `npx supabase start` e exporte ' +
        'SUPABASE_URL_TESTE e SUPABASE_SERVICE_ROLE_TESTE (aparecem na saída do comando). ' +
        'Sem banco, estes testes não podem passar — e não devem ser pulados.'
    )
  }
  return createClient(url, chave, { auth: { persistSession: false } })
}

export async function limparBanco() {
  const db = clienteDeTeste()
  // Ordem por dependência. `clube` e `dealer` vêm do seed e ficam.
  for (const tabela of ['checkpoint', 'movimentacao', 'participacao', 'turno', 'sessao', 'jogador']) {
    const { error } = await db.from(tabela).delete().not('id', 'is', null)
    if (error) throw new Error(`Falhou ao limpar ${tabela}: ${error.message}`)
  }
}
```

- [ ] **Step 4: Aplicar e rodar**

```bash
npx supabase db reset
export SUPABASE_URL_TESTE=http://127.0.0.1:54321
export SUPABASE_SERVICE_ROLE_TESTE="$(npx supabase status --output json | jq -r .SERVICE_ROLE_KEY)"
npm run test -- testes/banco.test.ts
```
Expected: PASS — 5 testes. Cada um prova um invariante que o cliente sozinho não garantiria.

- [ ] **Step 5: Commit**

```bash
git add supabase testes/banco.ts testes/banco.test.ts
git commit -m "feat: esquema do caixa com os invariantes N1, N4, N15 e N16 no banco"
```

---

## Task 3: Cliente Supabase que falha alto quando falta credencial

**Files:**
- Create: `caixa-vivo/src/dados/supabase.ts`
- Create: `caixa-vivo/.env.example`
- Test: `caixa-vivo/testes/supabase.test.ts`

**Interfaces:**
- Consumes: nada
- Produces: `criarCliente(env: Record<string, string | undefined>): SupabaseClient` e `cliente: SupabaseClient` (instância única do app)

> Esta é a integração de que tudo depende, e é a que precisa de autorização externa. A regra: **sem credencial, o app não sobe.** Um app que cai para dados de exemplo quando o banco falta é pior do que um app que não abre — ele mente com a cara de quem está funcionando.

- [ ] **Step 1: Escrever o teste que falha**

`caixa-vivo/testes/supabase.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { criarCliente } from '@/dados/supabase'

describe('cliente do Supabase', () => {
  it('recusa subir sem VITE_SUPABASE_URL, dizendo exatamente o que falta', () => {
    expect(() => criarCliente({ VITE_SUPABASE_ANON_KEY: 'chave' })).toThrowError(
      /VITE_SUPABASE_URL/
    )
  })

  it('recusa subir sem VITE_SUPABASE_ANON_KEY', () => {
    expect(() => criarCliente({ VITE_SUPABASE_URL: 'http://x' })).toThrowError(
      /VITE_SUPABASE_ANON_KEY/
    )
  })

  it('não oferece nenhum modo de demonstração como saída', () => {
    let mensagem = ''
    try { criarCliente({}) } catch (e) { mensagem = (e as Error).message }
    expect(mensagem).not.toMatch(/demonstra|exemplo|mock|offline|amostra/i)
  })

  it('sobe quando as duas existem', () => {
    const c = criarCliente({
      VITE_SUPABASE_URL: 'http://127.0.0.1:54321',
      VITE_SUPABASE_ANON_KEY: 'chave-anonima',
    })
    expect(c.from).toBeTypeOf('function')
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run test -- testes/supabase.test.ts`
Expected: FAIL — `Cannot find module '@/dados/supabase'`

- [ ] **Step 3: Implementar**

`caixa-vivo/src/dados/supabase.ts`:
```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * O cliente do banco.
 *
 * Sem credencial, isto explode no boot — de propósito. O Caixa Vivo não tem
 * modo de demonstração, e não pode ter: um app que cai para dados de exemplo
 * quando o banco some fica com cara de funcionando enquanto o caixa da noite
 * não está sendo registrado em lugar nenhum.
 */
export function criarCliente(env: Record<string, string | undefined>): SupabaseClient {
  const faltando = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'].filter((c) => !env[c])

  if (faltando.length > 0) {
    throw new Error(
      `Falta credencial do banco: ${faltando.join(' e ')}. ` +
        'Copie .env.example para .env.local e preencha com os valores do seu projeto ' +
        'Supabase (Project Settings → API). O app não abre sem banco.'
    )
  }

  return createClient(env.VITE_SUPABASE_URL!, env.VITE_SUPABASE_ANON_KEY!)
}

export const cliente = criarCliente(import.meta.env as unknown as Record<string, string>)
```

`caixa-vivo/.env.example`:
```
# Supabase — Project Settings → API
# Sem estes dois, o app não abre. Não existe modo de demonstração.
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Só para os testes de banco (npx supabase start mostra os dois)
SUPABASE_URL_TESTE=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_TESTE=
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm run test -- testes/supabase.test.ts`
Expected: PASS — 4 testes.

- [ ] **Step 5: Commit**

```bash
git add src/dados/supabase.ts .env.example testes/supabase.test.ts
git commit -m "feat: cliente do Supabase que recusa subir sem credencial"
```

---

## Task 4: Do banco para o objeto `Noite`

**Files:**
- Create: `caixa-vivo/src/dados/tipos-banco.ts`, `caixa-vivo/src/dados/relogio.ts`, `caixa-vivo/src/dados/carregarNoite.ts`
- Test: `caixa-vivo/testes/relogio.test.ts`, `caixa-vivo/testes/carregarNoite.test.ts`

**Interfaces:**
- Consumes: `Noite`, `Minutos` de `@/regras/modelo`
- Produces:
  - `agoraEmMinutos(abertaEm: Date, agora: Date): Minutos`
  - `carregarNoite(db: SupabaseClient, clubeId: string, agora?: Date): Promise<Noite>`
  - `type LinhaSessao`, `LinhaJogador`, `LinhaParticipacao`, `LinhaTurno`, `LinhaMovimentacao`, `LinhaCheckpoint`

- [ ] **Step 1: Escrever o teste do relógio**

`caixa-vivo/testes/relogio.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { agoraEmMinutos } from '@/dados/relogio'

describe('agoraEmMinutos', () => {
  it('conta a partir da meia-noite do dia em que a sessão abriu', () => {
    const abriu = new Date('2026-08-12T19:00:00-03:00')
    const agora = new Date('2026-08-12T21:47:00-03:00')
    expect(agoraEmMinutos(abriu, agora)).toBe(21 * 60 + 47)
  })

  it('passa de 1440 quando a noite atravessa a meia-noite', () => {
    const abriu = new Date('2026-08-12T19:00:00-03:00')
    const agora = new Date('2026-08-13T02:30:00-03:00')
    // 26h30 desde a meia-noite do dia 12
    expect(agoraEmMinutos(abriu, agora)).toBe(26 * 60 + 30)
  })

  it('devolve a própria hora de abertura quando agora é a abertura', () => {
    const abriu = new Date('2026-08-12T19:00:00-03:00')
    expect(agoraEmMinutos(abriu, abriu)).toBe(19 * 60)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run test -- testes/relogio.test.ts`
Expected: FAIL — `Cannot find module '@/dados/relogio'`

- [ ] **Step 3: Implementar o relógio**

`caixa-vivo/src/dados/relogio.ts`:
```ts
import type { Minutos } from '@/regras/modelo'

/**
 * Minutos desde a meia-noite do dia em que a sessão abriu.
 *
 * Pode passar de 1440: uma sessão que começa às 19h e vai até as 3h da manhã
 * termina no minuto 1620. É esse o espaço de tempo em que o `reducer` trabalha,
 * e é o que permite comparar a hora de um rake com o início de um turno sem
 * precisar de data.
 */
export function agoraEmMinutos(abertaEm: Date, agora: Date): Minutos {
  const meiaNoiteDaAbertura = new Date(abertaEm)
  meiaNoiteDaAbertura.setHours(0, 0, 0, 0)
  return Math.floor((agora.getTime() - meiaNoiteDaAbertura.getTime()) / 60000)
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm run test -- testes/relogio.test.ts`
Expected: PASS — 3 testes.

- [ ] **Step 5: Escrever o teste do carregamento**

`caixa-vivo/testes/carregarNoite.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { clienteDeTeste, limparBanco, CLUBE_TESTE, DEALER_JOAO } from './banco'
import { carregarNoite } from '@/dados/carregarNoite'

const db = clienteDeTeste()

describe('carregarNoite', () => {
  beforeEach(limparBanco)

  it('devolve uma noite vazia quando não há sessão aberta', async () => {
    const noite = await carregarNoite(db, CLUBE_TESTE)
    expect(noite.sessao).toBeNull()
    expect(noite.movimentacoes).toEqual([])
    expect(noite.dealers.length).toBeGreaterThan(0) // dealers existem entre sessões
  })

  it('monta a noite com sessão, turno e movimentação, em minutos', async () => {
    const abriu = new Date('2026-08-12T19:00:00-03:00')
    const { data: s } = await db.from('sessao')
      .insert({ clube_id: CLUBE_TESTE, aberta_em: abriu.toISOString(), caixa_inicial: 20000 })
      .select().single()
    const { data: t } = await db.from('turno')
      .insert({ sessao_id: s!.id, dealer_id: DEALER_JOAO, numero: 1, inicio: 1140 })
      .select().single()
    await db.from('movimentacao').insert({
      sessao_id: s!.id, turno_id: t!.id, tipo: 'rake', valor: 180,
      hora_ocorrencia: 1175, hora_digitacao: 1177, situacao: 'confirmada',
      confirmacao: 'presencial',
    })

    const noite = await carregarNoite(db, CLUBE_TESTE, new Date('2026-08-12T21:47:00-03:00'))

    expect(noite.sessao?.caixaInicial).toBe(20000)
    expect(noite.sessao?.abertaEm).toBe(1140)
    expect(noite.agora).toBe(1307)
    expect(noite.turnos).toHaveLength(1)
    expect(noite.movimentacoes[0].valor).toBe(180)
    expect(noite.movimentacoes[0].horaOcorrencia).toBe(1175)
  })
})
```

- [ ] **Step 6: Implementar o carregamento**

`caixa-vivo/src/dados/carregarNoite.ts`:
```ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Noite } from '@/regras/modelo'
import { agoraEmMinutos } from './relogio'

/**
 * Monta o objeto `Noite` a partir das linhas do banco.
 *
 * O `Noite` é o que o `reducer` sabe ler, e ele é 100% derivado das linhas —
 * nunca guardado. Isso é o que garante que recarregar a página devolva
 * exatamente o mesmo estado, e que duas abas não divirjam por muito tempo.
 */
export async function carregarNoite(
  db: SupabaseClient,
  clubeId: string,
  agora: Date = new Date()
): Promise<Noite> {
  const [jogadores, dealers, sessoes] = await Promise.all([
    db.from('jogador').select('*').eq('clube_id', clubeId),
    db.from('dealer').select('*').eq('clube_id', clubeId),
    db.from('sessao').select('*').eq('clube_id', clubeId).order('aberta_em'),
  ])

  for (const r of [jogadores, dealers, sessoes]) {
    if (r.error) throw new Error(`Falhou ao ler o caixa: ${r.error.message}`)
  }

  const linhasSessao = sessoes.data ?? []
  // A sessão corrente é a aberta; se não há, é a última encerrada (N13: ela fica).
  const corrente =
    linhasSessao.find((s) => s.aberta) ?? linhasSessao[linhasSessao.length - 1] ?? null

  const base = {
    jogadores: (jogadores.data ?? []).map((j) => ({
      id: j.id, nome: j.nome, whatsapp: j.whatsapp,
      cpf: j.cpf ?? undefined, limite: j.limite,
    })),
    dealers: (dealers.data ?? []).map((d) => ({ id: d.id, nome: d.nome })),
    sessoes: linhasSessao.map((s) => paraSessao(s)),
    aviso: null,
    // Os ids do banco são uuid; os que o reducer cria são "s1", "m2"...
    // Nunca colidem, então a contagem pode recomeçar do 1 a cada carga.
    seq: 1,
    furoOculto: 0,
  }

  if (!corrente) {
    return { ...base, agora: agoraEmMinutos(agora, agora), sessao: null,
             participacoes: [], turnos: [], movimentacoes: [], checkpoints: [] }
  }

  const abertaEm = new Date(corrente.aberta_em)
  const [participacoes, turnos, movimentacoes, checkpoints] = await Promise.all([
    db.from('participacao').select('*').eq('sessao_id', corrente.id).order('entrou_as'),
    db.from('turno').select('*').eq('sessao_id', corrente.id).order('numero'),
    db.from('movimentacao').select('*').eq('sessao_id', corrente.id).order('criada_em'),
    db.from('checkpoint').select('*').eq('sessao_id', corrente.id).order('numero'),
  ])

  for (const r of [participacoes, turnos, movimentacoes, checkpoints]) {
    if (r.error) throw new Error(`Falhou ao ler o caixa: ${r.error.message}`)
  }

  return {
    ...base,
    agora: agoraEmMinutos(abertaEm, agora),
    sessao: paraSessao(corrente),
    participacoes: (participacoes.data ?? []).map((p) => ({
      id: p.id, sessaoId: p.sessao_id, jogadorId: p.jogador_id,
      entrouAs: p.entrou_as, saiuAs: p.saiu_as ?? undefined, encerrada: p.encerrada,
    })),
    turnos: (turnos.data ?? []).map((t) => ({
      id: t.id, sessaoId: t.sessao_id, numero: t.numero,
      dealerId: t.dealer_id, inicio: t.inicio, fim: t.fim ?? undefined,
    })),
    movimentacoes: (movimentacoes.data ?? []).map((m) => ({
      id: m.id, sessaoId: m.sessao_id, tipo: m.tipo, valor: m.valor,
      participacaoId: m.participacao_id ?? undefined, turnoId: m.turno_id,
      horaOcorrencia: m.hora_ocorrencia, horaDigitacao: m.hora_digitacao,
      horaConfirmacao: m.hora_confirmacao ?? undefined,
      situacao: m.situacao, confirmacao: m.confirmacao ?? undefined,
      // O `reducer` conhece um campo `motivo` só. O banco guarda dois (PRD v1.7
      // §9); aqui eles voltam juntos para o formato que a regra espera.
      motivo: [m.motivo_limite, m.motivo_contingencia].filter(Boolean).join(' · ') || undefined,
    })),
    checkpoints: (checkpoints.data ?? []).map((c) => ({
      id: c.id, sessaoId: c.sessao_id, numero: c.numero, hora: c.hora,
      contadoEm: c.contado_em, caixaEsperado: c.caixa_esperado,
      caixaContado: c.caixa_contado, diferenca: c.diferenca, veredito: c.veredito,
      janelaInicio: c.janela_inicio, janelaFim: c.janela_fim, turnoId: c.turno_id,
      turnoIdsNaJanela: c.turno_ids_na_janela ?? [], rakeAcumulado: c.rake_acumulado,
      final: c.final,
    })),
  } as Noite
}

function paraSessao(s: Record<string, unknown>) {
  const abertaEm = new Date(s.aberta_em as string)
  return {
    id: s.id as string,
    clube: 'Clube Paris',
    abertaEm: agoraEmMinutos(abertaEm, abertaEm),
    encerradaEm: s.encerrada_em
      ? agoraEmMinutos(abertaEm, new Date(s.encerrada_em as string))
      : undefined,
    caixaInicial: s.caixa_inicial as number,
    aberta: s.aberta as boolean,
  }
}
```

- [ ] **Step 7: Rodar e ver passar**

Run: `npm run test -- testes/carregarNoite.test.ts`
Expected: PASS — 2 testes.

- [ ] **Step 8: Commit**

```bash
git add src/dados testes/relogio.test.ts testes/carregarNoite.test.ts
git commit -m "feat: carregar a noite do banco no formato que as regras leem"
```

---

## Task 5: Gravar só o que mudou

**Files:**
- Create: `caixa-vivo/src/dados/persistirDelta.ts`
- Test: `caixa-vivo/testes/persistirDelta.test.ts`

**Interfaces:**
- Consumes: `Noite` de `@/regras/modelo`; `carregarNoite` da Task 4
- Produces: `persistirDelta(db: SupabaseClient, antes: Noite, depois: Noite, operadorId: string): Promise<void>`

> **Por que delta e não "gravar tudo":** o `reducer` só acrescenta linhas ou vira alguns campos. Regravar a noite inteira a cada toque seria caro e criaria corrida entre abas. O delta é mecânico: id que não existia em `antes` é inserção; id que existia com campo diferente é atualização. **Nada é apagado** — regra N13.

- [ ] **Step 1: Escrever o teste que falha**

`caixa-vivo/testes/persistirDelta.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { clienteDeTeste, limparBanco, CLUBE_TESTE, DEALER_JOAO } from './banco'
import { carregarNoite } from '@/dados/carregarNoite'
import { persistirDelta } from '@/dados/persistirDelta'
import { reducer } from '@/regras/reducer'

const db = clienteDeTeste()
const OPERADOR = null // sem auth nos testes de unidade; lancado_por aceita null

describe('persistirDelta', () => {
  beforeEach(limparBanco)

  it('insere a sessão criada pelo reducer, com uuid do banco', async () => {
    const antes = await carregarNoite(db, CLUBE_TESTE)
    const depois = reducer(antes, {
      tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 20000,
    })

    await persistirDelta(db, antes, depois, OPERADOR)

    const { data } = await db.from('sessao').select('*')
    expect(data).toHaveLength(1)
    expect(data![0].caixa_inicial).toBe(20000)
    expect(data![0].aberta).toBe(true)
    // O id do reducer era "s1"; o que ficou no banco é uuid.
    expect(data![0].id).not.toBe('s1')
  })

  it('atualiza a movimentação que mudou de situação, sem duplicar', async () => {
    let noite = await carregarNoite(db, CLUBE_TESTE)
    let anterior = noite
    noite = reducer(noite, { tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 20000 })
    await persistirDelta(db, anterior, noite, OPERADOR)

    noite = await carregarNoite(db, CLUBE_TESTE)
    anterior = noite
    noite = reducer(noite, { tipo: 'abrir-turno', dealerId: DEALER_JOAO })
    await persistirDelta(db, anterior, noite, OPERADOR)

    noite = await carregarNoite(db, CLUBE_TESTE)
    anterior = noite
    noite = reducer(noite, { tipo: 'lancar-rake', valor: 180, horaOcorrencia: noite.agora })
    await persistirDelta(db, anterior, noite, OPERADOR)

    const { data: movs } = await db.from('movimentacao').select('*')
    const { data: cps } = await db.from('checkpoint').select('*')
    expect(movs).toHaveLength(1)
    expect(cps).toHaveLength(1)
    expect(cps![0].numero).toBe(1)
  })

  it('nunca apaga linha — N13', async () => {
    const antes = await carregarNoite(db, CLUBE_TESTE)
    const depois = reducer(antes, {
      tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 20000,
    })
    await persistirDelta(db, antes, depois, OPERADOR)
    // "depois" sem a sessão: persistirDelta não pode interpretar como remoção
    await persistirDelta(db, depois, { ...depois, sessao: null, sessoes: [] }, OPERADOR)
    const { data } = await db.from('sessao').select('*')
    expect(data).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run test -- testes/persistirDelta.test.ts`
Expected: FAIL — `Cannot find module '@/dados/persistirDelta'`

- [ ] **Step 3: Implementar**

`caixa-vivo/src/dados/persistirDelta.ts`:
```ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Noite } from '@/regras/modelo'

const CLUBE = '11111111-1111-1111-1111-111111111111'

/** Id de uuid vem do banco; qualquer outro foi o reducer que inventou agora. */
const ehDoBanco = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

/**
 * Grava a diferença entre duas noites.
 *
 * Insere o que nasceu, atualiza o que mudou, e **nunca apaga** (N13). A ordem
 * das inserções segue a dependência entre tabelas, e um mapa traduz o id
 * provisório do reducer para o uuid que o banco devolve — é o que permite uma
 * ação criar jogador e participação de uma vez.
 */
export async function persistirDelta(
  db: SupabaseClient,
  antes: Noite,
  depois: Noite,
  operadorId: string | null
): Promise<void> {
  const mapa = new Map<string, string>()
  const traduz = (id: string | undefined) =>
    id === undefined ? undefined : (mapa.get(id) ?? id)

  const erro = (e: { message: string } | null, o: string) => {
    if (e) throw new Error(`Não foi possível salvar ${o}: ${e.message}`)
  }

  // ── jogadores ───────────────────────────────────────────────────────────
  for (const j of depois.jogadores) {
    if (ehDoBanco(j.id)) continue
    const { data, error } = await db.from('jogador').insert({
      clube_id: CLUBE, nome: j.nome, whatsapp: j.whatsapp,
      cpf: j.cpf ?? null, limite: j.limite, consentimento_em: new Date().toISOString(),
    }).select('id').single()
    erro(error, 'o cadastro do jogador')
    mapa.set(j.id, data!.id)
  }

  // ── sessão ──────────────────────────────────────────────────────────────
  if (depois.sessao && !ehDoBanco(depois.sessao.id)) {
    const { data, error } = await db.from('sessao').insert({
      clube_id: CLUBE, aberta_em: new Date().toISOString(),
      caixa_inicial: depois.sessao.caixaInicial, aberta: true,
    }).select('id').single()
    erro(error, 'a abertura da sessão')
    mapa.set(depois.sessao.id, data!.id)
  } else if (depois.sessao && antes.sessao && depois.sessao.aberta !== antes.sessao.aberta) {
    const { error } = await db.from('sessao').update({
      aberta: depois.sessao.aberta, encerrada_em: new Date().toISOString(),
    }).eq('id', depois.sessao.id)
    erro(error, 'o encerramento da sessão')
  }

  const sessaoId = traduz(depois.sessao?.id)

  // ── participações ───────────────────────────────────────────────────────
  for (const p of depois.participacoes) {
    const anterior = antes.participacoes.find((x) => x.id === p.id)
    if (!anterior) {
      const { data, error } = await db.from('participacao').insert({
        sessao_id: traduz(p.sessaoId), jogador_id: traduz(p.jogadorId),
        entrou_as: p.entrouAs, saiu_as: p.saiuAs ?? null, encerrada: p.encerrada,
      }).select('id').single()
      erro(error, 'a entrada do jogador na mesa')
      mapa.set(p.id, data!.id)
    } else if (anterior.encerrada !== p.encerrada || anterior.saiuAs !== p.saiuAs) {
      const { error } = await db.from('participacao')
        .update({ encerrada: p.encerrada, saiu_as: p.saiuAs ?? null }).eq('id', p.id)
      erro(error, 'a saída do jogador')
    }
  }

  // ── turnos ──────────────────────────────────────────────────────────────
  for (const t of depois.turnos) {
    const anterior = antes.turnos.find((x) => x.id === t.id)
    if (!anterior) {
      const { data, error } = await db.from('turno').insert({
        sessao_id: traduz(t.sessaoId), dealer_id: traduz(t.dealerId),
        numero: t.numero, inicio: t.inicio, fim: t.fim ?? null,
      }).select('id').single()
      erro(error, 'a abertura do turno')
      mapa.set(t.id, data!.id)
    } else if (anterior.fim !== t.fim) {
      const { error } = await db.from('turno').update({ fim: t.fim ?? null }).eq('id', t.id)
      erro(error, 'o fechamento do turno')
    }
  }

  // ── movimentações ───────────────────────────────────────────────────────
  for (const m of depois.movimentacoes) {
    const anterior = antes.movimentacoes.find((x) => x.id === m.id)
    // O reducer guarda os dois motivos num campo só; o banco quer separados.
    const contingencia = m.confirmacao === 'contingencia'
    const partes = (m.motivo ?? '').split(' · ')
    const motivoLimite = contingencia && partes.length > 1 ? partes[0] : contingencia ? null : (m.motivo ?? null)
    const motivoContingencia = contingencia ? partes[partes.length - 1] : null

    if (!anterior) {
      const { data, error } = await db.from('movimentacao').insert({
        sessao_id: traduz(m.sessaoId), participacao_id: traduz(m.participacaoId) ?? null,
        turno_id: traduz(m.turnoId), tipo: m.tipo, valor: m.valor,
        hora_ocorrencia: m.horaOcorrencia, hora_digitacao: m.horaDigitacao,
        hora_confirmacao: m.horaConfirmacao ?? null, situacao: m.situacao,
        confirmacao: m.confirmacao ?? null,
        motivo_limite: motivoLimite, motivo_contingencia: motivoContingencia,
        lancado_por: operadorId,
      }).select('id').single()
      erro(error, 'o lançamento')
      mapa.set(m.id, data!.id)
    } else if (
      anterior.situacao !== m.situacao ||
      anterior.confirmacao !== m.confirmacao ||
      anterior.motivo !== m.motivo
    ) {
      const { error } = await db.from('movimentacao').update({
        situacao: m.situacao, confirmacao: m.confirmacao ?? null,
        hora_confirmacao: m.horaConfirmacao ?? null,
        motivo_limite: motivoLimite, motivo_contingencia: motivoContingencia,
      }).eq('id', m.id)
      erro(error, 'a confirmação do lançamento')
    }
  }

  // ── checkpoints ─────────────────────────────────────────────────────────
  for (const c of depois.checkpoints) {
    if (antes.checkpoints.some((x) => x.id === c.id)) continue
    const { error } = await db.from('checkpoint').insert({
      sessao_id: traduz(c.sessaoId) ?? sessaoId, numero: c.numero, hora: c.hora,
      contado_em: c.contadoEm, caixa_esperado: c.caixaEsperado,
      caixa_contado: c.caixaContado, diferenca: c.diferenca, veredito: c.veredito,
      janela_inicio: c.janelaInicio, janela_fim: c.janelaFim,
      turno_id: traduz(c.turnoId), turno_ids_na_janela: c.turnoIdsNaJanela.map((i) => traduz(i)),
      rake_acumulado: c.rakeAcumulado, final: c.final ?? false,
    })
    erro(error, 'o checkpoint')
  }
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm run test -- testes/persistirDelta.test.ts`
Expected: PASS — 3 testes.

- [ ] **Step 5: Commit**

```bash
git add src/dados/persistirDelta.ts testes/persistirDelta.test.ts
git commit -m "feat: gravar o delta da noite, sem apagar nada"
```

---

## Task 6: O ciclo `aplicar` — carregar, reduzir, persistir

**Files:**
- Create: `caixa-vivo/src/dados/aplicar.ts`
- Test: `caixa-vivo/testes/aplicar.test.ts`

**Interfaces:**
- Consumes: `carregarNoite` (Task 4), `persistirDelta` (Task 5), `reducer` de `@/regras/reducer`
- Produces: `aplicar(db: SupabaseClient, clubeId: string, operadorId: string | null, acao: Acao): Promise<Noite>` — devolve a noite recarregada do banco, nunca a de memória

- [ ] **Step 1: Escrever o teste que falha**

`caixa-vivo/testes/aplicar.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { clienteDeTeste, limparBanco, CLUBE_TESTE, DEALER_JOAO } from './banco'
import { aplicar } from '@/dados/aplicar'

const db = clienteDeTeste()

describe('aplicar', () => {
  beforeEach(limparBanco)

  it('devolve a noite recarregada do banco, não a de memória', async () => {
    const noite = await aplicar(db, CLUBE_TESTE, null, {
      tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 20000,
    })
    // Se viesse da memória, o id seria "s1".
    expect(noite.sessao!.id).toMatch(/^[0-9a-f]{8}-/)
  })

  it('quando a regra recusa, nada é gravado e o aviso volta', async () => {
    await aplicar(db, CLUBE_TESTE, null, {
      tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 20000,
    })
    const noite = await aplicar(db, CLUBE_TESTE, null, {
      tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 9000,
    })

    const { data } = await db.from('sessao').select('*')
    expect(data).toHaveLength(1)                    // N1 respeitada
    expect(noite.aviso).toMatch(/já existe uma sessão aberta/i)
  })

  it('propaga o erro do banco em vez de fingir que salvou', async () => {
    await expect(
      aplicar(db, 'clube-que-nao-existe', null, {
        tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 20000,
      })
    ).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run test -- testes/aplicar.test.ts`
Expected: FAIL — `Cannot find module '@/dados/aplicar'`

- [ ] **Step 3: Implementar**

`caixa-vivo/src/dados/aplicar.ts`:
```ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Noite } from '@/regras/modelo'
import { reducer, type Acao } from '@/regras/reducer'
import { carregarNoite } from './carregarNoite'
import { persistirDelta } from './persistirDelta'

/**
 * O único caminho de escrita do app.
 *
 * Carrega a noite do banco, roda a regra já provada em cima dela, grava o que
 * mudou e recarrega. Recarregar no fim não é desperdício: é o que faz o estado
 * da tela ser sempre o que está gravado, e não o que o navegador achou que
 * gravou. Se a rede caiu no meio, a tela mostra a verdade.
 *
 * Quando o `reducer` recusa a ação (regra de negócio), ele devolve a mesma
 * noite com um `aviso`. Nesse caso não há delta, nada é gravado, e o aviso
 * chega à tela.
 */
export async function aplicar(
  db: SupabaseClient,
  clubeId: string,
  operadorId: string | null,
  acao: Acao
): Promise<Noite> {
  const antes = await carregarNoite(db, clubeId)
  const depois = reducer(antes, acao)

  await persistirDelta(db, antes, depois, operadorId)

  const recarregada = await carregarNoite(db, clubeId)
  // O aviso vive só em memória — ele é a fala do app, não registro da noite.
  return { ...recarregada, aviso: depois.aviso }
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm run test -- testes/aplicar.test.ts`
Expected: PASS — 3 testes.

- [ ] **Step 5: Commit**

```bash
git add src/dados/aplicar.ts testes/aplicar.test.ts
git commit -m "feat: ciclo aplicar — carregar, reduzir, persistir, recarregar"
```

---

## Task 7: Autenticação real do operador

**Files:**
- Create: `caixa-vivo/src/auth/useOperador.ts`
- Modify: `caixa-vivo/src/shell/components/Login.tsx` — **exceção autorizada à regra de não editar** (ver nota)
- Test: `caixa-vivo/testes/login.test.tsx`

**Interfaces:**
- Consumes: `cliente` de `@/dados/supabase`
- Produces: `useOperador(): { operador: { id: string; nome: string } | null; carregando: boolean; entrar(email: string, senha: string): Promise<void>; sair(): Promise<void>; erro: string | null }`

> **A única edição autorizada em componente exportado.** `Login.tsx` traz uma porta de demonstração com usuário e senha no código — o próprio arquivo diz isso em comentário, e o PRD §13 confirma que autenticação está fora do escopo do R1. Trocar a comparação local por `signInWithPassword` **não é redesenho**: o layout, o texto e os estados permanecem idênticos. O que muda é de onde vem o "sim".
>
> **Credencial:** crie a conta do operador à mão no painel do Supabase (Authentication → Users → Add user) e insira a linha correspondente em `operador`. Sem essa conta o login falha com o erro real do Supabase. **Não crie caminho de bypass.**

- [ ] **Step 1: Escrever o teste que falha**

`caixa-vivo/testes/login.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Login } from '@/shell/components/Login'

describe('Login', () => {
  it('não carrega mais senha nenhuma no código', async () => {
    const fonte = await import('@/shell/components/Login?raw')
    expect(fonte.default).not.toMatch(/3129/)
    expect(fonte.default).not.toMatch(/CREDENCIAL_DA_DEMO/)
  })

  it('mostra o erro real quando a autenticação recusa', async () => {
    const entrar = vi.fn().mockRejectedValue(new Error('Invalid login credentials'))
    render(<Login onEntrar={entrar} />)

    await userEvent.type(screen.getByLabelText(/operador/i), 'anderson@clube.com')
    await userEvent.type(screen.getByLabelText(/senha/i), 'errada')
    await userEvent.click(screen.getByRole('button', { name: /entrar no caixa/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid login credentials/i)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run test -- testes/login.test.tsx`
Expected: FAIL — o arquivo ainda contém `3129`.

- [ ] **Step 3: Implementar o hook e trocar a origem do "sim"**

`caixa-vivo/src/auth/useOperador.ts`:
```ts
import { useCallback, useEffect, useState } from 'react'
import { cliente } from '@/dados/supabase'

export interface Operador { id: string; nome: string }

export function useOperador() {
  const [operador, setOperador] = useState<Operador | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const carregarPerfil = useCallback(async (id: string) => {
    const { data, error } = await cliente.from('operador').select('id, nome').eq('id', id).single()
    if (error) throw new Error(`Sessão válida, mas sem cadastro de operador: ${error.message}`)
    setOperador(data as Operador)
  }, [])

  useEffect(() => {
    cliente.auth.getSession().then(async ({ data }) => {
      if (data.session) await carregarPerfil(data.session.user.id).catch((e) => setErro(e.message))
      setCarregando(false)
    })
    const { data: sub } = cliente.auth.onAuthStateChange((_e, s) => {
      if (!s) setOperador(null)
    })
    return () => sub.subscription.unsubscribe()
  }, [carregarPerfil])

  async function entrar(email: string, senha: string) {
    setErro(null)
    const { data, error } = await cliente.auth.signInWithPassword({ email, password: senha })
    // O erro do Supabase sobe como está. Traduzi-lo aqui esconderia
    // "e-mail não confirmado" atrás de "usuário ou senha não confere".
    if (error) throw error
    await carregarPerfil(data.user.id)
  }

  async function sair() {
    await cliente.auth.signOut()
    setOperador(null)
  }

  return { operador, carregando, erro, entrar, sair }
}
```

Em `src/shell/components/Login.tsx`, apagar o bloco `CREDENCIAL_DA_DEMO` e o rodapé "Demonstração · anderson / 3129", e trocar a função `enviar`:

```tsx
export interface LoginProps {
  clube?: string
  /** Lança quando a autenticação recusa. A mensagem do erro vai para a tela. */
  onEntrar: (usuario: string, senha: string) => Promise<void>
}

async function enviar(evento: FormEvent) {
  evento.preventDefault()
  setErro(null)
  setEnviando(true)
  try {
    await onEntrar(usuario.trim(), senha)
  } catch (e) {
    setErro(e instanceof Error ? e.message : 'Não foi possível entrar.')
    setSenha('')
  } finally {
    setEnviando(false)
  }
}
```

O botão passa a usar `disabled={enviando || !usuario.trim() || !senha}` e o rótulo vira `{enviando ? 'Entrando…' : 'Entrar no caixa'}`. **Nenhuma classe muda.**

- [ ] **Step 4: Rodar e ver passar**

Run: `npm run test -- testes/login.test.tsx`
Expected: PASS — 2 testes.

- [ ] **Step 5: Commit**

```bash
git add src/auth src/shell/components/Login.tsx testes/login.test.tsx
git commit -m "feat: autenticação real do operador no lugar da porta de demonstração"
```

---

## Task 8: Estado da noite com carregando, vazio e erro

**Files:**
- Create: `caixa-vivo/src/estado/NoiteProvider.tsx`, `caixa-vivo/src/App.tsx`
- Modify: `caixa-vivo/src/main.tsx`
- Test: `caixa-vivo/testes/noiteProvider.test.tsx`

**Interfaces:**
- Consumes: `aplicar` (Task 6), `carregarNoite` (Task 4), `useOperador` (Task 7)
- Produces: `useNoite(): { noite: Noite; recarregar(): Promise<void>; despachar(acao: Acao): Promise<void>; estado: 'carregando' | 'pronto' | 'erro'; erro: string | null }`

- [ ] **Step 1: Escrever o teste que falha**

`caixa-vivo/testes/noiteProvider.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NoiteProvider, useNoite } from '@/estado/NoiteProvider'

function Sonda() {
  const { estado, erro, noite } = useNoite()
  return <div>{estado}:{erro ?? ''}:{noite.sessao ? 'com-sessao' : 'sem-sessao'}</div>
}

describe('NoiteProvider', () => {
  it('mostra carregando antes da primeira resposta do banco', () => {
    render(<NoiteProvider carregar={() => new Promise(() => {})}><Sonda /></NoiteProvider>)
    expect(screen.getByText(/^carregando/)).toBeInTheDocument()
  })

  it('mostra o erro do banco em vez de uma tela vazia', async () => {
    const carregar = vi.fn().mockRejectedValue(new Error('conexão recusada'))
    render(<NoiteProvider carregar={carregar}><Sonda /></NoiteProvider>)
    expect(await screen.findByText(/erro:conexão recusada/)).toBeInTheDocument()
  })

  it('vazio é vazio: banco sem sessão não vira noite de exemplo', async () => {
    const vazia = { sessao: null, jogadores: [], dealers: [], sessoes: [], participacoes: [],
                    turnos: [], movimentacoes: [], checkpoints: [], agora: 0, aviso: null,
                    seq: 1, furoOculto: 0 }
    render(<NoiteProvider carregar={async () => vazia as never}><Sonda /></NoiteProvider>)
    expect(await screen.findByText(/pronto::sem-sessao/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run test -- testes/noiteProvider.test.tsx`
Expected: FAIL — `Cannot find module '@/estado/NoiteProvider'`

- [ ] **Step 3: Implementar**

`caixa-vivo/src/estado/NoiteProvider.tsx`:
```tsx
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Noite } from '@/regras/modelo'
import type { Acao } from '@/regras/reducer'
import { cliente } from '@/dados/supabase'
import { carregarNoite } from '@/dados/carregarNoite'
import { aplicar } from '@/dados/aplicar'

const CLUBE = '11111111-1111-1111-1111-111111111111'

type Estado = 'carregando' | 'pronto' | 'erro'

interface Contexto {
  noite: Noite
  estado: Estado
  erro: string | null
  recarregar: () => Promise<void>
  despachar: (acao: Acao) => Promise<void>
}

const Ctx = createContext<Contexto | null>(null)

/** Uma noite sem nada. Não é dado de exemplo: é a ausência de dado. */
const NOITE_VAZIA = {
  agora: 0, sessao: null, sessoes: [], jogadores: [], participacoes: [],
  dealers: [], turnos: [], movimentacoes: [], checkpoints: [],
  furoOculto: 0, aviso: null, seq: 1,
} as unknown as Noite

export function NoiteProvider({
  children,
  operadorId = null,
  carregar = () => carregarNoite(cliente, CLUBE),
}: {
  children: ReactNode
  operadorId?: string | null
  carregar?: () => Promise<Noite>
}) {
  const [noite, setNoite] = useState<Noite>(NOITE_VAZIA)
  const [estado, setEstado] = useState<Estado>('carregando')
  const [erro, setErro] = useState<string | null>(null)

  const recarregar = useCallback(async () => {
    setEstado('carregando')
    try {
      setNoite(await carregar())
      setErro(null)
      setEstado('pronto')
    } catch (e) {
      // R2 do PRD: não há modo offline. A queda aparece, não vira fila silenciosa.
      setErro(e instanceof Error ? e.message : 'Falha ao falar com o banco.')
      setEstado('erro')
    }
  }, [carregar])

  useEffect(() => { void recarregar() }, [recarregar])

  async function despachar(acao: Acao) {
    try {
      setNoite(await aplicar(cliente, CLUBE, operadorId, acao))
      setErro(null)
      setEstado('pronto')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar.')
      setEstado('erro')
    }
  }

  return (
    <Ctx.Provider value={{ noite, estado, erro, recarregar, despachar }}>
      {children}
    </Ctx.Provider>
  )
}

export function useNoite(): Contexto {
  const c = useContext(Ctx)
  if (!c) throw new Error('useNoite precisa estar dentro de <NoiteProvider>')
  return c
}
```

`caixa-vivo/src/App.tsx` monta o `AppShell` exportado, com três estados visíveis:

```tsx
import { useState } from 'react'
import { AppShell, Login, NAVEGACAO_PADRAO } from '@/shell/components'
import { NoiteProvider, useNoite } from '@/estado/NoiteProvider'
import { useOperador } from '@/auth/useOperador'
import { statusDaFaixa } from '@/telas/faixa'
import { SessaoTela } from '@/telas/SessaoTela'
import { MesaTela } from '@/telas/MesaTela'
import { FichasTela } from '@/telas/FichasTela'
import { RakeTela } from '@/telas/RakeTela'
import { CaixaTela } from '@/telas/CaixaTela'

function Conteudo({ operador, sair }: { operador: { nome: string }; sair: () => void }) {
  const { noite, estado, erro, recarregar } = useNoite()
  const [rota, setRota] = useState('/sessao')
  const [participacaoId, setParticipacaoId] = useState<string | null>(null)

  const itens = NAVEGACAO_PADRAO
    .filter((i) => i.href !== '/painel' && i.href !== '/ao-vivo')   // fora desta fatia
    .map((i) => ({ ...i, isActive: i.href === rota }))

  return (
    <AppShell navigationItems={itens} user={{ name: operador.nome }}
              status={statusDaFaixa(noite)} onNavigate={setRota}
              onStatusClick={() => setRota('/caixa')} onLogout={sair}>
      {estado === 'carregando' ? (
        <p className="cv-text-soft p-8 text-center text-[13px]">Carregando a noite…</p>
      ) : estado === 'erro' ? (
        <div className="cv-panel cv-ch-suspender mx-auto mt-8 max-w-md rounded-2xl p-6 text-center">
          <p className="cv-accent-text font-cv-display text-[24px]">Não deu para falar com o banco</p>
          <p className="cv-text-soft mt-2 text-[13px]">{erro}</p>
          <p className="cv-text-soft mt-2 text-[12px]">
            Nada foi perdido: o que já estava salvo continua salvo. Enquanto isso, use o papel.
          </p>
          <button type="button" onClick={() => void recarregar()}
                  className="cv-ch-live cv-btn mt-5 h-12 w-full text-[13.5px]">
            Tentar de novo
          </button>
        </div>
      ) : (
        <>
          {rota === '/sessao' ? <SessaoTela /> : null}
          {rota === '/mesa' ? <MesaTela onAbrirJogador={(id) => { setParticipacaoId(id); setRota('/fichas') }} /> : null}
          {rota === '/fichas' ? <FichasTela participacaoId={participacaoId} onSelecionar={setParticipacaoId} /> : null}
          {rota === '/rake' ? <RakeTela /> : null}
          {rota === '/caixa' ? <CaixaTela /> : null}
        </>
      )}
    </AppShell>
  )
}

export default function App() {
  const { operador, carregando, entrar, sair } = useOperador()
  if (carregando) return <p className="p-8 text-center">Carregando…</p>
  if (!operador) return <Login onEntrar={entrar} />
  return (
    <NoiteProvider operadorId={operador.id}>
      <Conteudo operador={operador} sair={sair} />
    </NoiteProvider>
  )
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm run test -- testes/noiteProvider.test.tsx`
Expected: PASS — 3 testes.

- [ ] **Step 5: Commit**

```bash
git add src/estado src/App.tsx src/main.tsx testes/noiteProvider.test.tsx
git commit -m "feat: estado da noite com carregando, vazio e erro visíveis"
```

---

## Task 9: Abrir a sessão e o primeiro turno

**Files:**
- Create: `caixa-vivo/src/telas/faixa.ts`, `caixa-vivo/src/telas/SessaoTela.tsx`
- Test: `caixa-vivo/testes/sessaoTela.test.tsx`

**Interfaces:**
- Consumes: `useNoite` (Task 8); componentes `AbrirSessao`, `ResumoCaixa`, `LinhaDoTempoTurnos` de `@/sections/sessao-e-caixa/components`
- Produces: `statusDaFaixa(noite: Noite): CaixaStatus`; `SessaoTela` sem props

- [ ] **Step 1: Escrever o teste que falha**

`caixa-vivo/testes/sessaoTela.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessaoTela } from '@/telas/SessaoTela'
import * as estado from '@/estado/NoiteProvider'

const noiteVazia = {
  agora: 1140, sessao: null, sessoes: [], jogadores: [], participacoes: [],
  dealers: [{ id: 'd1', nome: 'João Ribeiro' }], turnos: [], movimentacoes: [],
  checkpoints: [], furoOculto: 0, aviso: null, seq: 1,
} as never

describe('SessaoTela', () => {
  it('estado vazio: convida a abrir a noite, sem inventar número', () => {
    vi.spyOn(estado, 'useNoite').mockReturnValue({
      noite: noiteVazia, estado: 'pronto', erro: null,
      recarregar: vi.fn(), despachar: vi.fn(),
    } as never)
    render(<SessaoTela />)
    expect(screen.getByText(/nenhuma sessão aberta/i)).toBeInTheDocument()
    expect(screen.queryByText(/20\.000/)).not.toBeInTheDocument()
  })

  it('despacha abrir-sessao com o valor digitado', async () => {
    const despachar = vi.fn()
    vi.spyOn(estado, 'useNoite').mockReturnValue({
      noite: noiteVazia, estado: 'pronto', erro: null, recarregar: vi.fn(), despachar,
    } as never)
    render(<SessaoTela />)

    await userEvent.type(screen.getByLabelText(/caixa inicial/i), '20000')
    await userEvent.click(screen.getByRole('button', { name: /abrir a noite/i }))

    expect(despachar).toHaveBeenCalledWith({
      tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 20000,
    })
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run test -- testes/sessaoTela.test.tsx`
Expected: FAIL — `Cannot find module '@/telas/SessaoTela'`

- [ ] **Step 3: Implementar**

`caixa-vivo/src/telas/faixa.ts`:
```ts
import type { CaixaStatus } from '@/shell/components'
import {
  checkpointsDaSessao, dealerDo, estadoDaFaixa, fichasEmJogo,
  formatarHora, participacoesAbertas, reais, turnoAberto, type Noite,
} from '@/regras/modelo'

/**
 * A leitura da faixa do topo.
 *
 * No estado neutro ela mostra as **fichas em jogo** — quanto saiu e ainda não
 * voltou. Esse é o número que o app realmente conhece entre dois checkpoints;
 * a diferença da caixa só existe depois de alguém contar a caixa (N8, N9).
 */
export function statusDaFaixa(noite: Noite): CaixaStatus {
  const estado = estadoDaFaixa(noite)
  const turno = turnoAberto(noite)
  const checkpoints = checkpointsDaSessao(noite)
  const ultimo = checkpoints[checkpoints.length - 1]

  if (estado === 'sem-sessao') return { estado, valor: 'Abrir a noite' }

  const base = {
    hora: formatarHora(noite.agora),
    turno: turno?.numero,
    dealer: dealerDo(noite, turno).split(' ')[0],
    jogadores: participacoesAbertas(noite).length,
  }

  if (estado === 'neutro') {
    return {
      ...base, estado, rotulo: 'Fichas em jogo', valor: reais(fichasEmJogo(noite)),
      mensagem: ultimo
        ? `Rake não declarado desde ${formatarHora(ultimo.hora)}`
        : 'Nenhum rake lançado ainda',
    }
  }

  const janela = `${formatarHora(ultimo.janelaInicio)}–${formatarHora(ultimo.janelaFim)}`

  if (estado === 'fechado') {
    return {
      ...base, estado, hora: formatarHora(ultimo.hora), valor: 'Caixa fechado',
      mensagem: `Checkpoint ${ultimo.numero} · ${janela}`,
    }
  }

  return {
    ...base, estado, hora: formatarHora(ultimo.hora),
    valor: `Faltam ${reais(ultimo.diferenca)}`,
    mensagem: estado === 'furo'
      ? `${janela} · suspender novas retiradas?`
      : `${janela} · revisar a janela agora`,
  }
}
```

`caixa-vivo/src/telas/SessaoTela.tsx`:
```tsx
import {
  AbrirSessao, LinhaDoTempoTurnos, ResumoCaixa,
} from '@/sections/sessao-e-caixa/components'
import { TituloDeTela } from '@/shell/components'
import { useNoite } from '@/estado/NoiteProvider'
import {
  dealerDo, formatarDuracao, formatarHora, movimentacoesDaSessao,
  rakeDeclarado, somaDevolucoes, somaRetiradas, turnosDaSessao,
  checkpointsDaSessao, estadoDaFaixa, fichasEmJogo,
} from '@/regras/modelo'

const CLUBE = 'Clube Paris'

export function SessaoTela() {
  const { noite, despachar } = useNoite()

  if (!noite.sessao?.aberta) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6">
        <TituloDeTela sobretitulo={CLUBE} titulo="Sessão e Caixa" />
        <AbrirSessao
          clube={CLUBE}
          onAbrir={(caixaInicial) =>
            void despachar({ tipo: 'abrir-sessao', clube: CLUBE, caixaInicial })
          }
        />
      </div>
    )
  }

  const s = noite.sessao
  const checkpoints = checkpointsDaSessao(noite)
  const ultimo = checkpoints[checkpoints.length - 1]
  const congelado = estadoDaFaixa(noite) !== 'neutro'

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-7 sm:px-6">
      <TituloDeTela
        sobretitulo={`${CLUBE} · aberta às ${formatarHora(s.abertaEm)}`}
        titulo="Sessão e Caixa"
      />
      <ResumoCaixa
        sessao={{
          id: s.id, clube: CLUBE, abertaEm: formatarHora(s.abertaEm),
          horaAtual: formatarHora(noite.agora),
          decorrido: formatarDuracao(noite.agora - s.abertaEm),
          caixaInicial: s.caixaInicial, situacao: 'aberta',
        }}
        resumo={{
          retiradas: somaRetiradas(noite), devolucoes: somaDevolucoes(noite),
          rakeRecolhido: rakeDeclarado(noite),
          diferenca: congelado ? ultimo.diferenca : fichasEmJogo(noite),
          rakePendente: !congelado,
          ultimoRakeEm: ultimo ? formatarHora(ultimo.hora) : undefined,
          checkpoints: checkpoints.length,
        }}
      />
      <LinhaDoTempoTurnos
        turnos={turnosDaSessao(noite).map((t) => ({
          id: t.id, numero: t.numero, dealer: dealerDo(noite, t),
          inicio: formatarHora(t.inicio),
          fim: t.fim === undefined ? undefined : formatarHora(t.fim),
          rakeDoTurno: movimentacoesDaSessao(noite)
            .filter((m) => m.tipo === 'rake' && m.turnoId === t.id)
            .reduce((soma, m) => soma + m.valor, 0),
          aberto: t.fim === undefined,
        }))}
      />
    </div>
  )
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm run test -- testes/sessaoTela.test.tsx`
Expected: PASS — 2 testes.

- [ ] **Step 5: Commit**

```bash
git add src/telas/faixa.ts src/telas/SessaoTela.tsx testes/sessaoTela.test.tsx
git commit -m "feat: abrir e acompanhar a sessão, ligada ao banco"
```

---

## Task 10: Cadastrar e sentar o jogador

**Files:**
- Create: `caixa-vivo/src/telas/MesaTela.tsx`
- Test: `caixa-vivo/testes/mesaTela.test.tsx`

**Interfaces:**
- Consumes: `useNoite` (Task 8); `ListaDaMesa`, `CadastroJogador` de `@/sections/jogadores-e-mesa/components`
- Produces: `MesaTela({ onAbrirJogador }: { onAbrirJogador: (participacaoId: string) => void })`

- [ ] **Step 1: Escrever o teste que falha**

`caixa-vivo/testes/mesaTela.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MesaTela } from '@/telas/MesaTela'
import * as estado from '@/estado/NoiteProvider'

const comSessao = {
  agora: 1145, sessao: { id: 'S', clube: 'Clube Paris', abertaEm: 1140, caixaInicial: 20000, aberta: true },
  sessoes: [], jogadores: [], participacoes: [], dealers: [], turnos: [],
  movimentacoes: [], checkpoints: [], furoOculto: 0, aviso: null, seq: 1,
} as never

function montar(despachar = vi.fn()) {
  vi.spyOn(estado, 'useNoite').mockReturnValue({
    noite: comSessao, estado: 'pronto', erro: null, recarregar: vi.fn(), despachar,
  } as never)
  render(<MesaTela onAbrirJogador={vi.fn()} />)
  return despachar
}

describe('MesaTela', () => {
  it('mesa vazia diz que a noite começa quando o primeiro senta', () => {
    montar()
    expect(screen.getByText(/ninguém na mesa ainda/i)).toBeInTheDocument()
  })

  it('A19 — o cadastro não oferece nenhum botão de liberar sem WhatsApp', async () => {
    montar()
    await userEvent.click(screen.getByRole('button', { name: /adicionar jogador/i }))
    expect(screen.queryByRole('button', { name: /liberar/i })).not.toBeInTheDocument()
  })

  it('despacha cadastrar-jogador com sentar', async () => {
    const despachar = montar()
    await userEvent.click(screen.getByRole('button', { name: /adicionar jogador/i }))
    await userEvent.type(screen.getByLabelText(/nome ou apelido/i), 'Rafa')
    await userEvent.type(screen.getByLabelText(/whatsapp/i), '11988124470')
    await userEvent.type(screen.getByLabelText(/limite de crédito/i), '3000')
    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: /cadastrar e sentar/i }))

    expect(despachar).toHaveBeenCalledWith(
      expect.objectContaining({ tipo: 'cadastrar-jogador', nome: 'Rafa', sentar: true })
    )
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run test -- testes/mesaTela.test.tsx`
Expected: FAIL — `Cannot find module '@/telas/MesaTela'`

- [ ] **Step 3: Implementar**

`caixa-vivo/src/telas/MesaTela.tsx`:
```tsx
import { useState } from 'react'
import { CadastroJogador, ListaDaMesa } from '@/sections/jogadores-e-mesa/components'
import { TituloDeTela } from '@/shell/components'
import { useNoite } from '@/estado/NoiteProvider'
import {
  TETO_CONTINGENCIAS, aguardando, contingenciasDaSessao, contingenciasDe, emMao,
  formatarHora, jogadorDe, jogadorPorIdentidade, participacoesAbertas, whatsappJaUsado,
} from '@/regras/modelo'

export function MesaTela({ onAbrirJogador }: { onAbrirJogador: (id: string) => void }) {
  const { noite, despachar } = useNoite()
  const [busca, setBusca] = useState('')
  const [cadastrando, setCadastrando] = useState(false)

  const abertas = participacoesAbertas(noite)

  if (cadastrando) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6">
        <TituloDeTela sobretitulo="Mesa" titulo="Novo jogador" />
        <CadastroJogador
          jaCadastrado={(n, w) => jogadorPorIdentidade(noite, n, w)?.nome ?? null}
          donoDoWhatsapp={(w) => whatsappJaUsado(noite, w)?.nome ?? null}
          onUsarExistente={(n, w) => {
            const j = jogadorPorIdentidade(noite, n, w)
            if (j) { void despachar({ tipo: 'sentar', jogadorId: j.id }); setCadastrando(false) }
          }}
          onCadastrar={async (j) => {
            await despachar({ tipo: 'cadastrar-jogador', ...j, sentar: true })
            setCadastrando(false)
          }}
          onCancelar={() => setCadastrando(false)}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6">
      <TituloDeTela sobretitulo="Jogadores e mesa" titulo="Mesa" />
      <ListaDaMesa
        jogadores={abertas.map((p) => {
          const j = jogadorDe(noite, p.id)
          return {
            id: p.id, nome: j?.nome ?? '—', whatsapp: j?.whatsapp ?? '', cpf: j?.cpf,
            entrouAs: formatarHora(p.entrouAs), limite: j?.limite ?? 0,
            emMao: emMao(noite, p.id), aguardando: aguardando(noite, p.id),
            contingencias: contingenciasDe(noite, p.id),
          }
        })}
        busca={busca}
        contingenciasNaSessao={contingenciasDaSessao(noite)}
        tetoContingencias={TETO_CONTINGENCIAS}
        sessaoAberta={Boolean(noite.sessao?.aberta)}
        onBuscar={setBusca}
        onAdicionar={() => setCadastrando(true)}
        onAbrirJogador={onAbrirJogador}
      />
    </div>
  )
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm run test -- testes/mesaTela.test.tsx`
Expected: PASS — 3 testes.

- [ ] **Step 5: Commit**

```bash
git add src/telas/MesaTela.tsx testes/mesaTela.test.tsx
git commit -m "feat: cadastrar e sentar jogador, com N15 valendo no banco e na tela"
```

---

## Task 11: Lançar a ficha, girar a tela, confirmar

**Files:**
- Create: `caixa-vivo/src/telas/FichasTela.tsx`
- Test: `caixa-vivo/testes/fichasTela.test.tsx`

**Interfaces:**
- Consumes: `useNoite` (Task 8); `LancarRetirada`, `TelaConfirmacao` de `@/sections/fichas/components`
- Produces: `FichasTela({ participacaoId, onSelecionar })`

- [ ] **Step 1: Escrever o teste que falha**

`caixa-vivo/testes/fichasTela.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FichasTela } from '@/telas/FichasTela'
import * as estado from '@/estado/NoiteProvider'

const base = {
  agora: 1150,
  sessao: { id: 'S', clube: 'Clube Paris', abertaEm: 1140, caixaInicial: 20000, aberta: true },
  sessoes: [], dealers: [{ id: 'd1', nome: 'João Ribeiro' }],
  jogadores: [{ id: 'j1', nome: 'Rafa', whatsapp: '11988124470', limite: 3000 }],
  participacoes: [{ id: 'p1', sessaoId: 'S', jogadorId: 'j1', entrouAs: 1145, encerrada: false }],
  turnos: [{ id: 't1', sessaoId: 'S', numero: 1, dealerId: 'd1', inicio: 1140 }],
  movimentacoes: [], checkpoints: [], furoOculto: 0, aviso: null, seq: 1,
}

function montar(noite: unknown, despachar = vi.fn()) {
  vi.spyOn(estado, 'useNoite').mockReturnValue({
    noite, estado: 'pronto', erro: null, recarregar: vi.fn(), despachar,
  } as never)
  render(<FichasTela participacaoId="p1" onSelecionar={vi.fn()} />)
  return despachar
}

describe('FichasTela', () => {
  it('N2 — a tela girada aparece com a retirada aguardando, e ocupa o aparelho', () => {
    montar({ ...base, movimentacoes: [{
      id: 'm1', sessaoId: 'S', tipo: 'retirada', valor: 1000, participacaoId: 'p1',
      turnoId: 't1', horaOcorrencia: 1150, horaDigitacao: 1150, situacao: 'aguardando',
    }] })
    expect(screen.getByText(/confira o valor/i)).toBeInTheDocument()
    expect(screen.getByText('R$ 1.000')).toBeInTheDocument()
  })

  it('confirmar despacha confirmação presencial', async () => {
    const despachar = montar({ ...base, movimentacoes: [{
      id: 'm1', sessaoId: 'S', tipo: 'retirada', valor: 1000, participacaoId: 'p1',
      turnoId: 't1', horaOcorrencia: 1150, horaDigitacao: 1150, situacao: 'aguardando',
    }] })
    await userEvent.click(screen.getByRole('button', { name: /^confirmar$/i }))
    expect(despachar).toHaveBeenCalledWith({
      tipo: 'confirmar', movimentacaoId: 'm1', confirmacao: 'presencial',
    })
  })

  it('A8/N10 — acima do limite não passa sem motivo escrito', async () => {
    const despachar = montar({ ...base, movimentacoes: [{
      id: 'm0', sessaoId: 'S', tipo: 'retirada', valor: 2800, participacaoId: 'p1',
      turnoId: 't1', horaOcorrencia: 1146, horaDigitacao: 1146,
      situacao: 'confirmada', confirmacao: 'presencial', horaConfirmacao: 1146,
    }] })
    // Rafa tem limite 3000 e já está com 2800. Mais 500 estoura.
    for (const t of ['5', '0', '0']) {
      await userEvent.click(screen.getByRole('button', { name: t }))
    }
    expect(screen.getByText(/valor acima do limite/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /liberar mesmo assim/i }))
    await userEvent.type(screen.getByLabelText(/motivo da liberação/i), 'Cliente antigo, dono liberou.')
    await userEvent.click(screen.getByRole('button', { name: /girar a tela/i }))

    expect(despachar).toHaveBeenCalledWith(expect.objectContaining({
      tipo: 'lancar-retirada', valor: 500, motivo: 'Cliente antigo, dono liberou.',
    }))
  })

  it('N16 — contingência só sai com motivo escrito', async () => {
    const despachar = montar({ ...base, movimentacoes: [{
      id: 'm1', sessaoId: 'S', tipo: 'retirada', valor: 1000, participacaoId: 'p1',
      turnoId: 't1', horaOcorrencia: 1150, horaDigitacao: 1150, situacao: 'aguardando',
    }] })
    await userEvent.click(screen.getByRole('button', { name: /o jogador não olhou/i }))
    const registrar = screen.getByRole('button', { name: /registrar contingência/i })
    expect(registrar).toBeDisabled()

    await userEvent.type(screen.getByLabelText(/motivo/i), 'Atendeu o telefone.')
    await userEvent.click(registrar)
    expect(despachar).toHaveBeenCalledWith(expect.objectContaining({
      tipo: 'confirmar', confirmacao: 'contingencia', motivo: 'Atendeu o telefone.',
    }))
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run test -- testes/fichasTela.test.tsx`
Expected: FAIL — `Cannot find module '@/telas/FichasTela'`

- [ ] **Step 3: Implementar**

`caixa-vivo/src/telas/FichasTela.tsx`:
```tsx
import { useState } from 'react'
import { LancarRetirada, TelaConfirmacao } from '@/sections/fichas/components'
import { TituloDeTela } from '@/shell/components'
import { useNoite } from '@/estado/NoiteProvider'
import {
  TETO_CONTINGENCIAS, aguardando, contingenciasDaSessao, emMao,
  jogadorDe, participacoesAbertas, reais,
} from '@/regras/modelo'

export function FichasTela({
  participacaoId,
  onSelecionar,
}: {
  participacaoId: string | null
  onSelecionar: (id: string | null) => void
}) {
  const { noite, despachar } = useNoite()
  const [valor, setValor] = useState('')
  const [motivoLimite, setMotivoLimite] = useState<string | null>(null)
  const [motivoContingencia, setMotivoContingencia] = useState<string | null>(null)

  const abertas = participacoesAbertas(noite)
  const atual = participacaoId ? abertas.find((p) => p.id === participacaoId) : undefined

  function limpar() {
    setValor(''); setMotivoLimite(null); setMotivoContingencia(null)
  }

  // ── Ninguém escolhido ───────────────────────────────────────────────────
  if (!atual) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6">
        <TituloDeTela sobretitulo="Fichas" titulo="Para quem é a ficha?" />
        {abertas.length === 0 ? (
          <p className="cv-panel cv-text-soft rounded-2xl p-10 text-center text-[13px]">
            Ninguém na mesa. Adicione um jogador antes de lançar fichas.
          </p>
        ) : (
          <div className="cv-panel cv-ticks rounded-2xl p-5">
            <div className="flex flex-wrap gap-2">
              {abertas.map((p) => (
                <button key={p.id} type="button"
                  onClick={() => { limpar(); onSelecionar(p.id) }}
                  className="cv-btn-quiet h-12 px-3.5 text-[13.5px] font-semibold">
                  {jogadorDe(noite, p.id)?.nome}
                  <span className="cv-text-soft font-cv-mono cv-num text-[11px]">
                    {reais(emMao(noite, p.id))}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const jogador = jogadorDe(noite, atual.id)!
  // O MAIS ANTIGO vai para a tela girada: é o que o jogador viu primeiro.
  const pendente = noite.movimentacoes.find(
    (m) => m.participacaoId === atual.id && m.tipo === 'retirada' && m.situacao === 'aguardando'
  )

  // ── A tela girada para o jogador (F3, N2) ──────────────────────────────
  if (pendente) {
    return (
      <TelaConfirmacao
        plenaTela
        jogador={jogador.nome}
        valor={pendente.valor}
        contingenciasNaSessao={contingenciasDaSessao(noite)}
        tetoContingencias={TETO_CONTINGENCIAS}
        onConfirmar={async () => {
          await despachar({ tipo: 'confirmar', movimentacaoId: pendente.id, confirmacao: 'presencial' })
          limpar(); onSelecionar(null)
        }}
        onRecusar={async () => {
          await despachar({ tipo: 'recusar', movimentacaoId: pendente.id })
          limpar()
        }}
        onContingencia={() => setMotivoContingencia('')}
        rodape={
          motivoContingencia !== null ? (
            <section className="cv-ch-chrome cv-panel cv-accent-ring rounded-2xl p-4">
              <label htmlFor="motivo-contingencia"
                className="cv-accent-text cv-engraved block text-[9.5px] font-semibold tracking-[0.16em] uppercase">
                Contingência {contingenciasDaSessao(noite) + 1} de {TETO_CONTINGENCIAS} · motivo
              </label>
              <input id="motivo-contingencia" value={motivoContingencia}
                onChange={(e) => setMotivoContingencia(e.target.value)}
                placeholder="Por que o jogador não olhou a tela?"
                className="cv-panel-quiet cv-line cv-text mt-2.5 h-12 w-full rounded-xl border px-3.5 text-[14.5px] outline-none focus:ring-2" />
              <button type="button" disabled={!motivoContingencia.trim()}
                onClick={async () => {
                  await despachar({
                    tipo: 'confirmar', movimentacaoId: pendente.id,
                    confirmacao: 'contingencia', motivo: motivoContingencia,
                  })
                  limpar(); onSelecionar(null)
                }}
                className="cv-btn mt-3 h-11 w-full text-[13px] disabled:opacity-35 disabled:saturate-0">
                Registrar contingência
              </button>
            </section>
          ) : null
        }
      />
    )
  }

  // ── Lançamento (F3, F8, N6, N10) ───────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6">
      <TituloDeTela
        sobretitulo="Fichas"
        titulo={jogador.nome}
        acessorio={
          <button type="button" onClick={() => { limpar(); onSelecionar(null) }}
            className="cv-btn-quiet h-10 px-3.5 text-[12px]">
            Trocar jogador
          </button>
        }
      />
      <LancarRetirada
        jogador={{
          id: atual.id, nome: jogador.nome, limite: jogador.limite,
          emMao: emMao(noite, atual.id), aguardando: aguardando(noite, atual.id),
        }}
        valor={valor}
        liberado={motivoLimite !== null && motivoLimite.trim().length > 0}
        onLiberar={() => setMotivoLimite('')}
        onDigitar={(tecla) =>
          setValor((v) => (tecla === 'apagar' ? v.slice(0, -1) : v + tecla))
        }
        onGirarTela={async () => {
          await despachar({
            tipo: 'lancar-retirada', participacaoId: atual.id,
            valor: Number(valor.replace(/\D/g, '') || '0'),
            // N10: sem motivo escrito, o reducer recusa e o aviso explica.
            motivo: motivoLimite?.trim() || undefined,
          })
          setValor(''); setMotivoLimite(null)
        }}
      >
        {motivoLimite !== null ? (
          <input value={motivoLimite} onChange={(e) => setMotivoLimite(e.target.value)}
            aria-label="Motivo da liberação acima do limite"
            placeholder="Motivo da liberação — fica registrado"
            className="cv-text mt-2.5 h-11 w-full rounded-lg bg-[var(--cv-panel)] px-3 text-[13px] ring-1 ring-amber-500/40 ring-inset outline-none" />
        ) : null}
      </LancarRetirada>
    </div>
  )
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm run test -- testes/fichasTela.test.tsx`
Expected: PASS — 3 testes.

- [ ] **Step 5: Commit**

```bash
git add src/telas/FichasTela.tsx testes/fichasTela.test.tsx
git commit -m "feat: lançar ficha com a tela girada, confirmação e contingência"
```

---

## Task 12: Lançar o rake e ver o veredito

**Files:**
- Create: `caixa-vivo/src/telas/RakeTela.tsx`, `caixa-vivo/src/telas/CaixaTela.tsx`
- Test: `caixa-vivo/testes/rakeECheckpoint.test.ts`

**Interfaces:**
- Consumes: `aplicar` (Task 6); `TurnoEmAberto`, `LancarRake` de `@/sections/turnos-e-rake/components`; `PainelVeredito`, `ListaCheckpoints` de `@/sections/conciliacao-e-relatorio/components`
- Produces: `RakeTela`, `CaixaTela` (ambas sem props)

> Este é o passo 7 do PRD — o coração. O teste é de integração contra o banco: ele prova a regra **N3** (a hora de saída é que define o turno) percorrendo o ciclo inteiro.

- [ ] **Step 1: Escrever o teste que falha**

`caixa-vivo/testes/rakeECheckpoint.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { clienteDeTeste, limparBanco, CLUBE_TESTE, DEALER_JOAO, DEALER_MARCOS } from './banco'
import { aplicar } from '@/dados/aplicar'
import { carregarNoite } from '@/dados/carregarNoite'

const db = clienteDeTeste()
const abrir = () => aplicar(db, CLUBE_TESTE, null, { tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 20000 })

describe('rake e checkpoint', () => {
  beforeEach(limparBanco)

  it('o lançamento de rake grava um checkpoint com veredito', async () => {
    await abrir()
    await aplicar(db, CLUBE_TESTE, null, { tipo: 'abrir-turno', dealerId: DEALER_JOAO })
    const noite = await carregarNoite(db, CLUBE_TESTE)

    const depois = await aplicar(db, CLUBE_TESTE, null, {
      tipo: 'lancar-rake', valor: 180, horaOcorrencia: noite.agora,
    })

    expect(depois.checkpoints).toHaveLength(1)
    expect(depois.checkpoints[0].veredito).toBe('fechado')
    expect(depois.checkpoints[0].diferenca).toBe(0)
  })

  it('A5 — o rake vai para o turno da hora em que SAIU, não da digitação', async () => {
    await abrir()
    await aplicar(db, CLUBE_TESTE, null, { tipo: 'abrir-turno', dealerId: DEALER_JOAO })
    let noite = await carregarNoite(db, CLUBE_TESTE)
    const horaDeSaida = noite.agora            // ainda no turno do João

    await aplicar(db, CLUBE_TESTE, null, { tipo: 'avancar-tempo', minutos: 10 })
    await aplicar(db, CLUBE_TESTE, null, { tipo: 'trocar-dealer', dealerId: DEALER_MARCOS })
    await aplicar(db, CLUBE_TESTE, null, { tipo: 'avancar-tempo', minutos: 5 })

    noite = await aplicar(db, CLUBE_TESTE, null, {
      tipo: 'lancar-rake', valor: 180, horaOcorrencia: horaDeSaida,
    })

    const rake = noite.movimentacoes.find((m) => m.tipo === 'rake')!
    const turnoDoRake = noite.turnos.find((t) => t.id === rake.turnoId)!
    expect(turnoDoRake.numero).toBe(1)
    expect(turnoDoRake.dealerId).toBe(DEALER_JOAO)
  })

  it('o checkpoint acha a ficha que sumiu, na janela certa', async () => {
    await abrir()
    await aplicar(db, CLUBE_TESTE, null, { tipo: 'abrir-turno', dealerId: DEALER_JOAO })
    let noite = await carregarNoite(db, CLUBE_TESTE)

    // 480 saem da caixa sem registro nenhum
    noite = await aplicar(db, CLUBE_TESTE, null, { tipo: 'injetar-furo', valor: 480 })
    noite = await aplicar(db, CLUBE_TESTE, null, {
      tipo: 'lancar-rake', valor: 180, horaOcorrencia: noite.agora,
    })

    expect(noite.checkpoints[0].diferenca).toBe(480)
    expect(noite.checkpoints[0].veredito).toBe('revisar')
  })
})
```

> ⚠️ `injetar-furo` é ação de simulação: ela não persiste nada, só mexe em `furoOculto` na memória. Como `aplicar` recarrega do banco, o furo se perde. **Antes de escrever este teste, confirme o comportamento** — se `furoOculto` não sobreviver ao ciclo, substitua o terceiro teste por um que chame `reducer` direto, sem `aplicar`, e registre no plano que a injeção de furo não é reproduzível contra o banco (é ferramenta de demonstração, não de produto).

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run test -- testes/rakeECheckpoint.test.ts`
Expected: FAIL — nenhum checkpoint gravado.

- [ ] **Step 3: Implementar as duas telas**

`caixa-vivo/src/telas/RakeTela.tsx` — `TurnoEmAberto` recebe `turno`, `dealers` e os dois callbacks (`onAbrirTurno`, `onTrocarDealer`); `LancarRake` recebe `turnoAberto`, `turnosFechados`, `horaAtual`, `valor`, `horaSaida` e despacha:

```tsx
onLancar={() => void despachar({
  tipo: 'lancar-rake',
  valor: Number(valor.replace(/\D/g, '') || '0'),
  // Ancorado em `agora` para a sessão sobreviver à meia-noite.
  horaOcorrencia: paraMinutosPertoDe(noite.agora, horaEfetiva),
})}
```

`caixa-vivo/src/telas/CaixaTela.tsx` — `PainelVeredito` recebe `atual` e `ultimoCheckpoint`; `ListaCheckpoints` recebe a lista. Estado vazio quando não há checkpoint: o próprio `PainelVeredito` já desenha *"Nenhum rake lançado ainda"* quando `ultimoCheckpoint` é `null`.

- [ ] **Step 4: Rodar e ver passar**

Run: `npm run test -- testes/rakeECheckpoint.test.ts`
Expected: PASS — 3 testes (ou 2 mais o registro da ressalva do Step 1).

- [ ] **Step 5: Commit**

```bash
git add src/telas/RakeTela.tsx src/telas/CaixaTela.tsx testes/rakeECheckpoint.test.ts
git commit -m "feat: lançar rake e congelar o veredito do checkpoint"
```

---

## Task 13: Provar que nenhum dado de exemplo está sendo apresentado como real

**Files:**
- Create: `caixa-vivo/testes/sem-dados-simulados.test.ts`
- Create: `caixa-vivo/scripts/verificar-dados-reais.mjs`
- Modify: `caixa-vivo/package.json` (script `verificar`)

**Interfaces:**
- Consumes: o build de produção (`dist/`)
- Produces: `npm run verificar` — sai com código 1 se qualquer sinal de dado de exemplo estiver no app

> **Por que isto é uma tarefa e não uma nota de rodapé.** O pacote exportado traz `sample-data.json` em toda seção, e os componentes foram desenhados contra ele. O erro mais fácil de cometer — e o mais difícil de perceber — é uma tela puxar o exemplo "só para não ficar vazia". O resultado é um app que mostra Paulo Vidal e R$ 20.000 num clube que nunca abriu sessão. Isto precisa falhar em CI, não na frente do dono do clube.

- [ ] **Step 1: Escrever o teste que falha**

`caixa-vivo/testes/sem-dados-simulados.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

/** Nomes que só existem na noite de demonstração do Design OS. */
const MARCAS_DA_DEMO = [
  'Paulo Vidal', 'Tiago Melo', 'Dedé', 'Nando', 'João Ribeiro', 'Marcos Lima',
  'Cris Andrade', '(11) 99002-7788', 'roteiroInicial', 'noiteVazia',
]

function arquivos(dir: string, acc: string[] = []): string[] {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome)
    if (statSync(caminho).isDirectory()) arquivos(caminho, acc)
    else if (/\.(ts|tsx|json)$/.test(nome)) acc.push(caminho)
  }
  return acc
}

describe('nenhum dado de exemplo apresentado como real', () => {
  const fontes = arquivos('src')

  it('nenhum arquivo de src/ importa sample-data.json', () => {
    const culpados = fontes.filter((f) => readFileSync(f, 'utf8').includes('sample-data'))
    expect(culpados).toEqual([])
  })

  it('nenhum arquivo de src/ importa de product-plan/', () => {
    const culpados = fontes.filter((f) => readFileSync(f, 'utf8').includes('product-plan'))
    expect(culpados).toEqual([])
  })

  it('nenhum nome da noite de demonstração está embutido no código', () => {
    const culpados: string[] = []
    for (const f of fontes) {
      // Os dealers do seed são reais no banco, não no código.
      if (f.endsWith('supabase/seed.sql')) continue
      const texto = readFileSync(f, 'utf8')
      for (const marca of MARCAS_DA_DEMO) {
        if (texto.includes(marca)) culpados.push(`${f} → ${marca}`)
      }
    }
    expect(culpados).toEqual([])
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run test -- testes/sem-dados-simulados.test.ts`
Expected: FAIL — os `sample-data.json` copiados por engano na Task 1, ou nomes vindos de algum componente.

Se falhar, **apague o dado de exemplo** — não relaxe o teste. Os componentes exportados não importam `sample-data.json`: quem importava eram os arquivos `*View.tsx` de prévia, que não foram copiados.

- [ ] **Step 3: Adicionar a verificação sobre o build**

`caixa-vivo/scripts/verificar-dados-reais.mjs`:
```js
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const MARCAS = ['Paulo Vidal', 'Tiago Melo', '(11) 99002-7788', 'roteiroInicial']
const achados = []

function varrer(dir) {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome)
    if (statSync(caminho).isDirectory()) varrer(caminho)
    else if (/\.(js|css|html)$/.test(nome)) {
      const texto = readFileSync(caminho, 'utf8')
      for (const m of MARCAS) if (texto.includes(m)) achados.push(`${caminho} → ${m}`)
    }
  }
}

varrer('dist')

if (achados.length) {
  console.error('A noite de demonstração vazou para o build:')
  for (const a of achados) console.error('  ' + a)
  process.exit(1)
}
console.log('Build limpo: nenhum dado de exemplo apresentado como real.')
```

Adicionar ao `package.json`: `"verificar": "npm run build && node scripts/verificar-dados-reais.mjs"`

- [ ] **Step 4: Rodar e ver passar**

Run: `npm run test -- testes/sem-dados-simulados.test.ts && npm run verificar`
Expected: PASS — 3 testes; e `Build limpo: nenhum dado de exemplo apresentado como real.`

- [ ] **Step 5: Commit**

```bash
git add testes/sem-dados-simulados.test.ts scripts/verificar-dados-reais.mjs package.json
git commit -m "test: falhar quando dado de exemplo é apresentado como real"
```

---

## Task 14: Regressão do fluxo principal da noite

**Files:**
- Create: `caixa-vivo/testes/fluxo-da-noite.test.ts`
- Modify: `caixa-vivo/package.json` (script `verificar-tudo`)

**Interfaces:**
- Consumes: tudo das tasks 1–13
- Produces: `npm run verificar-tudo` — a porta única de "está funcionando"

> Esta é a tarefa que responde "a fatia está de pé?". Ela percorre a noite do PRD §6 de ponta a ponta, contra o Postgres, e checa **os três estados de tela** (vazio, com dado, erro) mais a persistência real: recarregar do banco tem que devolver exatamente o que foi gravado.

- [ ] **Step 1: Escrever o teste da noite inteira**

`caixa-vivo/testes/fluxo-da-noite.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { clienteDeTeste, limparBanco, CLUBE_TESTE, DEALER_JOAO, DEALER_MARCOS } from './banco'
import { aplicar } from '@/dados/aplicar'
import { carregarNoite } from '@/dados/carregarNoite'
import { emMao, participacoesAbertas } from '@/regras/modelo'

const db = clienteDeTeste()
const acao = (a: unknown) => aplicar(db, CLUBE_TESTE, null, a as never)

describe('a noite do PRD, de ponta a ponta e persistida', () => {
  beforeEach(limparBanco)

  it('abre, senta, lança, confirma, troca dealer, lança rake e congela o veredito', async () => {
    // ── Vazio ────────────────────────────────────────────────────────────
    let noite = await carregarNoite(db, CLUBE_TESTE)
    expect(noite.sessao).toBeNull()

    // ── Abertura ─────────────────────────────────────────────────────────
    noite = await acao({ tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 20000 })
    noite = await acao({ tipo: 'abrir-turno', dealerId: DEALER_JOAO })
    expect(noite.sessao!.caixaInicial).toBe(20000)
    expect(noite.turnos).toHaveLength(1)

    // ── Cadastro e mesa (F10, F2) ────────────────────────────────────────
    noite = await acao({
      tipo: 'cadastrar-jogador', nome: 'Rafa', whatsapp: '(11) 98812-4470',
      limite: 3000, sentar: true,
    })
    expect(participacoesAbertas(noite)).toHaveLength(1)
    const participacaoId = participacoesAbertas(noite)[0].id

    // ── Ficha com a tela girada (F3, N2) ─────────────────────────────────
    noite = await acao({ tipo: 'lancar-retirada', participacaoId, valor: 1000 })
    const pendente = noite.movimentacoes.find((m) => m.situacao === 'aguardando')!
    expect(emMao(noite, participacaoId)).toBe(0)          // ficha não saiu ainda

    noite = await acao({ tipo: 'confirmar', movimentacaoId: pendente.id, confirmacao: 'presencial' })
    expect(emMao(noite, participacaoId)).toBe(1000)       // agora saiu

    // ── Contingência (F11, N16) ──────────────────────────────────────────
    noite = await acao({ tipo: 'lancar-retirada', participacaoId, valor: 500 })
    const segunda = noite.movimentacoes.find((m) => m.situacao === 'aguardando')!
    noite = await acao({
      tipo: 'confirmar', movimentacaoId: segunda.id, confirmacao: 'contingencia',
      motivo: 'Jogador atendeu o telefone.',
    })
    const comContingencia = noite.movimentacoes.find((m) => m.id === segunda.id)!
    expect(comContingencia.confirmacao).toBe('contingencia')

    // ── Troca de dealer (F5, N4) ─────────────────────────────────────────
    noite = await acao({ tipo: 'avancar-tempo', minutos: 30 })
    noite = await acao({ tipo: 'trocar-dealer', dealerId: DEALER_MARCOS })
    expect(noite.turnos.filter((t) => t.fim === undefined)).toHaveLength(1)

    // ── Rake e checkpoint (F6, F7 — o coração) ───────────────────────────
    noite = await acao({ tipo: 'lancar-rake', valor: 180, horaOcorrencia: noite.agora })
    expect(noite.checkpoints).toHaveLength(1)
    expect(noite.checkpoints[0].veredito).toBe('fechado')

    // ── Persistência real: recarregar devolve o mesmo ─────────────────────
    const recarregada = await carregarNoite(db, CLUBE_TESTE)
    expect(recarregada.sessao!.id).toBe(noite.sessao!.id)
    expect(recarregada.movimentacoes).toHaveLength(3)     // 2 retiradas + 1 rake
    expect(recarregada.checkpoints).toHaveLength(1)
    expect(emMao(recarregada, participacaoId)).toBe(1500)

    // ── Os dois motivos, em campos separados (PRD v1.7 §9) ───────────────
    const { data: linha } = await db.from('movimentacao')
      .select('motivo_contingencia, motivo_limite').eq('id', segunda.id).single()
    expect(linha!.motivo_contingencia).toBe('Jogador atendeu o telefone.')
    expect(linha!.motivo_limite).toBeNull()
  })

  it('erro de banco aparece, não vira silêncio', async () => {
    await expect(
      aplicar(db, 'clube-inexistente', null, {
        tipo: 'abrir-sessao', clube: 'X', caixaInicial: 1000,
      } as never)
    ).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Rodar e ver falhar (ou passar de primeira)**

Run: `npm run test -- testes/fluxo-da-noite.test.ts`
Expected: FAIL se qualquer tarefa anterior ficou pela metade. A mensagem aponta o passo.

- [ ] **Step 3: Corrigir o que a regressão apontar**

Não escreva código novo aqui. Se o teste falha, o defeito está numa tarefa anterior — volte nela, conserte com o teste dela, e rode esta de novo.

- [ ] **Step 4: A porta única de verificação**

Adicionar ao `package.json`:
```json
{
  "scripts": {
    "verificar-tudo": "npm run provas && npm run test && npm run verificar"
  }
}
```

Run: `npm run verificar-tudo`
Expected: PASS em três blocos —
1. **provas** — 37 asserções das regras herdadas
2. **test** — todos os testes de banco, dados, telas e o anti-dado-simulado
3. **verificar** — build limpo, sem a noite de demonstração dentro

- [ ] **Step 5: Commit**

```bash
git add testes/fluxo-da-noite.test.ts package.json
git commit -m "test: regressão da noite de ponta a ponta contra o banco"
```

---

## Como saber que a fatia está de pé

Rode `npm run verificar-tudo`. Além disso, abra o app com o banco **vazio** e confira, com os olhos:

| Estado | O que tem que aparecer | O que **não pode** aparecer |
|---|---|---|
| **Vazio** | "Nenhuma sessão aberta", campo do caixa inicial | Clube Paris com R$ 20.000, Paulo Vidal, qualquer checkpoint |
| **Carregando** | "Carregando a noite…" antes da primeira resposta | Tela em branco, ou número piscando de um estado antigo |
| **Erro** | O erro do banco em texto, e o botão "Tentar de novo" | Tela vazia fingindo que está tudo bem |
| **Com dado** | Só o que você digitou nesta sessão | Qualquer nome que você não cadastrou |

E a prova final da persistência: **abra a sessão, lance uma ficha, confirme, feche o navegador, abra de novo.** Tudo tem que estar lá.

---

## O que esta fatia deixa em aberto

- **F4** (devolução e extrato), **F9** (relatório), **F12** (painel da noite) e a mesa visual continuam no MVP e são os próximos incrementos, nesta ordem.
- **A conta do checkpoint** segue com a pendência 🔴 do PRD v1.7 §7: a leitura adotada não foi confirmada pelo dono do processo. Se ela mudar, muda `regras/modelo.ts` — e os 37 testes herdados apontam exatamente o que quebra.
- **A mesa visual** aguarda a decisão de D4.
- **Contagem física da caixa.** O `reducer` assume `caixaContado = esperado − furoOculto`, que é ferramenta de simulação. No produto, o operador precisa **digitar** o valor contado no lançamento de rake. Isso é uma mudança de contrato em `lancar-rake` e não cabe nesta fatia — mas sem ela o checkpoint nunca acha furo de verdade. **É o primeiro item do próximo plano.**
