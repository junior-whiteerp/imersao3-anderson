---
tags: [qa, relatorio, metricas, testes, stacktrack]
owner: Anderson
versão: 1.0
data: 2026-08-11
veredito: bloqueado
---

# Relatório de QA — Playbook StackTrack

---

# PARTE 1 — Definição de métricas

Definidas **antes** da execução dos testes, com fórmula explícita.

| # | Métrica | Fórmula | Meta |
|---|---|---|---|
| **M1** | **Cobertura** | processos críticos com ≥ 3 casos de teste ÷ total de processos críticos | ≥ 80% |
| **M2** | **Consistência** | nº de termos ou critérios contraditórios entre SOPs diferentes | 0 |
| **M3** | **Taxa de falha** | casos com status FALHOU ÷ total de casos executados | ≤ 10% |
| **M4** | **Aderência regra ↔ sistema** | regras implementadas no banco ÷ regras escritas no playbook | 100% |

Critério de publicação: as quatro métricas dentro da meta.

---

# PARTE 2 — Suíte de 10 casos de teste

Categorias: fluxo principal (3) · falha de entrada (2) · **casos de borda (3)** · conflito entre documentos (2).

## T01 — Retirada dentro do limite · fluxo principal
- **Entrada:** limite R$ 3.000, R$ 800 já retirados, pede R$ 500
- **Ação esperada:** SOP-Retirada passos 1–6, aceite no celular do jogador
- **Resultado observado:** fluxo completo, responsável explícito por passo
- **Status:** PASSOU

## T02 — Fechamento com saldo devedor · fluxo principal
- **Entrada:** retirou R$ 1.500, devolve R$ 900, paga em Pix
- **Ação esperada:** contagem dupla, extrato linha a linha, aceite, liquidação
- **Resultado observado:** saldo −R$ 600 apurado; árvore cobre o caso devedor
- **Status:** PASSOU

## T03 — Sessão encerra sem divergência · fluxo principal
- **Entrada:** 10h, 8 jogadores, todos liquidados, rake validado
- **Ação esperada:** SOP-Abertura-e-Encerramento passos 5–13
- **Resultado observado:** fecha em `Σ saldos = −rake`
- **Status:** PASSOU

## T04 — Jogador novo sem cadastro · falha de entrada
- **Entrada:** jogador chega pela primeira vez e pede fichas
- **Ação esperada:** executar o SOP de cadastro antes da retirada
- **Resultado observado:** o SOP de cadastro está em `80-Experimentos/`, **não em `10-SOPs/`**. Quem procura o procedimento oficial não encontra
- **Status:** FALHOU

## T05 — Rake sem hora de retirada · falha de entrada
- **Entrada:** dono lança R$ 400 com `hora_retirada` em branco
- **Ação esperada:** bloquear e reinformar
- **Resultado observado:** o SOP instrui preencher mas não trata a ausência; o executor descobre pelo erro do banco
- **Status:** FALHOU

## T06 — Duas retiradas pendentes estourando o limite · **BORDA**
- **Entrada:** limite R$ 3.000; R$ 2.800 aceitos; R$ 300 pendente; pede mais R$ 200
- **Ação esperada:** bloquear e escalar N2 — aceitas + pendentes = R$ 3.100
- **Resultado observado:** regra correta na árvore (ADJ-1), mas `v_exposicao_jogador` **não conta pendentes**. O sistema liberaria
- **Status:** FALHOU
- **Justificativa de borda:** situação atípica mas frequente em pico de mesa, quando vários pedidos coexistem sem aceite

## T07 — Aceite depois de sair da mesa · **BORDA**
- **Entrada:** jogador sai da mesa; 20 min depois abre o link e assina
- **Ação esperada:** aceite inválido, fichas não saem
- **Resultado observado:** ADJ-3 documentado, cancelamento em cascata **não implementado**. Token ainda válido por tempo
- **Status:** FALHOU
- **Justificativa de borda:** cria movimentação válida para fichas nunca entregues — corrompe o invariante do caixa

## T08 — Sistema fora do ar durante a sessão · **BORDA**
- **Entrada:** internet cai às 23h, 6 jogadores na mesa, 3 aceites pendentes
- **Ação esperada:** procedimento de contingência de sistema — registro em papel e reconciliação
- **Resultado observado:** **não existe nenhum procedimento.** Todo o playbook pressupõe o sistema disponível. A contingência prevista cobre o jogador sem celular, não o clube sem sistema
- **Status:** FALHOU
- **Justificativa de borda:** baixa frequência, impacto total — a operação inteira volta ao papel sem regra

## T09 — Limite de contingência ausente no SOP · conflito
- **Entrada:** responsável lê apenas o SOP-Retirada e aplica a 5ª contingência da noite
- **Ação esperada:** bloquear na 4ª e escalar
- **Resultado observado:** o teto de 3 por sessão existe **só** em ARV-Limites-de-Autoridade. Quem lê o SOP nunca descobre o limite
- **Status:** FALHOU

