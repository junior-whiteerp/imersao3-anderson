# Subir o StackTrack — GitHub, Supabase e Cloudflare Pages

> Estado em 2026-08-13. O repositório está publicado e o código está pronto
> para servir. O que falta depende de login em painel, e por isso é seu.
> A Railway foi tentada e abandonada — o porquê está no passo 2.

---

## O que já está pronto

| | |
|---|---|
| **GitHub** | `git@github.com:junior-whiteerp/imersao3-anderson.git`, branch `main`. Um repositório só, com os três históricos dentro |
| **Build dos dois apps** | `npm run build` passa limpo nos dois |
| **Servir em produção** | `_redirects` em cada app, para a rota interna não dar 404 no CDN. Conferido: o Vite copia os dois para o `dist/` |
| **Sobra da Railway** | `railway.json` continua nos dois apps, com `vite preview` na porta injetada. Inofensivo — o Cloudflare Pages ignora. Fica para o dia em que existir backend |

### Como o repositório ficou montado

Os três repositórios viraram um, por **merge de subárvore**. Todo commit, autor
e data está lá — 63 commits alcançáveis.

O custo, que é real: os commits antigos gravaram caminhos **sem** o prefixo
(`src/regras/modelo.ts`, não `caixa-vivo/src/regras/modelo.ts`). Então:

```bash
git log -- caixa-vivo/src/regras/modelo.ts   # para no merge, não mostra o passado
git log pre-merge/caixa-vivo                 # mostra o histórico inteiro, caminhos originais
git log pre-merge/design-os                  # idem, do Design OS
```

As duas tags estão publicadas. Para ter o histórico com caminho prefixado seria
preciso reescrever os SHAs com `git-filter-repo` — dá para fazer depois, num
clone, sem perder nada.

### ⚠️ Os dois `.git` antigos ainda existem

`caixa-vivo/.git` e `imersao-teste-design/.git` continuam no disco. **Commit
feito lá dentro não aparece no monorepo** — e é a armadilha mais fácil de cair
daqui pra frente. Escolha uma:

- **Apagar os dois** (o histórico já está no monorepo, e as tags marcam a origem)
- **Manter** e lembrar de commitar sempre a partir de `/Users/juniorcesar/imersao3`

Há cópia de segurança dos três `.git` em `tres-gits.tgz`, no scratchpad da
sessão — some quando a sessão for limpa, então mova antes se quiser guardar.

---

## Passo 1 — Supabase Cloud  🔴 depende de você

O Caixa Vivo é SPA pura: não tem servidor próprio. Ele fala direto com o
Supabase, usando **Auth e RLS**. Postgres sozinho não serve — precisa do
GoTrue e do PostgREST, que é o que o Supabase entrega.

```bash
# 1. Login (abre o navegador — só você consegue fazer)
npx supabase login

# 2. Crie o projeto em https://supabase.com/dashboard  (região: São Paulo)
#    Guarde a senha do banco.

# 3. Ligue este repositório ao projeto e suba as migrations
cd /Users/juniorcesar/imersao3/caixa-vivo
npx supabase link --project-ref <REF_DO_PROJETO>
npx supabase db push
```

`db push` aplica `0001_esquema.sql` e `0002_lugar_na_mesa.sql`. **Não** aplica o
`seed.sql` — de propósito: o seed cria um operador com senha escrita em arquivo,
e isso não vai para produção.

### Depois do push, três inserções à mão

O `seed.sql` não viaja, então o clube, o dealer e o operador não existem no ar.
Sem eles ninguém entra: é o risco **R12** do PRD.

1. **Painel → Authentication → Users → Add user.** E-mail e senha reais do
   Anderson. Confirme o e-mail na hora de criar. Copie o **UUID** do usuário.
2. **Painel → SQL Editor**, trocando `<UUID>` pelo que você copiou:

```sql
insert into clube (id, nome, percentual_rake_dealer) values
  ('11111111-1111-1111-1111-111111111111', 'Clube Paris', 0);

insert into dealer (id, clube_id, nome) values
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'João Ribeiro'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Marcos Lima'),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Cris Andrade');

insert into operador (id, clube_id, nome) values
  ('<UUID>', '11111111-1111-1111-1111-111111111111', 'Anderson');
```

3. **Painel → Project Settings → API.** Anote `Project URL` e a chave `anon`.

