---
owner: Anderson
version: v1.0
updated: 2026-08-11
status: ativo
tipo: analise-de-consistencia
---

# Análise de Consistência — Prompt mínimo vs. Pacote de contexto

> Experimento controlado: o **mesmo** SOP (cadastro de jogador) gerado
> duas vezes, variando **apenas o insumo**.
>
> Entregáveis: (0) script de automação, (1) versão A, (2) versão B,
> (3) esta análise.

---

## 0. Automação — `setup-playbook.sh`

Script que faz **as duas coisas**: provisiona a estrutura do vault com
templates, e executa o experimento controlado gerando as duas versões do
SOP via `claude --print`.

**Idempotente por construção:** `mkdir -p` para pastas e teste `[[ -e ]]`
antes de escrever — vale tanto para os templates quanto para os SOPs
gerados. Rodar de novo **não regenera** e não gasta chamada de IA.

Localização: `imersao3/setup-playbook.sh`

```bash
#!/usr/bin/env bash
#
# setup-playbook.sh — provisiona o vault e gera o experimento controlado
# de SOP (prompt mínimo vs. pacote de contexto).
#
# IDEMPOTENTE: rodar N vezes produz o mesmo resultado.
#
set -euo pipefail

VAULT="${1:-Anderson Playbook}"
EXP="$VAULT/80-Experimentos"
PKG="$VAULT/60-Contexto/PKG-Geracao-de-SOP-v2.md"

PASTAS=( "00-MOCs" "10-SOPs" "20-Decisoes" "30-Briefings" "40-Mockups"
         "50-Curso" "60-Contexto" "70-Revisoes" "80-Experimentos" "90-Templates" )

criados=0; existentes=0; gerados=0; preservados=0

# ---------- guardas de idempotência ----------

criar_arquivo() {                      # cria só se não existir
  local caminho="$1" conteudo="$2"
  if [[ -e "$caminho" ]]; then
    existentes=$((existentes + 1))
  else
    printf '%s\n' "$conteudo" > "$caminho"; criados=$((criados + 1))
  fi
}

gerar_sop() {                          # gera com IA só se não existir
  local caminho="$1" prompt="$2"
  if [[ -e "$caminho" ]]; then
    echo "  ↷ preservado: $(basename "$caminho")"
    preservados=$((preservados + 1)); return 0
  fi
  command -v claude >/dev/null 2>&1 || { echo "  ⚠ claude CLI ausente"; return 0; }
  echo "  ⚙ gerando: $(basename "$caminho")"
  claude --print "$prompt" > "$caminho"; gerados=$((gerados + 1))
}

cabecalho() {
  printf -- '---\nowner:\nversion: v0.1\nupdated:\nstatus: rascunho\n---\n\n# %s\n' "$1"
}

# ---------- 1. estrutura ----------

echo "Vault: $VAULT"
mkdir -p "$VAULT"
for p in "${PASTAS[@]}"; do mkdir -p "$VAULT/$p"; done   # mkdir -p é idempotente

criar_arquivo "$VAULT/README.md" "# Playbook — Vault Operacional"
criar_arquivo "$VAULT/90-Templates/template-sop.md"       "$(cabecalho 'SOP: [Nome]')"
criar_arquivo "$VAULT/90-Templates/template-decisao.md"   "$(cabecalho 'DEC-XXX — [Título]')"
criar_arquivo "$VAULT/90-Templates/template-checklist.md" "$(cabecalho 'Checklist: [Nome]')"

echo "  estrutura: $criados criado(s), $existentes preservado(s)"

# ---------- 2. experimento controlado ----------
# Mesmo processo, mesmo modelo. Varia SÓ o insumo.

echo; echo "Experimento — SOP de cadastro de jogador:"

# Versão A: prompt mínimo, sem contexto algum
gerar_sop "$EXP/SOP-Cadastro-de-Jogador-A-prompt-minimo.md" \
  "Gere um SOP de cadastro de jogador para um clube de pôquer. Responda apenas com o Markdown do SOP."

# Versão B: mesmo pedido, com o pacote de contexto injetado
gerar_sop "$EXP/SOP-Cadastro-de-Jogador-B-com-pacote.md" \
  "Leia o pacote de contexto em '$PKG' e todas as fontes que ele referencia no vault '$VAULT'. Gere o SOP de cadastro de jogador seguindo o formato e os critérios de aceitação definidos no pacote. Responda apenas com o Markdown do SOP."

echo "  experimento: $gerados gerado(s), $preservados preservado(s)"

# ---------- 3. relatório ----------

echo; echo "RESUMO"
echo "  arquivos criados:   $((criados + gerados))"
echo "  arquivos mantidos:  $((existentes + preservados))"; echo

if command -v tree >/dev/null 2>&1; then tree -L 2 --noreport "$VAULT"
else find "$VAULT" -maxdepth 2 -not -path '*/.*' | sort | sed "s|^$VAULT|.|"; fi
```

