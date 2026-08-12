---
tags: [melhoria-continua, dashboard, rollback, iteracao, stacktrack]
owner: Anderson
versão: v1.0
data: 2026-08-11
data_revisao: 2026-11-11
status: ativo
---

# Ciclo de Melhoria Contínua — StackTrack

Fecha o ciclo de [[adoption-plan]] e [[governance]]: como saber que a
adoção funciona, o que fazer quando falha, e como iterar em 90 dias.

**Restrição de projeto:** todas as métricas são coletáveis **sem
ferramenta paga**. As fontes são o próprio banco Supabase (free tier), a
contagem física do caixa e o registro em papel do modo sombra.

---

# 1. Dashboard de adoção

Coleta ao fim de cada sessão (~2×/mês por clube), na retrospectiva de 15
minutos.

| # | Indicador | Fórmula | Fonte de dados | Frequência | Threshold de alerta |
|---|---|---|---|---|---|
| **D1** | **Cobertura de registro** | retiradas no app ÷ retiradas no papel × 100 | Comparação app × papel (modo sombra) | Por sessão | **< 95%** → revisão extraordinária |
| **D2** | **Furo de caixa não atribuído** | `Σ saldos + rake validado` ao encerrar | View `v_conciliacao_sessao` | Por sessão | **> R$ 100** → apurar a janela antes de encerrar |
| **D3** | **Atrito do executor** | nº de perguntas feitas pelo responsável pelas fichas | Contagem manual na sessão | Por sessão | **> 5** a partir da 3ª sessão → SOP não está claro |
| **D4** | **Tempo médio da retirada** | média de `hora_lancamento − hora_evento` das retiradas | Tabela `movimentacoes` | Por sessão | **> 3 min** → pior que o papel, veto |
| **D5** | **Taxa de contingência** | movimentações `contingencia` ÷ total × 100 | Tabela `movimentacoes` | Por sessão | **> 20%** → a prova voltou a ser frágil |
| **D6** | **Aceite do dealer** | rakes validados ÷ rakes lançados × 100 | `movimentacoes` tipo `rake` | Por sessão | **< 100%** → pagamento bloqueado |
| **D7** | **Exposição de crédito** | soma de dívidas em aberto ÷ soma dos limites × 100 | View `v_exposicao_jogador` | Por sessão | **> 80%** → revisar limites |

> Nenhum indicador exige ferramenta externa: D2, D4, D5, D6 e D7 saem de
> query no Supabase; D1 e D3 são contagem manual durante o modo sombra.

---

# 2. Plano de rollback

## Critério de ativação

O rollback é ativado se **qualquer** condição abaixo se mantiver:

| Condição | Métrica | Valor | Duração |
|---|---|---|---|
| **RB1** | D4 — tempo médio da retirada | **> 5 min** | 2 sessões consecutivas |
| **RB2** | D1 — cobertura de registro | **< 80%** | 2 sessões consecutivas |
| **RB3** | D2 — furo de caixa | **> R$ 500** com o app como registro oficial | 1 sessão |
| **RB4** | Indisponibilidade do sistema | app fora do ar | **> 30 min** durante uma sessão |

> RB1 é o mais provável. Numa mesa em horário de pico, cada minuto a mais
> por retirada multiplica por 15 recompras — 30 minutos perdidos na noite.

## Passos de rollback — executável em menos de 2 horas

| # | Passo | Responsável | Tempo |
|---|---|---|---|
| 1 | Declarar rollback em voz alta na mesa: "voltamos ao papel agora" | Dono do clube | imediato |
| 2 | Imprimir/pegar o caderno de backup (sempre presente durante F1–F3) | Resp. fichas | 2 min |
| 3 | Transcrever para o papel os saldos abertos de cada jogador na mesa | Resp. fichas | 10 min |
| 4 | Colher assinatura de conferência de cada jogador sobre o saldo transcrito | Resp. fichas + jogadores | 15 min |
| 5 | Congelar o app: nenhuma movimentação nova a partir do corte | Anderson (remoto) ou dono | 5 min |
| 6 | Encerrar a sessão pelo papel, conferência de caixa manual | Dono do clube | 30 min |
| 7 | Exportar o que já estava no app para conciliação posterior | Anderson | 20 min |
| 8 | Registrar o incidente com a métrica que disparou o rollback | Anderson | 15 min |

**Total: ~1h40** — dentro do limite de 2 horas.

