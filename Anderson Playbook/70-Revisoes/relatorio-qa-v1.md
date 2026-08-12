---
tags: [qa, relatorio, metricas, stacktrack]
owner: Anderson
versão: 1.0
data: 2026-08-11
status: ativo
veredito: bloqueado
---

# Relatório de QA — Playbook StackTrack v1

Fontes: [[checklist-qa-v1]] · [[casos-de-teste-v1]] · [[QA-Playbook-2026-08-11]]

---

## Métricas — definidas antes da execução

| # | Métrica | Fórmula | Meta |
|---|---|---|---|
| M-QA1 | **Cobertura** | SOPs com ≥ 3 casos de teste ÷ total de SOPs | ≥ 80% |
| M-QA2 | **Consistência** | nº de termos ou critérios contraditórios entre documentos | 0 |
| M-QA3 | **Taxa de aprovação** | casos ✅ ÷ total de casos | ≥ 90% |
| M-QA4 | **Aderência regra↔sistema** | regras implementadas no banco ÷ regras escritas | 100% |

---

## Resultados

### M-QA1 — Cobertura: **37,5%** 🔴 (meta 80%)

| Documento | Casos | Cobre? |
|---|:--:|:--:|
| SOP-Retirada-de-Fichas | 4 | ✅ |
| SOP-Rake-e-Turno-do-Dealer | 4 | ✅ |
| ARV-Limites-de-Autoridade | 4 | ✅ |
| SOP-Abertura-e-Encerramento | 2 | ❌ |
| SOP-Devolucao-e-Fechamento | 1 | ❌ |
| SOP-Conferencia-de-Caixa | 1 | ❌ |
| SOP-Cobranca-de-Jogador-Devedor | 0 | ❌ |
| SOP-Pagamento-Diferido-ao-Dealer | 0 | ❌ |

**Cobertura = 3/8 = 37,5%**

### M-QA2 — Consistência: **3 contradições** 🔴 (meta 0)

| # | Contradição | Onde |
|---|---|---|
| 1 | Limite de 3 contingências existe na árvore e **não** no SOP | D2 |
| 2 | "Resp. fichas" e "dono do clube" usados em 7 SOPs sem definição de papel | D3 |
| 3 | DEC-005 exige verificação de vínculo do dealer; nenhum SOP a descreve | B4 |

### M-QA3 — Taxa de aprovação: **46,7%** 🔴 (meta 90%)

```
✅ passou   7 / 15   46,7%
🟡 parcial  2 / 15   13,3%
❌ falhou   6 / 15   40,0%
```

### M-QA4 — Aderência regra ↔ sistema: **0%** 🔴 (meta 100%)

Regras escritas na árvore que o banco **não** implementa: ADJ-1 e ADJ-3.
Ambas foram testadas (C1 e C2) e **ambas falharam**.

---

## Análise interpretativa

**1. A taxa de 46,7% não mede qualidade de escrita — mede distância entre
documento e sistema.** Das 6 falhas, **duas** (C1, C2) são de regras
corretamente escritas que o banco não impõe. O playbook está certo; o
software é que não acompanhou. Isso muda a natureza da correção: não é
reescrever documento, é implementar.

**2. A cobertura de 37,5% revela viés de atenção.** Os três documentos
com cobertura alta são justamente os que eu mais trabalhei nesta sessão.
`SOP-Cobranca` e `SOP-Pagamento-Diferido` têm **zero** casos — e são
exatamente os que movimentam mais dinheiro (R$ 6.000/sessão em crédito).
Testei o que era fresco, não o que era crítico.

**3. As 3 contradições têm a mesma causa: regra que vive em um documento
só.** O limite de contingência está na árvore mas não no SOP que o
executor lê. A verificação de vínculo do dealer está numa decisão mas não
no procedimento. **A informação existe e está no lugar errado** — é
rastreabilidade zero em escala pequena.

**4. D3 é a falha mais barata e mais grave.** Se "responsável pelas
fichas" e "dono do clube" forem a mesma pessoa num clube pequeno, a
árvore de autoridade **inteira** perde sentido: a pessoa escalaria para
si mesma. Toda a delegação construída na Lição 5 assume dois papéis
distintos, e isso nunca foi verificado.

