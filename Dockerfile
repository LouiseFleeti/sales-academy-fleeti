# ── Étape 1 : build Next.js ──────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Étape 2 : image finale avec Node + Python ─────────────────────────────────
FROM node:20-slim

# Installer Python + pip
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Installer python-pptx dans un venv
RUN python3 -m venv /opt/venv
RUN /opt/venv/bin/pip install --no-cache-dir python-pptx Pillow

WORKDIR /app

# Copier le build Next.js
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copier le script Python
COPY scripts ./scripts

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
# Python du venv
ENV PYTHON_BIN=/opt/venv/bin/python3

EXPOSE 10000
CMD ["node", "server.js"]