> ⚠️ **Este passo é o teste do X12.** Não existe nenhum `grant` nas migrations —
> os privilégios do banco local vieram de comando aplicado à mão. Se depois do
> `db push` o app abrir e as telas vierem vazias sem erro de login, é isso: o
> `anon`/`authenticated` não enxerga as tabelas. A correção é uma migration
> `0003` com os grants, e aí o X12 fecha de vez.

---

## Passo 2 — Cloudflare Pages  🟡 cinco cliques seus, por app

### Por que aqui e não na Railway

Os dois apps são **estáticos**: bundle que o navegador baixa, sem servidor
próprio. O Caixa Vivo fala direto com o Supabase a partir do navegador. A
Railway mantém um processo Node de pé 24 horas para entregar arquivo parado —
custa dinheiro e não entrega nada a mais. CDN é a forma certa, e é de graça.

A Railway volta a fazer sentido no dia em que o Caixa Vivo ganhar backend
próprio. Hoje ele não tem.

> As duas contas Railway travaram em cobrança de qualquer forma: a
> `junior-whiteerp` com *"Your trial has expired"*, e a
> `andersonszczepanski90@gmail.com` com *"Your workspace has been restricted.
> Please attach a payment method"*. Ficou criado, vazio, o projeto
> `imersao3-anderson` (`e9095e96-57e2-4100-8f88-b026d83eb012`) com um serviço
> `design-os`. Pode apagar.

### O que fazer, em cada um dos dois apps

Painel da Cloudflare → **Workers & Pages → Create → Pages → Connect to Git** →
repositório `junior-whiteerp/imersao3-anderson`. Depois:

| Campo | Caixa Vivo | Design OS |
|---|---|---|
| Project name | `caixa-vivo` | `design-os` |
| Root directory | `caixa-vivo` | `imersao-teste-design` |
| Framework preset | Vite | Vite |
| Build command | `npm run build` | `npm run build` |
| Build output directory | `dist` | `dist` |

**O Root directory é o campo que decide se funciona.** Sem ele a build roda na
raiz do repositório, que não tem `package.json`.

### As variáveis do Caixa Vivo

Só ele precisa. Em **Settings → Variables and Secrets**, para *Production* e
*Preview*:

```
VITE_SUPABASE_URL       = <Project URL do passo 1>
VITE_SUPABASE_ANON_KEY  = <chave anon do passo 1>
```

São variáveis de **build**, não de execução: o Vite grava o valor dentro do
bundle. Trocar a chave exige **rebuild**, não restart — na Cloudflare,
*Deployments → Retry deployment*.

Se faltar qualquer uma das duas, o app quebra no boot com mensagem clara —
está escrito assim de propósito em `src/dados/supabase.ts`. O Caixa Vivo não
tem modo de demonstração, e não pode ter: um app que cai para dados de exemplo
quando o banco some fica com cara de funcionando enquanto o caixa da noite não
está sendo registrado em lugar nenhum.

O Design OS não precisa de variável nenhuma — é protótipo, roda com dado de
amostra.

### O que já está resolvido no código

`caixa-vivo/public/_redirects` e `imersao-teste-design/public/_redirects`
carregam `/*  /index.html  200`. Sem isso, recarregar a página em `/mesa` ou
abrir direto uma rota de screen design daria **404**: o servidor procuraria um
arquivo que não existe, porque quem resolve a rota é o react-router, dentro do
navegador. O Vite copia os dois para o `dist/` na build — conferido.

Depois de conectado, cada push na `main` dispara build e deploy sozinho.

---

## Se a build falhar

| Sintoma | Causa provável |
|---|---|
| Build falha dizendo que não achou `package.json` | **Root directory** vazio. É o erro número um |
| App abre e quebra com "Falta credencial do banco" | `VITE_SUPABASE_URL` ou `VITE_SUPABASE_ANON_KEY` ausente **na build**. Preencher e refazer o deploy — variável nova não entra em bundle antigo |
| A home abre, mas recarregar numa rota interna dá 404 | O `_redirects` não chegou no `dist/`. Confira se a build pegou o commit certo |
| Login passa, telas vazias, sem erro | **X12**: faltam os grants no banco. Ver o aviso do passo 1 |
| Login recusa com "Database error querying schema" | Campos de token do GoTrue com `NULL` em vez de string vazia. Só acontece se o usuário for criado por SQL à mão em vez do painel |
