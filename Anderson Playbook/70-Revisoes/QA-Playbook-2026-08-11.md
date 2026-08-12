---
owner: Anderson
version: v1.0
updated: 2026-08-11
status: ativo
tipo: qa
alvo: 7 SOPs + ARV-Limites-de-Autoridade
---

# QA do Playbook — Testes, Métricas e Privacidade

> Diferente de [[REV-SOPs-2026-08-11]]: aquele testou **forma**, este
> testa **executabilidade**. Aprovação exige ≥ 6/8.

---

## Camada 1 — Casos de teste

Formato: entrada → ação esperada → resultado esperado.
Critério de aprovação: **o executor completa sem consultar ninguém além
do SOP.**

### CT-1 · Caminho feliz — retirada de fichas

| | |
|---|---|
| **Entrada** | Jogador cadastrado, limite R$ 3.000, já retirou R$ 800. Pede R$ 500. Celular com internet |
| **Ação esperada** | Resp. fichas lança R$ 500 (passo 2) · sistema envia link (3) · jogador assina (4) · resp. entrega (6) |
| **Resultado esperado** | Movimentação `aceita`, saldo −R$ 1.300, fichas entregues |
| **SOP** | [[SOP-Retirada-de-Fichas]] |

### CT-2 · Exceção — jogador sem internet

| | |
|---|---|
| **Entrada** | Mesmo jogador, sem sinal no celular. 1ª contingência da sessão |
| **Ação esperada** | Aceite presencial no dispositivo do admin **com justificativa registrada**. A2 permite até 3 por sessão sem escalar |
| **Resultado esperado** | Movimentação `contingencia` com justificativa; fichas entregues; contador em 1/3 |
| **SOP** | [[SOP-Retirada-de-Fichas]] + [[ARV-Limites-de-Autoridade]] A2 |

### CT-3 · Falha — limite estourado com pedido pendente

| | |
|---|---|
| **Entrada** | Limite R$ 3.000, R$ 2.800 aceitos, R$ 300 **pendente de aceite**. Pede mais R$ 200 |
| **Ação esperada** | Bloquear. Aceitas + pendentes = R$ 3.100 > limite. Escalar N2, prazo 5 min |
| **Resultado esperado** | Retirada não liberada; dono decide |
| **Status** | 🔴 **A regra escrita está correta (ADJ-1), o sistema ainda não implementa.** Hoje o app liberaria |

### CT-4 · Falha — dealer some sem validar rake

| | |
|---|---|
| **Entrada** | Fim da sessão, rake do último turno lançado, dealer foi embora |
| **Ação esperada** | Encerrar a sessão com pendência registrada; bloquear só o pagamento daquele dealer |
| **Resultado esperado** | Sessão `encerrada`, obrigação do dealer em aberto |
| **Status** | ✅ Corrigido em ADJ-2. Antes travava a sessão |

### CT-5 · Falha — executor não sabe o que fazer

| | |
|---|---|
| **Entrada** | Caixa não fecha por R$ 480 **e** houve 2 contingências na mesma janela |
| **Ação esperada** | A3 manda escalar N2 (faixa R$ 100–500) e investigar as contingências primeiro |
| **Resultado esperado** | Dono revisa a janela na sessão |
| **Status** | 🟡 Coberto após refinamento, mas **nunca testado com pessoa real** |

---

## Camada 2 — Métricas operacionais

Escala: 0 = falha · 1 = parcial · 2 = aprovado. Mínimo 6/8.

| Dimensão | Como se mede | Avaliável da mesa? |
|---|---|---|
| **Clareza** | Executor seguiu sem perguntar? | ❌ exige pessoa real |
| **Completude** | Todos os passos necessários estão presentes? | ✅ |
| **Consistência** | Dois executores chegam ao mesmo resultado? | ❌ exige 2 pessoas |
| **Rastreabilidade** | Cada decisão tem critério documentado? | ✅ |

### Resultado

| SOP | Clareza | Completude | Consistência | Rastreab. | Score |
|---|:--:|:--:|:--:|:--:|:--:|
| SOP-Retirada-de-Fichas | ? | 2 | ? | 2 | **4/4 · 2 pendentes** |
| SOP-Devolucao-e-Fechamento | ? | 2 | ? | 2 | 4/4 · 2 pendentes |
| SOP-Rake-e-Turno-do-Dealer | ? | 2 | ? | 2 | 4/4 · 2 pendentes |
| SOP-Conferencia-de-Caixa | ? | 2 | ? | 2 | 4/4 · 2 pendentes |
| SOP-Abertura-e-Encerramento | ? | 2 | ? | 2 | 4/4 · 2 pendentes |
| SOP-Cobranca-de-Jogador-Devedor | ? | 2 | ? | 2 | 4/4 · 2 pendentes |
| SOP-Pagamento-Diferido-ao-Dealer | ? | 2 | ? | 2 | 4/4 · 2 pendentes |

