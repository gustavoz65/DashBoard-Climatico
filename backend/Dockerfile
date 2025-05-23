# backend/Dockerfile
FROM node:18.20.2-alpine AS base

# Instalar dependências do sistema
RUN apk update && apk upgrade --no-cache && apk add --no-cache libc6-compat

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Estágio de desenvolvimento
FROM base AS dev
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

# Estágio de dependências de produção
FROM base AS deps
RUN npm ci --only=production

# Estágio de build
FROM base AS builder
RUN npm install
COPY . .

# Estágio final de produção
FROM base AS runner

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copiar dependências de produção e código
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app .

# Mudar propriedade dos arquivos
RUN chown -R nodejs:nodejs /app

# Usar usuário não-root
USER nodejs

# Expor porta
EXPOSE 8080

# Healthcheck
COPY healthcheck.sh /app/healthcheck.sh
RUN chmod +x /app/healthcheck.sh
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["/app/healthcheck.sh"]

# Comando de produção
CMD ["node", "server.js"]