---
owner: Anderson
version: v1.0
updated: 2026-08-11
status: ativo
tipo: pacote-de-contexto
alvo: Modelo de dados Supabase — StackTrack
---

# Pacote de Contexto — Modelo de Dados Supabase v1

> Pacote versionado. Alimenta a geração do modelo de dados do StackTrack.
> **Referencia** as notas do vault em vez de duplicá-las — assim existe
> uma só verdade. Quando a fonte muda, sobe a versão deste pacote.

## 1. Brief

Você é arquiteto de dados especialista em Supabase/PostgreSQL. Produza o
modelo de dados do StackTrack — app de controle de fichas e débito/crédito
para clubes de pôquer, com prova de aceite em cada movimentação de valor.

Entregue: tabelas, colunas com tipo, chaves, relacionamentos, constraints,
enums e políticas de RLS.

## 2. Fontes de contexto

| Fonte | O que fornece |
|---|---|
| [[BRIEF-Sessao-Poker]] | Problema, AS-IS de 13 etapas, atores, tipos de transação, invariante |
| [[DEC-001-arquitetura-cliente-web]] | Auth assimétrica: admin com conta, jogador com token |
| [[DEC-002-aceite-em-toda-movimentacao]] | Toda movimentação de valor exige aceite da contraparte |
| [[DEC-003-uma-mesa-por-sessao]] | Sessão = mesa; turnos sequenciais; dois timestamps |
| [[DEC-004-aceites-e-cadastro-de-dealer]] | Cadastro permanente + alocação por sessão; pagamento diferido |
| [[SOP-Retirada-de-Fichas]] | Estados da retirada; regra "ficha não sai sem aceite" |
| [[SOP-Devolucao-e-Fechamento]] | Apuração de saldo; formas de liquidação |
| [[SOP-Rake-e-Turno-do-Dealer]] | Rake por turno; atribuição por `hora_retirada` |
| [[SOP-Conferencia-de-Caixa]] | Invariante e janelas de conciliação |
| [[SOP-Cobranca-de-Jogador-Devedor]] | Limite de crédito por jogador; acordos; estados de dívida |
| [[SOP-Pagamento-Diferido-ao-Dealer]] | Obrigação em aberto acumulada entre sessões |

## 3. Restrições

| # | Restrição |
|---|---|
| R2 | Backend **Supabase** (PostgreSQL + RLS + Auth) |
| R3 | Auth assimétrica: admin em `auth.users`; **jogador e dealer não são usuários** — acessam por token de uso único |
| R4 | **LGPD** — CPF, assinatura e histórico financeiro são dados pessoais. Consentimento no cadastro, prazo de retenção definido, RLS por clube |
| R6 | Custo mínimo — cabe no free tier do Supabase |

## 4. Regras de negócio que o modelo deve suportar

1. **Invariante:** `Σ saídas = Σ devoluções + rake` ⟹ `Σ saldos = −rake`
2. Transação tem **direção** (saída / devolução / rake / liquidação / pagamento a dealer)
3. **Nenhuma movimentação de valor sem aceite da contraparte** (exceto devolução, coberta por contagem dupla + aceite do extrato)
4. Rake tem **dois timestamps**: `hora_retirada` e `hora_lancamento`. Atribuição ao turno usa `hora_retirada`
5. Turnos de dealer são **sequenciais e não se sobrepõem** (uma mesa por sessão)
6. Dealer tem **cadastro permanente**; alocação é por sessão
7. Pagamento ao dealer é **diferido** e acumula entre sessões
8. Jogador tem **limite de crédito individual** e dívida que atravessa sessões
9. Ficha só é entregue **após** o aceite registrado
10. Contingência (aceite presencial) exige **justificativa registrada**

## 5. Critérios de aceitação do output

- [ ] Toda tabela tem PK, e FKs com `on delete` explícito
- [ ] Aceite guarda: valor, `created_at`, dispositivo/IP e traço da assinatura
- [ ] Transações têm enum de tipo e de direção — não texto livre
- [ ] Rake tem os dois timestamps como colunas distintas
- [ ] Turnos de dealer têm constraint impedindo sobreposição na mesma sessão
- [ ] Token do jogador tem expiração e uso único
- [ ] RLS isola dados **por clube**
- [ ] Consentimento LGPD e prazo de retenção são colunas, não comentário
- [ ] Saldo é **derivado** das transações, nunca coluna denormalizada sem justificativa
- [ ] O invariante é verificável por query — incluir a query

## 6. Formato esperado

DDL PostgreSQL comentado, uma tabela por bloco, seguido de:
(a) diagrama de relacionamentos em texto, (b) as políticas de RLS,
(c) a query que verifica o invariante.

## 7. Compliance do prompt

> ⚠️ **Nenhum dado real de jogador entra no prompt.** Nomes, CPFs e
> telefones que aparecerem em exemplos são fictícios. O pacote descreve
> **estrutura**, não conteúdo — é o que mantém a geração fora do escopo
> de tratamento de dados pessoais.

## Changelog

| Versão | Data | O que mudou |
|---|---|---|
| v1.0 | 2026-08-11 | Versão inicial, derivada do briefing + 4 decisões + 7 SOPs |
