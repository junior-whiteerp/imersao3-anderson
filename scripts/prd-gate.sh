#!/usr/bin/env bash
#
# Portão do PRD — rotina obrigatória de atualização.
#
# Roda como Stop hook nos dois repositórios de código. Ele compara duas datas:
#
#   1. a mudança mais recente em código de produto
#   2. a última vez que o PRD foi tocado
#
# Se (1) for mais nova que (2), o turno não encerra: mexeu no sistema e o PRD
# não soube. É exatamente a fresta por onde a mesa visual "Ao vivo" entrou no
# produto sem passar por decisão — o código foi escrito, o pacote foi exportado
# mandando construí-la, e o PRD só descobriu numa auditoria, seis desvios depois.
#
# Abrir o portão custa uma linha no PRD. É de propósito: se registrar fosse
# caro, ninguém registraria.
#
# Uso:
#   prd-gate.sh              # modo hook: lê JSON no stdin, devolve JSON
#   prd-gate.sh --relatorio  # modo humano: imprime o estado e sai

set -uo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PRD="$RAIZ/docs/PRD.md"

# Caminhos governados: onde mora regra, tela, dado ou escopo. Mexer aqui é
# mexer no produto. `src/dados/` entra porque persistirDelta.ts também decide
# regra — foi ele que passou a carimbar consentimento que ninguém deu.
CAMINHOS=(
  "$RAIZ/caixa-vivo/src"
  "$RAIZ/caixa-vivo/banco/migrations"
  "$RAIZ/caixa-vivo/servidor"
  "$RAIZ/imersao-teste-design/product"
  "$RAIZ/imersao-teste-design/product-plan"
  "$RAIZ/imersao-teste-design/src/sections"
  "$RAIZ/imersao-teste-design/src/shell"
)

modo_relatorio=false
[[ "${1:-}" == "--relatorio" ]] && modo_relatorio=true

# No modo hook, o stdin traz o JSON do evento. `stop_hook_active` é true quando
# já estamos voltando de um bloqueio — sem essa saída o portão entra em laço.
if ! $modo_relatorio; then
  entrada="$(cat 2>/dev/null || true)"
  if printf '%s' "$entrada" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
    exit 0
  fi
fi

if [[ ! -f "$PRD" ]]; then
  # Sem PRD não há o que comparar. Falhar aqui travaria todo trabalho por um
  # arquivo movido de lugar — melhor avisar alto e deixar passar.
  printf '{"systemMessage":"Portão do PRD desligado: não achei %s"}\n' "$PRD"
  exit 0
fi

# Arquivos de produto mais novos que o PRD.
recentes="$(
  for caminho in "${CAMINHOS[@]}"; do
    [[ -d "$caminho" ]] || continue
    find "$caminho" -type f -newer "$PRD" \
      ! -path '*/node_modules/*' ! -path '*/dist/*' ! -path '*/.git/*' \
      ! -name '*.tsbuildinfo' ! -name '.DS_Store' ! -name '*.png' 2>/dev/null
  done | sed "s|^$RAIZ/||" | sort
)"

if $modo_relatorio; then
  echo "PRD:  $PRD"
  echo "      tocado em $(date -r "$PRD" '+%Y-%m-%d %H:%M')"
  echo
  if [[ -z "$recentes" ]]; then
    echo "Portão ABERTO — nenhum arquivo de produto é mais novo que o PRD."
  else
    echo "Portão FECHADO — $(printf '%s\n' "$recentes" | wc -l | tr -d ' ') arquivo(s) mudaram depois do PRD:"
    printf '%s\n' "$recentes" | sed 's/^/  · /'
  fi
  exit 0
fi

[[ -z "$recentes" ]] && exit 0

total=$(printf '%s\n' "$recentes" | wc -l | tr -d ' ')
amostra=$(printf '%s\n' "$recentes" | head -12 | sed 's/^/  · /')
[[ $total -gt 12 ]] && amostra="$amostra
  · … e mais $((total - 12))"

# jq monta o JSON: a razão tem quebras de linha e aspas, e escapar isso à mão
# em bash é como o portão morre em silêncio.
if command -v jq >/dev/null 2>&1; then
  jq -n --arg razao "PORTÃO DO PRD — o turno não encerra ainda.

$total arquivo(s) de produto mudaram depois da última atualização do PRD:

$amostra

O PRD ($PRD) é a autoridade sobre regra, escopo e tela. Código mais novo que
ele quer dizer que o produto mudou e o documento não soube — foi assim que a
mesa visual entrou no escopo sem decisão.

O que fazer, na ordem:

1. Olhe o que mudou de fato (git diff nos repositórios).
2. Decida em qual caixa cada mudança cai:
   · Mudou REGRA, ESCOPO ou TELA  → atualize a seção do PRD (8, 10, 11, 12, 13
     ou 15), suba a versão no frontmatter e escreva a linha no Histórico.
   · Foi DECISÃO de produto        → abra também um DEC-NNN em
     'Anderson Playbook/20-Decisoes/', no formato de 90-Templates/template-decisao.md,
     e ligue-o na tabela de Rastreabilidade do PRD.
   · Não mudou produto (refactor, teste, estilo) → registre uma linha em
     'Registro de mudanças do sistema', no fim do PRD, dizendo o que foi e por
     que não mexeu em regra.
3. Commite o PRD no repositório de governança ($RAIZ).

Nenhuma mudança pode ficar sem uma dessas três saídas. Se você acha que não se
encaixa em nenhuma, é sinal de que a mudança precisa de conversa, não de commit.

Se o bloqueio estiver errado, diga isso ao operador em vez de contornar o portão." \
    '{decision:"block", reason:$razao}'
else
  printf '{"decision":"block","reason":"PORTÃO DO PRD: %s arquivo(s) de produto mudaram depois do PRD. Atualize %s (regra, escopo, tela ou o Registro de mudanças) e commite antes de encerrar. Instale jq para ver a lista completa."}\n' "$total" "$PRD"
fi

exit 0