> O passo 4 é o que evita transformar um rollback em furo: sem assinatura
> na transcrição, o saldo passa a valer pela memória — exatamente o
> problema original.

## Comunicação

| Quem notifica | Quem é notificado | Canal | Quando |
|---|---|---|---|
| Dono do clube | Jogadores presentes | Verbal, na mesa | No ato |
| Dono do clube | Anderson | WhatsApp "StackTrack — Operação" | Em até 15 min |
| Anderson | Dealers da sessão | WhatsApp | Antes do próximo turno |
| Anderson | Dono do 2º clube | WhatsApp | Em até 24h — evita repetir a falha |

## Critério de reativação

O playbook volta a ser usado quando **todas** forem verdadeiras:

1. A causa raiz do rollback está documentada e corrigida, com versão nova
   do artefato afetado
2. A correção passou por teste com o caso que causou a falha
3. **Uma sessão inteira em modo sombra** rodou sem reincidência
4. Dono do clube aprova a reativação (linha 8 da RACI em [[governance]])

---

# 3. Roteiro de iteração — 90 dias pós-lançamento

Com ~2 sessões/mês por clube, 90 dias equivalem a **~6 sessões**.

## Rodada de melhoria 1 — "Funciona?" · dias 1–30

| Item | Definição |
|---|---|
| **Janela** | Sessões 1 e 2 |
| **O que é coletado** | D1 (cobertura), D3 (atrito), D4 (tempo). Comparação papel × app a cada sessão |
| **O que é analisado** | O app registra tudo que o papel registra? O executor consegue usar? Ficou mais lento? |
| **Quem decide** | Anderson propõe · dono do clube aprova |
| **Entregável** | Relatório de comparação papel × app das 2 sessões + versão corrigida dos SOPs que geraram perguntas |
| **Métricas que decidem** | D3 > 5 perguntas → reescrever o SOP · D4 > 3 min → simplificar o fluxo |

## Rodada de melhoria 2 — "É confiável?" · dias 31–60

| Item | Definição |
|---|---|
| **Janela** | Sessões 3 e 4 |
| **O que é coletado** | D2 (furo), D5 (contingência), D6 (aceite do dealer) |
| **O que é analisado** | O caixa fecha? O invariante `Σ saldos = −rake` bate? Quantas contingências? |
| **Quem decide** | Anderson + dono do clube |
| **Entregável** | 3 sessões consecutivas com caixa fechado — critério de aceitação do piloto do [[BRIEF-Sessao-Poker]] · árvore de autoridade v3 com os casos de borda que apareceram |
| **Métricas que decidem** | D2 > R$ 100 → apurar a janela · D5 > 20% → o aceite virou teatro, revisar o fluxo |

## Rodada de melhoria 3 — "Escala?" · dias 61–90

| Item | Definição |
|---|---|
| **Janela** | Sessões 5 e 6 |
| **O que é coletado** | D7 (exposição de crédito), tempo de treinamento do 2º clube, D1–D6 do clube novo |
| **O que é analisado** | O playbook funciona com outro dono, outro executor, outros dealers — **sem o Anderson na mesa**? |
| **Quem decide** | Anderson + os dois donos de clube |
| **Entregável** | 2º clube rodando em modo sombra · playbook v2 com o que foi específico do clube 1 separado do que é genérico |
| **Métricas que decidem** | D3 do clube 2 > 5 perguntas → o material de treinamento é insuficiente, não o playbook |

## Fluxo de cada rodada

```
Sessão  →  retrospectiva de 15 min  →  dashboard atualizado
   ↓
Métrica fora do threshold?
   ├─ SIM → revisão extraordinária (governance) → correção → sobe versão
   └─ NÃO → segue
   ↓
Fim da rodada → entregável → decisão de avançar de fase
```

---

## Relacionado

- [[adoption-plan]] · [[governance]] · [[PLANO-Adocao-StackTrack]]
- [[relatorio-qa-v2]] · [[ARV-Limites-de-Autoridade]]
- [[SPEC-Modelo-de-Dados-Supabase]] · [[BRIEF-Sessao-Poker]] · [[MOC-StackTrack]]

## Histórico de versões

| Versão | Data | Mudança | Autor |
|---|---|---|---|
| v1.0 | 2026-08-11 | Dashboard de 7 indicadores, rollback em 8 passos (~1h40) e 3 rodadas de melhoria | Anderson |
