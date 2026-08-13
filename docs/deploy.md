# Subir o StackTrack — GitHub, Supabase e Railway

> Estado em 2026-08-12. O repositório está publicado; os dois passos de
> infraestrutura que faltam dependem de conta e cartão, e por isso são seus.

---

## O que já está pronto

| | |
|---|---|
| **GitHub** | `git@github.com:junior-whiteerp/imersao3-anderson.git`, branch `main`. Um repositório só, com os três históricos dentro |
| **Build dos dois apps** | `npm run build` passa limpo nos dois |
| **Servir em produção** | `railway.json` em cada app, com `vite preview` na porta que a Railway injeta. Testado local: raiz 200, rota interna 200 (fallback de SPA), domínio desconhecido 200 |

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

## Passo 2 — Railway  🔴 depende de você

**O trial da conta expirou.** `railway init` responde
*"Your trial has expired. Please select a plan to continue using Railway."*
Sem plano escolhido não dá para criar projeto. O plano Hobby resolve.

Depois de escolher o plano:

```bash
cd /Users/juniorcesar/imersao3
railway init -n imersao3-anderson -w 2d92980d-d907-432c-9e99-524c4b788bcd
```

### O serviço do Caixa Vivo

```bash
railway add -s caixa-vivo \
  -v "VITE_SUPABASE_URL=<Project URL do passo 1>" \
  -v "VITE_SUPABASE_ANON_KEY=<chave anon do passo 1>"

railway up caixa-vivo --path-as-root -s caixa-vivo
```

As duas variáveis são de **build**, não só de execução: o Vite grava o valor
dentro do bundle. Trocar a chave exige **rebuild**, não restart.

Se faltar qualquer uma das duas, o app quebra no boot com uma mensagem clara —
está escrito assim de propósito em `src/dados/supabase.ts`. O Caixa Vivo não
tem modo de demonstração, e não pode ter: um app que cai para dados de exemplo
quando o banco some fica com cara de funcionando enquanto o caixa da noite não
está sendo registrado em lugar nenhum.

### O serviço do Design OS

Não precisa de variável nenhuma — é protótipo, roda com dado de amostra.

```bash
railway add -s design-os
railway up imersao-teste-design --path-as-root -s design-os
```

### Gerar as URLs públicas

Em cada serviço: **Settings → Networking → Generate Domain**.

### Opcional: deploy automático a cada push

O `railway up` acima envia o diretório da sua máquina — não liga no GitHub.
Para a Railway construir sozinha a cada push:

**Settings → Source → Connect Repo** → `junior-whiteerp/imersao3-anderson`, e
em **Root Directory** ponha `caixa-vivo` num serviço e `imersao-teste-design`
no outro. Sem o Root Directory a build falha: a raiz do repositório não tem
`package.json`.

---

## Se a build falhar

| Sintoma | Causa provável |
|---|---|
| `Nixpacks build failed` sem package.json | Root Directory não configurado no serviço conectado ao GitHub |
| App abre e quebra com "Falta credencial do banco" | `VITE_SUPABASE_URL` ou `VITE_SUPABASE_ANON_KEY` ausente **na build** |
| Página branca, console com 403 | `allowedHosts` — já está liberado nos dois `vite.config.ts`, então confira se a build pegou o commit certo |
| Login passa, telas vazias, sem erro | X12: faltam os grants. Ver o aviso do passo 1 |
| Deploy sobe e a URL dá 502 | `$PORT` não chegou no start. O `--strictPort` faz falhar alto em vez de silenciar |
