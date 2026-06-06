FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Skip ESLint during Docker build (lint should run in CI separately)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build -- --no-lint

# Stage de production
FROM node:18-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# Required for standalone or custom server setups
COPY --from=builder /app/next.config.* ./

EXPOSE 3000
CMD ["npm", "run", "start"]
