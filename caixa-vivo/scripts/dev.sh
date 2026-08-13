#!/usr/bin/env bash
# Sobe a API e a tela juntas, e derruba as duas com um Ctrl-C só.
#
#   API  → 3402   (tsx watch, recarrega ao salvar)
#   Tela → 3400   (Vite, com proxy de /api para a 3402)
set -euo pipefail

cd "$(dirname "$0")/.."

: "${DATABASE_URL:=postgres://caixa:caixa@localhost:3432/caixa_vivo}"
export DATABASE_URL

if ! docker compose ps --status running 2>/dev/null | grep -q caixa-vivo-db; then
  echo "→ Postgres não está de pé. Subindo…"
  docker compose up -d
  until docker exec caixa-vivo-db pg_isready -U caixa -d caixa_vivo >/dev/null 2>&1; do
    sleep 1
  done
fi

npm run banco:migrar

encerrar() {
  trap - INT TERM EXIT
  kill 0 2>/dev/null || true
}
trap encerrar INT TERM EXIT

npm run dev:api &
npm run dev:tela &
wait
