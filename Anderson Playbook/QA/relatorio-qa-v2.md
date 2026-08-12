---
tags: [qa, relatorio, metricas, testes, plano-de-correcao, stacktrack]
owner: Anderson
versão: 2.0
data: 2026-08-11
veredito: bloqueado
casos: 15
categorias: 4
---

# Relatório de QA v2 — Playbook StackTrack

Suíte estendida. Complementa [[relatorio-qa-v1]] (10 casos) com 5 casos
adicionais e plano de correção com critério de aceitação.

---

# PARTE 1 — Suíte de 15 casos · 4 categorias

## Categoria A — Fluxo principal (4 casos)

| # | Entrada | Ação esperada | Resultado observado | Status |
|---|---|---|---|---|
| **A1** | Limite R$ 3.000, R$ 800 retirados, pede R$ 500 | [[SOP-Retirada-de-Fichas]] passos 1–6, aceite no celular do jogador | Fluxo completo; responsável explícito por passo, inclusive os 3 que não são do resp. fichas | ✅ PASSOU |
| **A2** | Retirou R$ 1.500, devolve R$ 900, paga em Pix | [[SOP-Devolucao-e-Fechamento]] — contagem dupla, extrato, aceite, liquidação | Saldo −R$ 600 correto; árvore cobre o caso devedor | ✅ PASSOU |
| **A3** | Rake retirado 21:05, lançado 21:12 | [[SOP-Rake-e-Turno-do-Dealer]] passos 4–10 | Atribuição correta pela `hora_retirada` | ✅ PASSOU |
| **A4** | Sessão 10h, 8 jogadores, todos liquidados | [[SOP-Abertura-e-Encerramento-de-Sessao]] passos 5–13 | Fecha em `Σ saldos = −rake` | ✅ PASSOU |

## Categoria B — Falhas de entrada (4 casos)

| # | Entrada | Ação esperada | Resultado observado | Status |
|---|---|---|---|---|
| **B1** | Jogador novo pede fichas | Executar SOP de cadastro antes | SOP de cadastro está em `80-Experimentos/`, não em `10-SOPs/`. Não é encontrável pelo MOC | ❌ FALHOU |
| **B2** | Rake lançado sem `hora_retirada` | Bloquear e reinformar | SOP instrui preencher, não trata a ausência. Executor descobre pelo erro do banco | ❌ FALHOU |
| **B3** | Jogador recusa informar CPF | Prosseguir — campo opcional | Explícito no SOP e permitido na spec | ✅ PASSOU |
| **B4** | Dealer de outro clube alocado a um turno | Bloquear a alocação | [[DEC-005-dealer-global-entre-clubes]] exige trigger; nenhum SOP descreve a verificação | ❌ FALHOU |

## Categoria C — Casos de borda (4 casos)

| # | Entrada | Ação esperada | Resultado observado | Status |
|---|---|---|---|---|
| **C1** | R$ 2.800 aceitos + R$ 300 pendente, pede R$ 200 (limite 3.000) | Bloquear e escalar N2 | Regra correta (ADJ-1); `v_exposicao_jogador` não conta pendentes. **Sistema liberaria** | ❌ FALHOU |
| **C2** | Jogador sai da mesa e assina 20 min depois | Aceite inválido | ADJ-3 escrito, cascata não implementada. Token válido por tempo | ❌ FALHOU |
| **C3** | Internet cai às 23h, 6 jogadores, 3 aceites pendentes | Contingência de sistema com registro em papel e reconciliação | **Não existe procedimento algum.** A contingência prevista cobre o jogador sem celular, não o clube sem sistema | ❌ FALHOU |
| **C4** | 4ª contingência, dono sem responder em 5 min | Não entregar fichas | A2 escala, A1 bloqueia. Correto | ✅ PASSOU |

## Categoria D — Conflitos entre documentos (3 casos)

| # | Entrada | Ação esperada | Resultado observado | Status |
|---|---|---|---|---|
| **D1** | Dealer some sem validar o rake do último turno | Encerrar com pendência registrada | Conflito resolvido por ADJ-2; os dois SOPs concordam | ✅ PASSOU |
| **D2** | Executor lê só o SOP e aplica a 5ª contingência | Bloquear na 4ª | Teto de 3/sessão existe **só** em [[ARV-Limites-de-Autoridade]] | ❌ FALHOU |
| **D3** | Clube pequeno: dono também entrega fichas | Playbook deveria dizer se os papéis acumulam | "Resp. fichas" e "dono" em 7 SOPs sem definição. Se for a mesma pessoa, ela escala para si mesma | ❌ FALHOU |

**Consolidado: 15 casos · 6 PASSOU (40%) · 9 FALHOU (60%)**

---

# PARTE 2 — Métricas com análise

## M1 — Cobertura: 37,5% 🔴 (meta 80%)

3 de 8 processos críticos com ≥ 3 casos.

> **Interpretação:** os três documentos bem cobertos são exatamente os que
> recebi mais atenção nesta sessão. `SOP-Cobranca` e
> `SOP-Pagamento-Diferido` têm **zero** casos — e são os que movimentam
> mais dinheiro (R$ 6.000/sessão em crédito, mais a folha do dealer).
> **Testei o que estava fresco, não o que era crítico.** Viés de atenção,
> não de método — e é o tipo de erro que só uma métrica de cobertura
> expõe, porque a sensação de "testei bastante" era verdadeira.

## M2 — Consistência: 3 contradições 🔴 (meta 0)

