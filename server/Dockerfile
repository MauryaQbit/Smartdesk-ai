FROM node:24-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./
EXPOSE 5000
CMD ["npm", "start"]