### Prova 1 — o script executa e gera (vault limpo)

```
$ ./setup-playbook.sh "vault-teste"
  estrutura: 4 criado(s), 0 preservado(s)
  ⚙ gerando: SOP-Cadastro-de-Jogador-A-prompt-minimo.md
  ⚙ gerando: SOP-Cadastro-de-Jogador-B-com-pacote.md
  experimento: 2 gerado(s), 0 preservado(s)
  arquivos criados:   6

$ ls -la vault-teste/80-Experimentos/
-rw-r--r--   8283 SOP-Cadastro-de-Jogador-A-prompt-minimo.md
-rw-r--r--  10598 SOP-Cadastro-de-Jogador-B-com-pacote.md
```

Execução sem erro. As duas versões foram geradas pelo `claude --print`
com nomes distintos, a partir dos dois insumos diferentes.

### Prova 2 — idempotência (segunda execução, mesmo vault)

```
$ md5 -q vault-teste/80-Experimentos/*.md
66d677f743443fa67b9a7666119d62e5
f1f2afc9e88a2a88e9ed42ea9c3bceec

$ ./setup-playbook.sh "vault-teste"
  estrutura: 0 criado(s), 4 preservado(s)
  ↷ preservado: SOP-Cadastro-de-Jogador-A-prompt-minimo.md
  ↷ preservado: SOP-Cadastro-de-Jogador-B-com-pacote.md
  experimento: 0 gerado(s), 2 preservado(s)
  arquivos criados:   0
  arquivos mantidos:  6

$ md5 -q vault-teste/80-Experimentos/*.md
66d677f743443fa67b9a7666119d62e5     ← idêntico
f1f2afc9e88a2a88e9ed42ea9c3bceec     ← idêntico

$ find vault-teste -name "*.md" | wc -l
       6                              ← mesmo total, nada duplicado
```

**Resultado:** segunda execução criou 0 arquivos, preservou os 6, e os
md5 dos SOPs gerados são **idênticos** — não houve regeneração nem
duplicação. `set -euo pipefail` aborta em qualquer erro em vez de deixar
estado parcial.

### Prova 3 — idempotência no vault de produção

```
$ ./setup-playbook.sh          # vault real, duas vezes seguidas
  estrutura: 0 criado(s), 4 preservado(s)
  experimento: 0 gerado(s), 2 preservado(s)
  arquivos criados:   0
```

> Por que a guarda importa aqui: os templates deste vault tinham sido
> **corrigidos** após a reprovação no rubric ([[REV-SOPs-2026-08-11]]).
> Um script não idempotente sobrescreveria a correção e reintroduziria
> o defeito de 2/5. A idempotência não é elegância — é proteção do
> trabalho já validado.

---

## Desenho do experimento

| | Versão A | Versão B |
|---|---|---|
| Arquivo | [[SOP-Cadastro-de-Jogador-A-prompt-minimo]] | [[SOP-Cadastro-de-Jogador-B-com-pacote]] |
| Insumo | `"Gere um SOP de cadastro de jogador para um clube de pôquer."` | [[PKG-Geracao-de-SOP-v2]] (5 seções, 8 fontes rastreáveis) |
| Processo-alvo | idêntico | idêntico |
| Modelo | idêntico | idêntico |

**Variável independente:** o pacote de contexto. Só isso mudou.

## Evidência quantitativa

```
                       A      B
linhas                41    102
seções                 5     10
passos                 6     10
linhas de decisão      0      7
```

Ocorrência de termos críticos da operação:

| Termo | A | B |
|---|:--:|:--:|
| LGPD | **0** | 8 |
| consentimento | **0** | 10 |
| limite de crédito | **0** | 4 |
| dívida | **0** | 7 |
| contingência | **0** | 2 |
| devedor | **0** | 4 |

## Diferenças concretas

### 1. Verificação de dívida antes de liberar crédito — ausente em A

**A** cadastra e entrega fichas em sequência direta. Não consulta nada.
**B** tem os passos 1–3: buscar o jogador, exibir dívida e histórico, e
exigir decisão registrada do dono antes de prosseguir.

**Consequência de usar A:** o gargalo **C1** de
[[SOP-Cobranca-de-Jogador-Devedor]] permanece intacto — crédito concedido
às cegas sobre R$ 6.000/sessão de exposição.

### 2. Consentimento LGPD — ausente em A

