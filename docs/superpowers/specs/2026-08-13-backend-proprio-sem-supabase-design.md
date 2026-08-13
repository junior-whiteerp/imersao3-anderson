# Backend próprio: sair do Supabase, ficar em React + Postgres + TypeScript

**Data:** 2026-08-13 · **Dono da decisão:** Júnior César · **Vira:** DEC-007

## Por que

A stack combinada no início do projeto é **React + PostgreSQL + TypeScript** — a
mesma que o Design OS usa. O Supabase nunca foi decidido: ele entrou pelo
`PKG-Modelo-de-Dados-v1`, um pacote de contexto para *modelagem de dados*, e a
`SPEC-Modelo-de-Dados-Supabase` que ele gerou **nunca saiu de `status: rascunho`**.
Nenhuma das DEC-001 a DEC-006 decide stack.

Pior: a modelagem que aquela spec propunha (13 tabelas, 3 views, livro-razão
único com campo `dominio`) foi descartada na implementação, que tem 9 tabelas
com outro formato. **Sobrou a dependência sem o motivo dela.**

## O que este trabalho conserta além da stack

1. **As regras deixam de ser sugestão.** Hoje o reducer roda no navegador e o
   navegador escreve no banco. O RLS confere *quem* escreve, nunca *o quê* — com
   a chave `anon` que está no bundle, dá para inserir em `movimentacao` sem
   passar por N6, sem teto de contingência e sem aceite.
2. **O clube deixa de ser constante de código.** `persistirDelta.ts:4` tem
   `const CLUBE = '1111…'` fixo — o clube de demonstração, em produção.
3. **O X12 fecha.** A migration `0003` traz os `grant` que nunca existiram.

## O que NÃO muda

`src/regras/` inteiro — `modelo.ts`, `reducer.ts`, as regras N1 a N19 e os 83
testes. É TypeScript puro, sem dependência externa. **O servidor importa os
mesmos arquivos, não uma cópia** — este projeto já mantém três cópias que
precisam ser byte a byte idênticas, e não vamos criar a quarta.

## Arquitetura

O `src/dados/aplicar.ts` de hoje **já é o endpoint**:

```ts
aplicar(db, clubeId, operadorId, acao): Promise<Noite>
//  carrega → reduz → grava delta → recarrega → devolve
```

Recebe ação, devolve estado. A migração é mover esse arquivo do navegador para
o servidor, trocando `SupabaseClient` por um pool `pg`.

```
navegador                          servidor                      Postgres
─────────                          ────────                      ────────
despachar(acao)  ──POST /api/acao──►  aplicar()                     │
                                      ├─ carregarNoite  ────────────►
                                      ├─ reducer  (regra, autoridade)
                                      ├─ persistirDelta ────────────►
                                      └─ carregarNoite  ────────────►
             ◄────── Noite ──────────
```

### Estrutura de arquivos

| Caminho | Responsabilidade |
|---|---|
| `servidor/index.ts` | Sobe o Fastify, registra rotas, serve o `dist/` |
| `servidor/banco.ts` | Pool `pg` e `comOperador()` — a transação que aplica RLS |
| `servidor/dados/{carregarNoite,persistirDelta,aplicar}.ts` | Os três de hoje, portados para SQL |
| `servidor/auth/senha.ts` | `scrypt` do `node:crypto`: gerar e conferir |
| `servidor/auth/sessao.ts` | Criar, resolver e destruir sessão |
| `servidor/rotas/{noite,auth}.ts` | As cinco rotas |
| `src/dados/api.ts` | **Novo.** Cliente HTTP magro — o único arquivo do navegador que fala com o servidor |
| `banco/migrations/*.sql` | Sai de `supabase/migrations/`. O SQL não muda |
| `banco/migrar.mjs` | Aplica os `.sql` em ordem, anota em `migracao` |
| `docker-compose.yml` | Um Postgres local. Sai a pilha de 5 serviços do `supabase start` |

### As rotas

| Rota | Corpo | Devolve |
|---|---|---|
| `POST /api/acao` | `Acao` | `Noite` |
| `GET /api/noite` | — | `Noite` |
| `POST /api/entrar` | `{email, senha}` | `{id, nome}` + cookie |
| `POST /api/sair` | — | `204` |
| `GET /api/sessao` | — | `{id, nome}` ou `401` |
| `GET /*` | — | O `dist/` do React |

Um serviço só serve API e front: sem CORS, sem domínio separado, sem variável
duplicada. Para um app de um operador, CDN não compra nada.

## Autenticação

- **Senha:** `scrypt` do `node:crypto`. Zero dependência e zero compilação
  nativa — `bcrypt` e `argon2` exigem build, e isso quebra deploy em imagem magra.
  Formato guardado: `scrypt$N$r$p$salt$hash`, comparado com `timingSafeEqual`.
- **Sessão:** token opaco de 32 bytes em cookie `httpOnly`, `Secure`,
  `SameSite=Lax`, validade de **12 horas** — cobre uma noite inteira, o que
  ataca de frente a **R11**. A tabela `sessao_operador` permite revogar.
- **Não é JWT no `localStorage`:** qualquer XSS lê `localStorage`; cookie
  `httpOnly` não é alcançável por JavaScript.

## Autorização — o RLS fica

Regra que mora só no código é regra que um `if` esquecido derruba. As políticas
continuam no banco; só troca de quem elas perguntam a identidade:

```sql
create function app_operador_id() returns uuid language sql stable as $$
  select nullif(current_setting('app.operador_id', true), '')::uuid
$$;
```

`auth.uid()` → `app_operador_id()`. Nas quatro políticas, mecânico.

**O detalhe que faz isso valer:** dono de tabela ignora RLS no Postgres. Então
toda requisição abre transação e faz:

```sql
set local role caixa_app;              -- papel sem DELETE (N13 vira privilégio)
set local app.operador_id = $1;        -- identidade da requisição
```

`set local` morre com a transação, então uma requisição nunca vaza identidade
para a seguinte. E como `caixa_app` não recebe `DELETE`, a N13 deixa de ser
promessa do código e passa a ser privilégio do banco.

## Testes

- Os testes de regra (a maioria) não tocam banco e não mudam.
- `testes/banco.ts` troca `SUPABASE_URL_TESTE` + `SUPABASE_SERVICE_ROLE_TESTE`
  por um `DATABASE_URL_TESTE`, e o cliente Supabase por um pool `pg`.
- Os 7 arquivos que usam banco passam a usar SQL direto.
- **Novos:** senha (gerar/conferir/rejeitar), sessão (criar/resolver/expirar),
  e uma prova de que o RLS recusa quando `app.operador_id` não está setado.

## O que piora, dito na cara

**A R11 fica mais dura.** Sem rede, hoje o reducer roda no navegador mas o
`persistirDelta` falha — o app já não funciona. Com o reducer no servidor, ele
não funciona de forma mais direta. Mesma R11, já aceita como risco no PRD, e
continua sem modo offline. Fila local com repetição resolveria e é projeto
próprio: **não entra aqui.**

**Cada ação passa a custar uma ida ao servidor.** Para um operador lançando
algumas fichas por minuto, 50–150 ms é invisível. Se um dia incomodar, o
caminho é reduzir otimista no navegador e deixar o servidor corrigir — e aí o
reducer já roda igual nos dois lados, porque é o mesmo arquivo.

## Fora de escopo

Modo offline · múltiplos clubes · níveis de permissão · recuperação de senha
por e-mail · troca de usuário sem recarregar.
