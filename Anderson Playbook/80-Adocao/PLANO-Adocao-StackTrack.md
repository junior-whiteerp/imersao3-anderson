---
tags: [adocao, governanca, treinamento, rollout, stacktrack]
owner: Anderson
versão: v1.0
data: 2026-08-11
data_revisao: 2026-11-11
gatilho_revisao: após cada sessão em modo sombra, ou trimestral
status: ativo
---

# Plano de Adoção — Playbook StackTrack

> O playbook tem 30+ arquivos e **ninguém no clube sabe que existe**.
> Este documento resolve isso.

---

## 1. Diagnóstico de adoção

| Fator | Situação |
|---|---|
| Público real | 1 dono de clube · 1 responsável pelas fichas · 2–4 dealers freela · jogadores |
| Frequência de contato | 2 sessões/mês por clube |
| Nível técnico | Baixo — nenhum usa Obsidian ou lê Markdown |
| Resistência esperada | **Alta** — o processo em papel "funciona" há anos |
| Risco de rejeição | Mesa de pôquer é ambiente de pressão; qualquer atrito é rejeitado na hora |

> ⚠️ **Ninguém vai ler o vault.** Executor de mesa não abre Obsidian às
> 23h. O playbook é insumo para **treinar** e para **construir o app** —
> não é material de consumo direto do executor.

---

## 2. Plano de treinamento por papel

| Papel | Precisa saber | Profundidade | Formato | Duração |
|---|---|---|---|---|
| **Dono do clube** | Playbook inteiro, árvore de autoridade, conferência de caixa | Editar e decidir | Walk-through do vault + 3 casos reais | 90 min |
| **Responsável pelas fichas** | SOP-Retirada, SOP-Devolucao, contingências | Executar | **Cartão de bolso de 1 página** + simulação de 2 casos | 30 min |
| **Dealer** | Só o aceite de rake e como validar pelo link | Executar 1 passo | Demonstração de 5 min no primeiro turno | 5 min |
| **Jogador** | Nada. Recebe link, confere valor, assina | Zero treinamento | O produto tem que ser óbvio | — |

### Regra de ouro do treinamento

> **Se o SOP não é bom o suficiente para ensinar, ele não está pronto
> para implantar.**
>
> Teste: entregar `SOP-Retirada-de-Fichas` ao responsável pelas fichas
> **sem explicar nada** e contar quantas perguntas ele faz. Cada pergunta
> é uma falha de clareza — e é exatamente a métrica que falta em
> [[QA-Playbook-2026-08-11]].

### Material derivado

Do vault de 30 arquivos sai **um** artefato de campo:

**Cartão de mesa (1 página, plastificado):**
- Os 6 passos da retirada, numerados
- A regra: ficha não sai antes do aceite
- Limite de contingências: 3 por sessão
- Quando chamar o dono (A1–A4 resumidos)
- O que fazer se o sistema cair

---

## 3. Gestão de mudança cultural

### A resistência prevista

> *"Sempre funcionou no papel. Por que mudar?"*

**Resposta errada:** "porque o playbook é melhor".
**Resposta certa:** o dado do próprio clube.

| Argumento | Número | Fonte |
|---|---|---|
| Furo de caixa sem dono | R$ 300–1.000 em ~50% das sessões | [[BRIEF-Sessao-Poker]] |
| Divergência | 100% das sessões têm ao menos uma | Briefing |
| Tempo em administração manual | ~2h de uma sessão de 10h (20%) | Briefing |
| Crédito concedido às cegas | R$ 6.000/sessão sem ver dívida anterior | [[SOP-Cobranca-de-Jogador-Devedor]] |

### Argumento por papel

| Papel | O que ganha |
|---|---|
| Dono | O caixa fecha sozinho, e ele sabe **quando** não fecha |
| Resp. fichas | Para de ser culpado por furo que não causou — o registro prova |
| **Dealer** | **Pagamento calculado na frente dele**, com histórico. Argumento de retenção |
| Jogador | Não instala nada. Confere o valor antes de assinar |

> O dealer é o aliado inesperado: hoje ele é pago sobre um número que não
> controla. O StackTrack protege o pagamento dele.

### Estratégia: modo sombra, não substituição

Nas 3 primeiras sessões o app roda **em paralelo ao papel**. Ninguém
perde nada se falhar, e a comparação vira a prova:

> *"O papel fechou com furo de R$ 600. O app fechou em zero."*

Adoção por evidência, não por autoridade.

---

## 4. Cronograma de rollout

