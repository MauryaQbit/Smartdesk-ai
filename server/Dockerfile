FROM node:24-alpine AS base
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY server/ ./
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost:5000/api/health || exit 1
CMD ["node", "src/server.js"]

FROM base AS dev
RUN npm install
CMD ["npm", "run", "dev"]
