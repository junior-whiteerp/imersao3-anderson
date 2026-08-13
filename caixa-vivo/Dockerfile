# O Caixa Vivo num contêiner.
#
# Existe para o deploy não depender de detectar coisas: qualquer lugar que rode
# uma imagem OCI roda este app igual — Railway, Render, Fly, uma VPS com
# systemd, ou a sua máquina. É o mesmo artefato nos quatro.
#
#   docker build -t caixa-vivo .
#   docker run -p 3402:3402 -e DATABASE_URL=... caixa-vivo

# ── Etapa 1: construir ─────────────────────────────────────────────────────
FROM node:22-alpine AS construcao
WORKDIR /app

# As dependências primeiro, sozinhas: enquanto o package-lock não mudar, o
# Docker reaproveita esta camada e o build seguinte pula o npm ci inteiro.
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src
COPY servidor ./servidor
COPY public ./public
# `banco/` entra aqui porque o criar-operador.ts também é compilado — ele
# importa o scrypt do servidor, e duplicar essa lógica seria pedir divergência.
COPY banco ./banco

# `npm run build` faz os três: tsc confere os tipos, o Vite empacota a tela e o
# esbuild empacota o servidor.
RUN npm run build

# ── Etapa 2: rodar ─────────────────────────────────────────────────────────
FROM node:22-alpine AS producao
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3402

# Só as dependências de produção. O tsc, o Vite e o esbuild ficaram na etapa
# anterior e não viajam — a imagem final não carrega ferramenta de construção.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=construcao /app/dist ./dist
COPY --from=construcao /app/dist-servidor ./dist-servidor
# As migrations vão junto: quem sobe aplica o que falta antes de escutar a porta.
COPY banco ./banco

# Não roda como root. Se algo escapar do processo, escapa sem privilégio.
USER node

EXPOSE 3402

# O healthcheck bate na mesma rota que os provedores usam.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3402)+'/saude').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["npm", "run", "migrar-e-subir"]
