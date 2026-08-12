#!/usr/bin/env bash
#
# setup-playbook.sh — provisiona o vault do playbook e gera o experimento
# controlado de SOP (prompt mínimo vs. pacote de contexto).
#
# IDEMPOTENTE: rodar N vezes produz o mesmo resultado.
# Nenhum arquivo existente é sobrescrito — nem estrutura, nem SOP gerada.
#
# Uso:  ./setup-playbook.sh [vault]
#
set -euo pipefail

VAULT="${1:-Anderson Playbook}"
EXP="$VAULT/80-Experimentos"
PKG="$VAULT/60-Contexto/PKG-Geracao-de-SOP-v2.md"

PASTAS=(
  "00-MOCs"         # mapas de conteúdo — índices navegáveis
  "10-SOPs"         # procedimentos operacionais padrão
  "20-Decisoes"     # registros de decisão
  "30-Briefings"    # contexto de negócio e mapeamentos AS-IS → TO-BE
  "40-Mockups"      # telas e protótipos
  "50-Curso"        # material de estudo
  "60-Contexto"     # pacotes de contexto e specs geradas
  "70-Revisoes"     # rubrics aplicados
  "80-Experimentos" # comparações e provas
  "90-Templates"    # modelos reutilizáveis
)

criados=0; existentes=0; gerados=0; preservados=0

# ---------- guardas de idempotência ----------

criar_arquivo() {                      # cria só se não existir
  local caminho="$1" conteudo="$2"
  if [[ -e "$caminho" ]]; then
    existentes=$((existentes + 1))
  else
    printf '%s\n' "$conteudo" > "$caminho"
    criados=$((criados + 1))
  fi
}

gerar_sop() {                          # gera com IA só se não existir
  local caminho="$1" prompt="$2"
  if [[ -e "$caminho" ]]; then
    echo "  ↷ preservado: $(basename "$caminho")"
    preservados=$((preservados + 1))
    return 0
  fi
  if ! command -v claude >/dev/null 2>&1; then
    echo "  ⚠ claude CLI ausente — pulando $(basename "$caminho")"
    return 0
  fi
  echo "  ⚙ gerando: $(basename "$caminho")"
  claude --print "$prompt" > "$caminho"
  gerados=$((gerados + 1))
}

cabecalho() {
  printf -- '---\nowner:\nversion: v0.1\nupdated:\nstatus: rascunho\n---\n\n# %s\n' "$1"
}

# ---------- 1. estrutura ----------

echo "Vault: $VAULT"
mkdir -p "$VAULT"
for p in "${PASTAS[@]}"; do
  mkdir -p "$VAULT/$p"                 # mkdir -p é idempotente por natureza
done

criar_arquivo "$VAULT/README.md" \
  "# Playbook — Vault Operacional

Convenção de nomenclatura, versionamento e como criar documento novo.
Comece pelo MOC em 00-MOCs/."

criar_arquivo "$VAULT/90-Templates/template-sop.md"       "$(cabecalho 'SOP: [Nome]')"
criar_arquivo "$VAULT/90-Templates/template-decisao.md"   "$(cabecalho 'DEC-XXX — [Título]')"
criar_arquivo "$VAULT/90-Templates/template-checklist.md" "$(cabecalho 'Checklist: [Nome]')"

echo "  estrutura: $criados criado(s), $existentes preservado(s)"

# ---------- 2. experimento controlado ----------
# Mesmo processo, mesmo modelo. Varia SÓ o insumo.

echo
echo "Experimento — SOP de cadastro de jogador:"

# Versão A: prompt mínimo, sem contexto algum
gerar_sop "$EXP/SOP-Cadastro-de-Jogador-A-prompt-minimo.md" \
  "Gere um SOP de cadastro de jogador para um clube de pôquer. Responda apenas com o Markdown do SOP."

# Versão B: mesmo pedido, com o pacote de contexto injetado
gerar_sop "$EXP/SOP-Cadastro-de-Jogador-B-com-pacote.md" \
  "Leia o pacote de contexto em '$PKG' e todas as fontes que ele referencia no vault '$VAULT'. Gere o SOP de cadastro de jogador seguindo o formato e os critérios de aceitação definidos no pacote. Responda apenas com o Markdown do SOP."

echo "  experimento: $gerados gerado(s), $preservados preservado(s)"

# ---------- 3. relatório ----------

echo
echo "RESUMO"
echo "  arquivos criados:   $((criados + gerados))"
echo "  arquivos mantidos:  $((existentes + preservados))"
echo

if command -v tree >/dev/null 2>&1; then
  tree -L 2 --noreport "$VAULT"
else
  find "$VAULT" -maxdepth 2 -not -path '*/.*' | sort | sed "s|^$VAULT|.|"
fi