## T10 — Papéis não definidos · conflito
- **Entrada:** clube pequeno onde o dono também entrega as fichas
- **Ação esperada:** o playbook deveria dizer se os papéis podem ser acumulados
- **Resultado observado:** "responsável pelas fichas" e "dono do clube" aparecem em 7 SOPs **sem nenhuma definição de papel**. Se forem a mesma pessoa, a árvore de autoridade perde sentido — ela escalaria para si mesma
- **Status:** FALHOU

---

# PARTE 3 — Resultados

## Total de casos e taxa de aprovação

```
Total executado ......... 10
PASSOU .................. 3   (30%)
FALHOU .................. 7   (70%)

Taxa de aprovação ....... 30%
```

## Métricas calculadas

### M1 — Cobertura: **37,5%** 🔴 (meta 80%)

| Processo | Casos | ≥3? |
|---|:--:|:--:|
| Retirada de fichas | 4 | ✅ |
| Rake e turno do dealer | 3 | ✅ |
| Limites de autoridade | 3 | ✅ |
| Abertura e encerramento | 2 | ❌ |
| Devolução e fechamento | 1 | ❌ |
| Conferência de caixa | 1 | ❌ |
| Cobrança de devedor | 0 | ❌ |
| Pagamento ao dealer | 0 | ❌ |

**3 de 8 = 37,5%**

### M2 — Consistência: **3 contradições** 🔴 (meta 0)

1. Limite de 3 contingências existe na árvore e não no SOP (T09)
2. "Resp. fichas" e "dono do clube" sem definição de papel em 7 SOPs (T10)
3. DEC-005 exige verificação de vínculo do dealer; nenhum SOP a descreve

### M3 — Taxa de falha: **70%** 🔴 (meta ≤10%)

### M4 — Aderência regra ↔ sistema: **0%** 🔴 (meta 100%)

ADJ-1 e ADJ-3 estão escritos e não implementados. Testados em T06 e T07 — ambos falharam.

## Falhas encontradas

| Caso | Problema | Correção | Owner | Prioridade |
|---|---|---|---|---|
| T08 | Sem contingência de sistema | Criar `SOP-Contingencia-de-Sistema` | Anderson | 🔴 Crítico |
| T06 | ADJ-1 não implementado | `v_exposicao_jogador` contar `pendente` | Anderson | 🔴 Crítico |
| T07 | ADJ-3 não implementado | Cancelar pendentes e invalidar tokens ao encerrar participação | Anderson | 🔴 Crítico |
| T10 | Papéis não definidos | Declarar no briefing se resp. fichas e dono são pessoas distintas | Anderson | 🔴 Crítico |
| T04 | SOP de cadastro fora de `10-SOPs/` | Promover e linkar no MOC | Anderson | 🟠 Importante |
| T09 | Limite de contingência ausente no SOP | Incluir o teto de 3/sessão no SOP-Retirada | Anderson | 🟠 Importante |
| T05 | Campo obrigatório vazio sem tratamento | Linha na árvore: em branco → bloquear e reinformar | Anderson | 🟡 Melhoria |

## Observação sobre consistência entre documentos

As 3 contradições têm **a mesma causa**: regra que vive em um documento
só. O teto de contingência está na árvore mas não no SOP que o executor
lê. A verificação de vínculo do dealer está numa decisão mas não no
procedimento. A informação **existe e está no lugar errado**.

Isso é diferente de informação faltando — é rastreabilidade quebrada. E
explica por que a taxa de falha (70%) convive com 5/5 na rubric de forma:
cada documento está correto **sozinho**; o conjunto é que não fecha.

## Veredito

| Métrica | Resultado | Meta | Status |
|---|:--:|:--:|:--:|
| M1 Cobertura | 37,5% | 80% | 🔴 |
| M2 Consistência | 3 | 0 | 🔴 |
| M3 Taxa de falha | 70% | ≤10% | 🔴 |
| M4 Aderência | 0% | 100% | 🔴 |

**PLAYBOOK BLOQUEADO PARA PUBLICAÇÃO.** Desbloqueio exige os 4 críticos.

> O playbook passou **5/5 na rubric de forma** e reprovou em **4 de 4
> métricas de QA**. As duas coisas são verdadeiras ao mesmo tempo — por
> isso forma e executabilidade precisam ser medidas separadamente.

## Relacionado

- [[casos-de-teste-v1]] · [[checklist-qa-v1]] · [[QA-Playbook-2026-08-11]]
- [[ARV-Limites-de-Autoridade]] · [[SPEC-Modelo-de-Dados-Supabase]]
- [[MOC-StackTrack]]