| Fase | Quando | O que acontece | Critério para avançar |
|---|---|---|---|
| **F0 — Correções** | Antes de tudo | F1–F4 do [[relatorio-qa-v2]] | 4 críticos resolvidos |
| **F1 — Piloto silencioso** | Sessões 1–2 | App rodando com o dono apenas. Resp. fichas continua no papel | App não trava; caixa fecha |
| **F2 — Modo sombra** | Sessões 3–5 | Resp. fichas usa o app **e** o papel. Comparação a cada sessão | Diferença papel × app documentada em 3 sessões |
| **F3 — App oficial** | Sessões 6–8 | App é o registro; papel vira backup | Zero furo não atribuído em 3 sessões |
| **F4 — Segundo clube** | Sessão 9+ | Replicar com outro dono | Clube 1 rodando sem suporte |

**~4 a 5 meses**, dado que o clube roda 2 sessões/mês.

> Esse é o número real, e ele contradiz o objetivo de 90 dias do
> [[BRIEF-Sessao-Poker]]. Os 90 dias cobrem **desenvolvimento e piloto**,
> não adoção completa. Registrar a diferença evita frustração.

---

## 5. Modelo de governança

### Owner por artefato

| Artefato | Owner | Gatilho de revisão |
|---|---|---|
| [[BRIEF-Sessao-Poker]] | Anderson | Mudança na operação do clube |
| SOPs de execução | Anderson | Após cada sessão em modo sombra |
| [[ARV-Limites-de-Autoridade]] | Anderson + dono do clube | Após incidente ou mudança de limite |
| [[SPEC-Modelo-de-Dados-Supabase]] | Anderson | A cada release |
| Pacotes de contexto | Anderson | Quando a fonte referenciada muda |

### Cadência

| Ritual | Quando | Duração | Pergunta central |
|---|---|---|---|
| **Pós-sessão** | Após cada sessão | 15 min | "O que aconteceu que o playbook não previa?" |
| **Revisão mensal** | 1×/mês | 30 min | "Cada SOP ainda reflete a realidade?" |
| **Revisão de incidente** | Ao ocorrer | — | "Qual regra faltou?" |

> A cadência está amarrada a um evento que **já vai acontecer** — a
> sessão do clube. Vault que depende de disposição morre; vault amarrado
> a evento externo sobrevive.

### Regra de versionamento

Já definida no `README.md` do vault: mudou conteúdo → muda `version` e
`updated`; mudança de passo ou critério → sobe versão maior.

---

## 6. Métricas de adoção

| # | Métrica | Baseline | Meta | Como medir |
|---|---|---|---|---|
| A1 | Retiradas registradas no app ÷ total | 0% | 100% | Comparação com o papel no modo sombra |
| A2 | Perguntas do executor por sessão | não medido | ≤ 2 até a 3ª sessão | Contagem durante a sessão |
| A3 | Contingências por sessão | não medido | ≤ 3 | Registro no app |
| A4 | Sessões com caixa fechado | não medido | 100% até F3 | `v_conciliacao_sessao` |
| A5 | Dealers usando validação de rake | 0% | 100% | Aceites registrados |

> **A2 é a métrica de adoção mais honesta.** Se o executor continua
> perguntando na 5ª sessão, o playbook não foi adotado — foi imposto.

---

## 7. Ciclo de melhoria contínua

```
Sessão em modo sombra
   ↓
Registro do que o playbook não previa (15 min pós-sessão)
   ↓
Atualiza SOP / árvore / pacote de contexto  → sobe versão
   ↓
Reaplica o rubric e o QA
   ↓
Próxima sessão
```

Fecha o loop com [[relatorio-qa-v2]]: cada falha nova vira linha no plano
de correção, com owner, prioridade e critério de aceitação.

---

## Riscos de adoção

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Resp. fichas rejeita por atrito em horário de pico | **Alta** | Alto | Medir tempo da etapa 4 no modo sombra; se piorar contra o papel, o piloto falhou mesmo com o caixa fechando |
| Internet do clube cair | Média | **Alto** | F1 do [[relatorio-qa-v2]] — `SOP-Contingencia-de-Sistema` é pré-requisito |
| Dono do clube não adotar a árvore de autoridade | Média | Alto | Ele definiu as regras; reforçar que o ganho é parar de ser interrompido |
| Dealer recusar validar rake | Baixa | Médio | Enquadrar como proteção do pagamento dele, nunca como controle |
| Playbook desatualizar | **Alta** | Alto | Cadência pós-sessão + owner nomeado por artefato |

## Relacionado

- [[BRIEF-Sessao-Poker]] · [[relatorio-qa-v2]] · [[ARV-Limites-de-Autoridade]]
- [[QA-Playbook-2026-08-11]] · [[MOC-StackTrack]]

## Histórico de versões

| Versão | Data | Mudança | Autor |
|---|---|---|---|
| v1.0 | 2026-08-11 | Versão inicial | Anderson |
