# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Compile seed.ts for production use
RUN node -e "\
const ts = require('typescript');\
const fs = require('fs');\
const source = fs.readFileSync('prisma/seed.ts', 'utf8');\
const result = ts.transpileModule(source, { compilerOptions: { module: 1, target: 7, esModuleInterop: true } });\
fs.mkdirSync('prisma/dist', { recursive: true });\
fs.writeFileSync('prisma/dist/seed.js', result.outputText);"

# Production Stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and prisma schema + migrations
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies
RUN npm ci --only=production

# Install OpenSSL for Prisma runtime and prisma CLI for migrations
RUN apk add --no-cache openssl
RUN npm install prisma@5.22.0

# Copy built application and Prisma client from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy compiled seed from builder stage
COPY --from=builder /app/prisma/dist ./prisma/dist

# Copy entrypoint script
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Expose port
EXPOSE 3000

# Use entrypoint to run migrations before starting
ENTRYPOINT ["./entrypoint.sh"]