> **Interpretação:** as três têm a **mesma causa** — regra que vive em um
> documento só. Não é informação faltando; é informação no lugar errado.
>
> Isso explica o paradoxo do playbook: **5/5 na rubric de forma e 40% de
> aprovação no QA.** Cada documento está correto isoladamente. O conjunto
> é que não fecha. Rubric audita o arquivo; QA audita o sistema de
> arquivos.

## M3 — Taxa de falha: 60% 🔴 (meta ≤ 10%)

> **Interpretação:** das 9 falhas, **apenas 4 são de documentação**. As
> outras 5 são de implementação (C1, C2), lacuna estrutural (C3, B4) ou
> localização de arquivo (B1). Ou seja: o playbook escrito está melhor do
> que o número sugere — o que falha é a **ponte entre o escrito e o
> executado**.

## M4 — Aderência regra ↔ sistema: 0% 🔴 (meta 100%)

> **Interpretação:** a métrica mais dura e a mais útil. Duas regras
> corretas (ADJ-1, ADJ-3), nascidas de teste de borda, existem **só no
> papel**. Regra que o sistema não impõe depende de alguém lembrar — e a
> premissa do playbook inteiro é justamente não depender de memória. **Uma
> regra não implementada é pior que uma regra ausente**, porque cria falsa
> sensação de controle.

## M5 — Distribuição do risco por categoria

| Categoria | Casos | Falhas | Taxa |
|---|:--:|:--:|:--:|
| Fluxo principal | 4 | 0 | **0%** |
| Falhas de entrada | 4 | 3 | 75% |
| Casos de borda | 4 | 3 | 75% |
| Conflitos entre documentos | 3 | 2 | 67% |

> **Interpretação — o achado central deste relatório:** o caminho feliz
> tem **0% de falha**. Tudo que quebra está fora dele.
>
> Se eu só tivesse testado o fluxo principal, o playbook teria passado com
> 100% e ido para o piloto carregando 9 defeitos. **A qualidade do QA está
> inteiramente nas categorias que não são o caminho feliz** — e é
> exatamente por isso que teste conduzido por quem escreveu tende a
> aprovar: a pessoa testa o fluxo que imaginou.

---

# PARTE 3 — Plano de correção

| ID | Falha | Correção necessária | Owner | Prioridade | Critério de aceitação |
|---|---|---|---|---|---|
| **F1** | C3 — sem contingência de sistema | Criar `SOP-Contingencia-de-Sistema`: registro em papel, tratamento das pendências, reconciliação ao voltar | Anderson | 🔴 Crítico | Executar C3 com o novo SOP e o executor concluir sem consultar ninguém |
| **F2** | C1 — ADJ-1 não implementado | `v_exposicao_jogador` somar `status IN ('aceita','pendente')` | Anderson | 🔴 Crítico | Reexecutar C1 e o sistema bloquear a 2ª retirada |
| **F3** | C2 — ADJ-3 não implementado | Cancelar `movimentacoes` pendentes e invalidar `tokens_aceite` ao encerrar `participacoes` | Anderson | 🔴 Crítico | Reexecutar C2 e o aceite tardio ser recusado |
| **F4** | D3 — papéis não definidos | Declarar em [[BRIEF-Sessao-Poker]] se resp. fichas e dono são pessoas distintas; se acumulam, definir quem exerce o N2 | Anderson | 🔴 Crítico | Briefing define os papéis e a árvore trata o acúmulo |
| **F5** | B4 — vínculo do dealer não verificado | Trigger no banco + linha no passo 1 de [[SOP-Rake-e-Turno-do-Dealer]] | Anderson | 🟠 Importante | Alocação de dealer não vinculado ser recusada pelo banco |
| **F6** | B1 — SOP de cadastro fora do lugar | Promover para `10-SOPs/` e linkar no [[MOC-StackTrack]] | Anderson | 🟠 Importante | Procedimento alcançável a partir do MOC em 1 clique |
| **F7** | D2 — limite de contingência ausente no SOP | Incluir o teto de 3/sessão em [[SOP-Retirada-de-Fichas]] com link para a árvore | Anderson | 🟠 Importante | Executor descobrir o limite lendo só o SOP |
| **F8** | B2 — campo obrigatório vazio | Linha na árvore do SOP: campo em branco → bloquear e reinformar | Anderson | 🟡 Melhoria | Reexecutar B2 e o SOP dar a instrução antes do erro do banco |
| **F9** | M1 — cobertura de 37,5% | Escrever ≥ 3 casos para cobrança e pagamento de dealer | Anderson | 🟠 Importante | Cobertura ≥ 80% |
| **F10** | Escopo dos SOPs não delimitado | Seção "fora do escopo" em cada SOP | Anderson | 🟡 Melhoria | Executor ter instrução para recusar pedido fora do processo |

**4 críticos · 4 importantes · 2 melhorias**

## Veredito

| Métrica | Resultado | Meta | Status |
|---|:--:|:--:|:--:|
| M1 Cobertura | 37,5% | 80% | 🔴 |
| M2 Consistência | 3 | 0 | 🔴 |
| M3 Taxa de falha | 60% | ≤10% | 🔴 |
| M4 Aderência regra↔sistema | 0% | 100% | 🔴 |

**BLOQUEADO.** Desbloqueio exige F1 a F4.

## Relacionado

- [[relatorio-qa-v1]] · [[casos-de-teste-v1]] · [[checklist-qa-v1]]
- [[QA-Playbook-2026-08-11]] · [[ARV-Limites-de-Autoridade]]
- [[SPEC-Modelo-de-Dados-Supabase]] · [[BRIEF-Sessao-Poker]] · [[MOC-StackTrack]]
