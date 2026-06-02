FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de package
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Build Next.js
RUN npm run build

# Stage de production
FROM node:18-alpine

WORKDIR /app

# Copier package.json
COPY package*.json ./

# Installer seulement les dépendances de production
RUN npm ci --production

# Copier l'application buildée du builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "run", "start"]
