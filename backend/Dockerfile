# Dockerfile for Node.js Express Backend API
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for Docker layer caching
COPY package*.json ./
RUN npm install --production

# Copy application source code
COPY . .

# Expose API port
EXPOSE 5000

# Environment defaults (overrideable via docker-compose / .env)
ENV PORT=5000 \
    NODE_ENV=production

CMD ["node", "src/server.js"]
