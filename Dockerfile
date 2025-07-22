# docker build -t app-loca-frontpharma . (commande pour Lire le Dockerfile Installer les dépendances, Builder ton app Next.js, Créer une image Docker nommée app-loca-pharma)
# docker run -p 3000:3000 app-loca-frontpharma (commande pour Lancer le conteneur Docker et mapper le port 3000 de l'hôte au port 3000 du conteneur)


# Étape 1 : Construction
FROM node:18-alpine AS builder

# Installer pnpm globalement
RUN npm install -g pnpm

# Créer un dossier de travail
WORKDIR /app

# Copier les fichiers essentiels
COPY pnpm-lock.yaml ./
COPY package.json ./

# Installer les dépendances
RUN pnpm install

# Copier le reste du projet (app, components, public, etc.)
COPY . .

# Ajoute ces deux lignes AVANT le build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build de l'app
RUN pnpm build

# Étape 2 : Image de production
FROM node:18-alpine AS runner

# Installer pnpm globalement dans le runner aussi
RUN npm install -g pnpm

ENV NODE_ENV=production

WORKDIR /app

# Copier uniquement ce qui est nécessaire
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

EXPOSE 3000

# Lancer l'app Next.js avec pnpm
CMD ["pnpm", "start"]

