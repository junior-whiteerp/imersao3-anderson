# Subir o StackTrack

> Estado em 2026-08-13. Depois da **DEC-007**, o Caixa Vivo tem backend próprio:
> React + TypeScript + Postgres, sem fornecedor no caminho.

---

## O que existe agora

| | |
|---|---|
| **Repositório** | `junior-whiteerp/imersao3-anderson`, branch `main` |
| **Caixa Vivo** | Um processo Node serve a API **e** a tela. Precisa de Postgres |
| **Design OS** | Bundle estático puro. Não precisa de nada |
| **Testes** | 123, todos contra um Postgres de verdade |

O Caixa Vivo deixou de ser publicável em CDN: **agora existe servidor**. O
Design OS continua estático.

---

## Rodar na sua máquina

```bash
cd caixa-vivo
npm install
npm run banco:subir                    # Postgres em Docker, porta 3432
npm run banco:migrar                   # aplica o esquema
npm run banco:semear                   # clube e dealers
npm run banco:operador -- --email anderson@clubeparis.com --nome "Anderson"
npm run dev                            # API na 3402, tela na 3400
```

A senha é pedida sem eco. Ela **nunca** vai por argumento: `ps` mostra a linha
de comando inteira para qualquer usuário da máquina, e o shell guarda no
histórico. Para automação, use `SENHA_OPERADOR` no ambiente.

Abra `http://localhost:3400`.

---

## Publicar o Caixa Vivo

Precisa de duas coisas: um **Postgres** e um lugar que rode **Node**.

### Na Railway (servidor e banco no mesmo lugar)

```bash
cd /Users/juniorcesar/imersao3
railway link                     # escolha o projeto imersao3-anderson
railway add -d postgres          # o banco
railway add -s caixa-vivo        # o app
```

No serviço `caixa-vivo`, em **Variables**:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` — referência ao serviço de banco |
| `NODE_ENV` | `production` — é o que liga o `Secure` no cookie de sessão |

Em **Settings → Source → Connect Repo**, aponte para
`junior-whiteerp/imersao3-anderson` com **Root Directory** = `caixa-vivo`.
Sem o Root Directory a build falha: a raiz do repositório não tem `package.json`.

O `railway.json` do `caixa-vivo/` já manda:

```
build:  npm run build       (tela + servidor)
start:  npm run migrar-e-subir
```

`migrar-e-subir` aplica as migrations pendentes e então sobe o servidor. É
seguro repetir: cada migration roda uma vez só, anotada na tabela `migracao`.

Depois do primeiro deploy, crie o clube e a conta do operador:

```bash
railway run --service caixa-vivo npm run banco:semear
railway run --service caixa-vivo npm run banco:operador -- \
  --email anderson@clubeparis.com --nome "Anderson"
```

Por fim, **Settings → Networking → Generate Domain**.

### Em qualquer outro lugar

O app é um processo Node comum. Precisa de:

- `DATABASE_URL` apontando para um Postgres 15+
- `PORT` (o provedor injeta)
- `NODE_ENV=production`
- `npm run build` no build, `npm run migrar-e-subir` no start

Serve para Render, Fly, uma VPS com systemd, ou Docker. O Postgres pode ser
Neon, Railway, RDS ou um container seu — as migrations são SQL padrão e não
dependem de extensão além de `pgcrypto`.

---

## Publicar o Design OS

Continua estático, e continua de graça: **Cloudflare Pages → Connect to Git**,
Root Directory `imersao-teste-design`, build `npm run build`, saída `dist`.
O `public/_redirects` já está lá.

---

## Segurança — o que o desenho garante

| | |
|---|---|
| **A regra é do servidor** | O navegador manda a ação e recebe o estado. Ele nunca escreve no banco, então N6, teto de contingência e exigência de aceite não são mais escolha do cliente |
| **Lista branca de ações** | `reiniciar`, `injetar-furo` e `avancar-tempo` são ferramentas da simulação e a API as recusa com 400 |
| **RLS ligado** | Cada requisição roda em transação com `set local role caixa_app` e `set local app.operador_id`. Um operador não enxerga o clube de outro — quem recusa é o Postgres |
| **Sem DELETE** | `caixa_app` não tem o privilégio. A **N13** deixou de ser promessa do código |
| **Senha** | `scrypt` do `node:crypto`, sal novo a cada hash, comparação em tempo constante |
| **Sessão** | Cookie `httpOnly` + `Secure` + `SameSite=Lax`, 12 h. Não é JWT no `localStorage`, que qualquer XSS lê |

---

## Se falhar

| Sintoma | Causa |
|---|---|
| Build não acha `package.json` | **Root Directory** vazio no serviço |
| `Falta DATABASE_URL` no start | Variável não configurada, ou referência ao Postgres escrita errada |
| `permission denied for table X` | `set local role caixa_app` sem `grant caixa_app to <usuário>`. A migration `0001` faz isso sozinha para quem a roda — se o usuário do app for outro, conceda à mão |
| Login responde 401 com a senha certa | O hash foi gerado por outro `banco:operador`, contra outro banco. Rode de novo apontando para o banco certo |
| Tela abre, API dá 404 | O servidor não achou o `dist/`. `npm run build` roda a tela **e** o servidor — conferir se os dois passaram |
| Cookie não persiste em produção | `NODE_ENV` diferente de `production` deixa o cookie sem `Secure`, e o navegador recusa em https |
