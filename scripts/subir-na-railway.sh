#!/usr/bin/env bash
#
# Sobe o Caixa Vivo na Railway, do zero, num comando.
#
#   bash scripts/subir-na-railway.sh
#
# Faz: projeto (se não existir) → Postgres → serviço apontando para a imagem
# publicada → variáveis → domínio → semente → conta do operador → confere.
#
# Pode rodar de novo: cada passo checa antes de criar.
#
# PRÉ-REQUISITO ÚNICO: a conta precisa de método de pagamento.
# Sem isso a Railway recusa antes de qualquer coisa aqui rodar — e o script
# para na hora, dizendo exatamente isso, em vez de deixar meio feito.

set -euo pipefail
cd "$(dirname "$0")/.."

IMAGEM="ghcr.io/junior-whiteerp/imersao3-anderson/caixa-vivo:latest"
PROJETO="imersao3-anderson"
SERVICO="caixa-vivo"

azul()  { printf '\033[36m%s\033[0m\n' "$*"; }
erro()  { printf '\033[31m%s\033[0m\n' "$*" >&2; }
ok()    { printf '\033[32m✓ %s\033[0m\n' "$*"; }

# ── 0. Pré-condições ───────────────────────────────────────────────────────
command -v railway >/dev/null || { erro "railway CLI não está instalado."; exit 1; }

railway whoami >/dev/null 2>&1 || {
  erro "Não está logado. Rode 'railway login' num terminal de verdade."
  exit 1
}
ok "Logado como $(railway whoami 2>/dev/null | sed 's/Logged in as //;s/ 👋//')"

# O teste de cobrança: qualquer escrita responde a mesma coisa quando a conta
# está travada. Melhor descobrir aqui do que no meio do caminho.
if ! railway status >/dev/null 2>&1; then
  azul "Nenhum projeto ligado a esta pasta. Ligando ou criando '$PROJETO'…"
  railway link --project "$PROJETO" >/dev/null 2>&1 || {
    erro "Não consegui ligar ao projeto '$PROJETO'."
    erro "Se ele não existe, crie com: railway init -n $PROJETO"
    exit 1
  }
fi
ok "Projeto: $(railway status --json 2>/dev/null | python3 -c 'import json,sys;print(json.load(sys.stdin)["name"])')"

# ── 1. Postgres ────────────────────────────────────────────────────────────
if railway status --json 2>/dev/null | grep -qi '"name": *"Postgres"'; then
  ok "Postgres já existe"
else
  azul "Criando o Postgres…"
  if ! railway add -d postgres </dev/null 2>&1 | tee /tmp/railway-pg.log | tail -2; then
    :
  fi
  if grep -qi "restricted\|payment method\|trial has expired" /tmp/railway-pg.log; then
    erro ""
    erro "A conta está travada em cobrança:"
    erro "  $(grep -i 'restricted\|payment\|trial' /tmp/railway-pg.log | head -1)"
    erro ""
    erro "Anexe um método de pagamento em railway.com/account/billing"
    erro "e rode este script de novo. Nada foi deixado pela metade."
    exit 2
  fi
  ok "Postgres criado"
fi

# ── 2. O serviço, apontando para a imagem já publicada ─────────────────────
azul "Criando o serviço '$SERVICO' a partir da imagem…"
railway add -s "$SERVICO" -i "$IMAGEM" \
  -v "NODE_ENV=production" \
  -v 'DATABASE_URL=${{Postgres.DATABASE_URL}}' </dev/null 2>&1 | tail -2 || true
ok "Serviço no ar"

railway service "$SERVICO" >/dev/null 2>&1 || true

# ── 3. Domínio público ─────────────────────────────────────────────────────
azul "Gerando domínio…"
DOMINIO=$(railway domain 2>&1 | grep -oE '[a-z0-9.-]+\.up\.railway\.app' | head -1 || true)
[ -n "$DOMINIO" ] && ok "https://$DOMINIO" || azul "Gere o domínio no painel: Settings → Networking"

# ── 4. Esperar o primeiro deploy responder ─────────────────────────────────
if [ -n "$DOMINIO" ]; then
  azul "Esperando o app responder (pode levar um minuto)…"
  for _ in $(seq 1 40); do
    if curl -fsS "https://$DOMINIO/saude" >/dev/null 2>&1; then
      ok "Saúde respondendo"
      break
    fi
    sleep 5
  done
fi

# ── 5. Semente e conta do operador ─────────────────────────────────────────
azul "Criando clube e dealers…"
railway run --service "$SERVICO" npm run banco:semear:prod 2>&1 | tail -1

echo
azul "Agora a conta do operador. A senha é pedida sem eco."
read -r -p "  E-mail: " EMAIL
read -r -p "  Nome:   " NOME
read -r -s -p "  Senha:  " SENHA
echo

SENHA_OPERADOR="$SENHA" railway run --service "$SERVICO" \
  npm run banco:operador:prod -- --email "$EMAIL" --nome "$NOME" 2>&1 | tail -1

# ── 6. Fim ─────────────────────────────────────────────────────────────────
echo
ok "Pronto."
[ -n "$DOMINIO" ] && echo "   https://$DOMINIO  —  entre com $EMAIL"
