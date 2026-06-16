FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN mkdir -p /app/public
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL=https://api.wookiesrpeople2.dev
ARG NEXT_PUBLIC_APP_DOWNLOAD_URL=https://your-server.com/lootopia.apk
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_DOWNLOAD_URL=$NEXT_PUBLIC_APP_DOWNLOAD_URL
ENV NEXT_PUBLIC_MOBILE_CAPTURE_LINK=$NEXT_PUBLIC_MOBILE_CAPTURE_LINK
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
EXPOSE 3000
CMD ["npm", "run", "start"]
