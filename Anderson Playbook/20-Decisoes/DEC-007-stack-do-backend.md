---
owner: Júnior César
version: v1.0
updated: 2026-08-13
status: decidido
---

# DEC-007 — Backend próprio em TypeScript, sobre Postgres puro

## Contexto

A stack combinada no início do projeto é **React + PostgreSQL + TypeScript**, a
mesma do Design OS. O Caixa Vivo foi construído sobre Supabase, e essa escolha
nunca passou por decisão.

De onde ela veio: o [[PKG-Modelo-de-Dados-v1]] (`status: ativo`) é um pacote de
contexto para **modelagem de dados**, e abre com *"Você é arquiteto de dados
especialista em Supabase/PostgreSQL"*. Ele gerou a
[[SPEC-Modelo-de-Dados-Supabase]], que permanece em `status: rascunho` até hoje,
com a ressalva escrita nela mesma: *"rascunho até rodar contra o Supabase e
validar no modo sombra"*.

Nenhuma das DEC-001 a DEC-006 decide stack. Uma ferramenta de modelagem virou
infraestrutura de produção sem ninguém escolher.

E a modelagem que ela trouxe foi descartada: a spec previa 13 tabelas, 3 views e
um livro-razão único `movimentacoes` com campo `dominio`; o que existe são 9
tabelas com outro formato. **Sobrou a dependência sem o motivo dela.**

## Opções consideradas

| Opção | Prós | Contras |
|---|---|---|
| A — Supabase Cloud | Zero trabalho; já estava pronto | Fora da stack combinada; fornecedor no caminho crítico |
| B — Supabase auto-hospedado | Sem fornecedor | 5 serviços para manter, backup e atualização; ainda fora da stack |
| **C — Postgres puro + backend TypeScript** | Volta à stack combinada; sem fornecedor; fecha 3 defeitos de segurança | Precisa escrever o servidor que não existe |

## Decisão

**Opção C.** Backend próprio em Node + TypeScript com Fastify, falando com
Postgres puro pelo driver `pg`. Sem Supabase em lugar nenhum.

## Motivo

Além de voltar à stack, a medição mostrou que o custo é muito menor do que
parecia e que a troca conserta defeitos reais:

- A camada de dados são **duas funções** — `carregarNoite` e `persistirDelta` —
  e as duas já recebem o banco por parâmetro. O `aplicar.ts` já tem a forma
  exata de um endpoint: recebe ação, devolve estado.
- `src/regras/` é TypeScript puro e **não muda uma linha**. O servidor importa
  os mesmos arquivos.
- Hoje o reducer roda no navegador e o navegador escreve no banco. O RLS confere
  *quem* escreve, nunca *o quê*: com a chave `anon` que está no bundle, dá para
  inserir em `movimentacao` sem passar por N6, sem teto de contingência e sem
  aceite. **Mover a regra para o servidor fecha isso.**

## Consequências

- As regras passam a ser inegociáveis: o servidor é a autoridade.
- O RLS **fica**, com `app_operador_id()` no lugar de `auth.uid()`, e o servidor
  faz `set local role caixa_app` — papel sem `DELETE`, o que transforma a **N13**
  de promessa do código em privilégio do banco.
- O clube deixa de ser constante fixa no código do cliente.
- Fecha o **X12**: a migration passa a trazer os `grant` que nunca existiram.
- Passa a existir servidor, então a hospedagem volta a precisar de máquina —
  o front deixa de ser publicável só em CDN e é servido pelo próprio backend.
- **A R11 fica mais dura**: sem rede o app não funciona, e agora de forma mais
  direta. Modo offline continua fora de escopo.

## Relacionado

- [[PKG-Modelo-de-Dados-v1]] · a origem do Supabase
- [[SPEC-Modelo-de-Dados-Supabase]] · rascunho nunca promovido
- `docs/superpowers/specs/2026-08-13-backend-proprio-sem-supabase-design.md`
- PRD §14 R11 · risco de queda de rede
