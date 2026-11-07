FROM node:22-slim
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# L'URL est requise par prisma.config.ts, mais n'est pas utilisée pour générer le client
RUN DATABASE_URL="postgresql://x:x@localhost:5432/x" npx prisma generate && npm run build

EXPOSE 5000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]