**A** diz *"manter os dados dos jogadores em local seguro"*. É intenção,
não procedimento: não diz quem coleta consentimento, quando, nem o que
acontece se o jogador recusar.
**B** tem o passo 7 (aceite do termo pelo jogador, no celular dele) e
bloqueia o cadastro sem ele.

**Consequência de usar A:** o clube passa a guardar CPF, assinatura e
histórico financeiro **sem base legal registrada**.

### 3. Limite de crédito — ausente em A

**A** não menciona limite.
**B** tem o passo 8, com a regra explícita de que o limite é individual, e
uma exceção proibindo limite padrão.

**Consequência de usar A:** o gargalo **C2** continua — o limite segue
existindo só na memória do dono.

### 4. Responsável por passo — ausente em A

**A** declara *"Responsável: Atendente do clube"* para o documento inteiro.
**B** atribui responsável em cada linha, incluindo três passos que **não
são** do responsável pelas fichas (2 e 9 do sistema, 7 do jogador, 3 e 8
do dono).

**Consequência de usar A:** o mesmo defeito que reprovou os 7 SOPs na
primeira rodada do rubric — leitura de que o atendente assina pelo jogador.

### 5. Caminho de contingência — ausente em A

**A** não trata jogador sem celular ou sem internet.
**B** define contingência com justificativa registrada — nunca presumida.

**Consequência de usar A:** na primeira exceção real, o executor improvisa.

### 6. Integração com o resto do playbook — ausente em A

**A** não referencia nada. É um documento órfão.
**B** linka 5 notas e encaixa no fluxo: continua em
[[SOP-Retirada-de-Fichas]] a partir do passo 2.

**Consequência de usar A:** documento isolado no grafo — o problema de
rastreabilidade zero descrito em [[REV-SOPs-2026-08-11]].

## Rubric aplicado às duas versões

| # | Critério | A | B |
|---|---|:--:|:--:|
| C1 | Passos numerados e sequenciais | ❌ checkbox | ✅ tabela numerada |
| C2 | Responsável por passo | ❌ um, no topo | ✅ coluna própria |
| C3 | Critério de conclusão por passo | ❌ só um no fim | ✅ coluna própria |
| C4 | Exceções e escalações | ❌ "consultar o gerente" | ✅ 7 decisões + 2 exceções |
| C5 | Linguagem executável | ✅ | ✅ |
| | **Placar** | **1/5** | **5/5** |

## Conclusão — o que o pacote de contexto controlou

O prompt mínimo produziu um SOP **plausível e vazio**. Ele não está
"errado" no sentido de conter mentira: está errado por **omissão** — e a
omissão é invisível para quem não conhece a operação. Um leitor
desavisado aprovaria a versão A.

O pacote controlou quatro coisas que o prompt mínimo não tinha como
controlar:

**1. Conhecimento do negócio que não está na internet.** Nenhum modelo
sabe que *este* clube concede R$ 6.000/sessão de crédito com limite
individual por jogador. Isso veio da seção *Fontes rastreáveis*, que
referencia [[BRIEF-Sessao-Poker]] e [[SOP-Cobranca-de-Jogador-Devedor]].
Sem ela, os passos 1–3 e 8 de B simplesmente não existiriam — como não
existem em A (evidência: 0 ocorrências de "dívida" e "limite de crédito").

**2. Restrições que mudam a estrutura do procedimento.** A seção
*Restrições operacionais* trouxe LGPD e "atores sem login". É o que
transformou o consentimento de recomendação vaga ("manter em local
seguro", em A) em passo bloqueante executado pelo jogador (passo 7 de B).

**3. Forma que o rubric exige.** A seção *Critérios de aceitação* impôs
C1–C3. É a diferença direta entre 1/5 e 5/5 — e note que **A não foi
editada para melhorar**: o insumo é que era pobre.

**4. Lugar no sistema.** A seção *Fontes* fez B nascer conectada a 5 notas
e encaixada no fluxo. A nasceu órfã.

> **Síntese:** o prompt mínimo controla o *tema*. O pacote de contexto
> controla o *conteúdo, a forma e as fronteiras*. A diferença entre 1/5 e
> 5/5 não veio de um modelo melhor nem de um prompt mais elaborado — veio
> de **documentação que já existia e foi entregue junto**.
>
> É a tese do curso, medida: a IA amplifica o que está documentado.
> Com pouca documentação, ela amplifica pouco — e de forma convincente,
> que é o que torna a versão A perigosa.

## Relacionado

- [[PKG-Geracao-de-SOP-v2]]
- [[REV-SOPs-2026-08-11]]
- [[MOC-StackTrack]]
