#!/usr/bin/env bash
#
# Inicializacao do projeto.
#
#   1. Libera as portas declaradas em PORTS (mata quem estiver escutando)
#   2. Sobe todos os servicos
#
# Uso:
#   ./scripts/start.sh          # libera as portas e sobe o dev server
#   ./scripts/start.sh --check  # so mostra quem esta ocupando as portas, nao mata nada
#
set -euo pipefail

# Portas do projeto (faixa 3300-3999 — ver AGENTS.md > Local Development).
# Ao adicionar um servico novo, inclua a porta aqui.
PORTS=(3300 3301)

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

CHECK_ONLY=0
[[ "${1:-}" == "--check" ]] && CHECK_ONLY=1

# PIDs escutando na porta. Vazio se estiver livre.
listeners() {
  lsof -ti "tcp:$1" -sTCP:LISTEN 2>/dev/null || true
}

describe() {
  ps -p "$1" -o comm= 2>/dev/null || echo "?"
}

free_port() {
  local port=$1
  local pids
  pids=$(listeners "$port")

  if [[ -z "$pids" ]]; then
    echo "  :$port livre"
    return 0
  fi

  for pid in $pids; do
    local name
    name=$(describe "$pid")

    if (( CHECK_ONLY )); then
      echo "  :$port ocupada por $name (pid $pid)"
      continue
    fi

    echo "  :$port ocupada por $name (pid $pid) — encerrando"
    kill "$pid" 2>/dev/null || true

    # Espera ate 5s pelo shutdown limpo antes de forcar.
    for _ in $(seq 1 50); do
      kill -0 "$pid" 2>/dev/null || break
      sleep 0.1
    done

    if kill -0 "$pid" 2>/dev/null; then
      echo "  :$port pid $pid nao respondeu ao SIGTERM — SIGKILL"
      kill -9 "$pid" 2>/dev/null || true
      sleep 0.2
    fi
  done

  (( CHECK_ONLY )) && return 0

  if [[ -n "$(listeners "$port")" ]]; then
    echo "  :$port AINDA ocupada — abortando" >&2
    return 1
  fi

  echo "  :$port liberada"
}

echo "Portas do projeto: ${PORTS[*]}"
for port in "${PORTS[@]}"; do
  free_port "$port"
done

if (( CHECK_ONLY )); then
  exit 0
fi

echo
echo "Subindo servicos..."

# Unico servico do projeto hoje: o dev server do Vite (porta 3300).
# `exec` entrega o terminal pro Vite, entao Ctrl+C encerra de verdade.
exec npm run dev