---

## Plano de correção

| ID | Falha | Correção | Owner | Prioridade | Critério de aceitação |
|---|---|---|---|---|---|
| F1 | D3 — papéis não definidos | Declarar em [[BRIEF-Sessao-Poker]] se resp. fichas e dono são pessoas distintas; se puderem ser a mesma, definir quem exerce N2 | Anderson | 🔴 Crítico | Briefing define os papéis e a árvore trata o caso de acúmulo |
| F2 | C1 — ADJ-1 não implementado | `v_exposicao_jogador` somar `status IN ('aceita','pendente')` | Anderson | 🔴 Crítico | Caso C1 reexecutado bloqueia a 2ª retirada |
| F3 | C2 — ADJ-3 não implementado | Cancelar `movimentacoes` pendentes e invalidar tokens ao encerrar `participacoes` | Anderson | 🔴 Crítico | Caso C2 reexecutado recusa o aceite tardio |
| F4 | D2 — limite de contingência ausente no SOP | Incluir o teto de 3/sessão em [[SOP-Retirada-de-Fichas]], linkando a árvore | Anderson | 🟠 Importante | Executor descobre o limite lendo só o SOP |
| F5 | B1 — SOP de cadastro fora de `10-SOPs/` | Promover `SOP-Cadastro-de-Jogador-B` para `10-SOPs/`, linkar no MOC | Anderson | 🟠 Importante | Procedimento encontrável pelo MOC |
| F6 | B4 — verificação de vínculo do dealer | Trigger no banco + linha no passo 1 de [[SOP-Rake-e-Turno-do-Dealer]] | Anderson | 🟠 Importante | Alocação de dealer não vinculado é recusada |
| F7 | C3 — N3 sem nome | Nomear quem exerce o N3 em [[ARV-Limites-de-Autoridade]] | Anderson | 🟠 Importante | Executor sabe para quem ligar |
| F8 | Checklist — sem SOP de incidente | Criar SOP de resposta a incidente (vazamento, token comprometido) | Anderson | 🟡 Melhoria | Existe procedimento com prazo de resposta |
| F9 | Checklist — acesso ao vault | Definir o que cada papel enxerga; separar SOPs sensíveis | Anderson | 🟠 Importante | Resp. fichas não vê pagamento de dealer nem dívida geral |
| F10 | Checklist — retenção sem expurgo | Job de expurgo ou anonimização após `retencao_dias` | Anderson | 🟡 Melhoria | Registro além do prazo é expurgado |
| F11 | Cobertura — 5 SOPs sem teste | Escrever ≥3 casos para cada, priorizando cobrança e pagamento de dealer | Anderson | 🟠 Importante | Cobertura ≥ 80% |
| F12 | Fonte do limite de crédito | Documentar quem define o limite, quando e com base em quê | Anderson | 🟠 Importante | Existe procedimento de definição de limite |

**3 críticos · 7 importantes · 2 melhorias**

---

## Veredito

| Métrica | Resultado | Meta | Status |
|---|:--:|:--:|:--:|
| Cobertura | 37,5% | 80% | 🔴 |
| Consistência | 3 | 0 | 🔴 |
| Taxa de aprovação | 46,7% | 90% | 🔴 |
| Aderência regra↔sistema | 0% | 100% | 🔴 |

**PLAYBOOK BLOQUEADO PARA PUBLICAÇÃO.**

Desbloqueio exige os 3 críticos (F1, F2, F3). Os importantes entram no
ciclo seguinte, após a primeira sessão em modo sombra.

> Observação honesta: o playbook **passou 5/5 na rubric de forma** e
> **reprovou em 4 de 4 métricas de QA**. As duas coisas são verdadeiras
> ao mesmo tempo — e é exatamente por isso que forma e executabilidade
> precisam ser medidas separadamente.

## Relacionado

- [[checklist-qa-v1]] · [[casos-de-teste-v1]] · [[QA-Playbook-2026-08-11]]
- [[MOC-StackTrack]]
