#!/usr/bin/env bash
#
# A porta única de "está funcionando".
#
# Três blocos, na ordem em que a confiança se constrói:
#   1. provas    — as 37 asserções das regras herdadas, sem banco
#   2. test      — banco, dados, telas e o anti-dado-simulado
#   3. verificar — build de produção sem a noite de demonstração dentro
#
# Ele carrega o .env para os testes de banco acharem as credenciais. Se o .env
# não existir, os testes falham dizendo o que falta — que é o comportamento
# certo: teste de banco pulado em silêncio é mentira de verde.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

npm run provas
npm run test
npm run verificar