> 🔴 **Nenhum SOP está aprovado no QA — e isso é o achado da lição.**
>
> Metade das dimensões (**clareza** e **consistência**) só pode ser
> medida com outra pessoa executando. Da mesa, o teto é 4/8 — abaixo do
> corte de 6/8.
>
> **QA de playbook não se faz sozinho.** A rubric de forma passou 5/5
> porque forma se audita no papel; executabilidade, não.

### Como fechar o QA

Na próxima sessão do clube, em modo sombra:

1. Entregar `SOP-Retirada-de-Fichas` impresso ao responsável pelas fichas
2. Não explicar nada verbalmente
3. Anotar **cada vez que ele perguntar algo** → cada pergunta é uma falha de clareza
4. Rodar CT-1, CT-2 e CT-5 na sessão real
5. Pontuar clareza e consistência com dado observado

---

## Camada 3 — Checklist de segurança e privacidade

Pré-requisito de publicação. Qualquer resposta problemática bloqueia.

| # | Pergunta | Resposta | Status |
|---|---|---|---|
| a | Coleta ou processa dados pessoais? | **SIM** — nome, WhatsApp, CPF opcional, assinatura, histórico financeiro | ⚠️ exige tratamento |
| b | Há dados reais de clientes em exemplos ou templates? | **NÃO** — exemplos usam valores e situações fictícias | ✅ |
| c | Quem tem acesso a este documento? | Vault local do Anderson. **Sem controle de acesso definido para o time** | 🔴 **bloqueia** |
| d | Há credenciais, tokens ou senhas no documento? | **NÃO** — a spec descreve `token_hash`, nunca token em claro | ✅ |
| e | Alinhado com política de retenção? | Parcial — `retencao_dias` existe na spec (1825), **sem job de expurgo** | 🔴 **bloqueia** |

### Bloqueios a resolver antes de publicar

**🔴 B1 — Controle de acesso indefinido.**
Os SOPs citam limites de crédito, valores de dívida e regras de
pagamento de dealer. Se o vault for compartilhado inteiro com a equipe,
o responsável pelas fichas passa a ver a remuneração do dealer e a
dívida de todos os jogadores.

*Correção:* definir o que cada papel enxerga. O `SOP-Retirada-de-Fichas`
pode ser público para a equipe; `SOP-Pagamento-Diferido-ao-Dealer` e
`SOP-Cobranca-de-Jogador-Devedor`, não.

**🔴 B2 — Retenção sem expurgo.**
`retencao_dias = 1825` está declarado, mas nada apaga nada. Guardar por
5 anos e nunca apagar não é política de retenção — é acúmulo.
Contradiz o consentimento coletado no cadastro.

*Correção:* job de expurgo, ou anonimização após o prazo.

### Ponto forte

✅ **LGPD virou estrutura, não lembrete.** `consentimento_lgpd_em` é
`not null` em [[SPEC-Modelo-de-Dados-Supabase]] — não existe jogador
cadastrado sem consentimento. O banco recusa.

---

## Veredito

| Camada | Resultado |
|---|---|
| Casos de teste | 5 documentados · 1 falha conhecida (CT-3, ADJ-1 não implementado) |
| Métricas | **Bloqueado** — 4/8 é o teto sem executor real |
| Privacidade | **Bloqueado** — B1 e B2 |

**O playbook NÃO está pronto para publicação.** Três bloqueios:

1. Rodar o teste de clareza com o responsável pelas fichas (modo sombra)
2. Definir controle de acesso por papel (B1)
3. Implementar expurgo de retenção (B2)

## Relacionado

- [[REV-SOPs-2026-08-11]] · rubric de forma
- [[ARV-Limites-de-Autoridade]] · casos de borda
- [[SPEC-Modelo-de-Dados-Supabase]] · [[MOC-StackTrack]]

## Histórico

| Versão | Data | O que mudou |
|---|---|---|
| v1.0 | 2026-08-11 | Primeiro QA em 3 camadas |
