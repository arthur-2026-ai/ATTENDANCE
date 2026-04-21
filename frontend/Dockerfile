# Étape 1: Phase de construction (Build de l'application Next.js)
FROM node:20-alpine AS builder

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# 1. Copie des fichiers de package pour optimiser le cache Docker
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm install

# 2. Copie du reste du code source
COPY . .

# Cette valeur est injectée par le docker-compose.yml (http://api:5000)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_OFFICE_LAT
ARG NEXT_PUBLIC_OFFICE_LNG
ARG NEXT_PUBLIC_OFFICE_RADIUS_METERS

# Exécution du build (génère le dossier .next)
RUN npm run build

# Étape 2: Phase de service (Image de production légère)
FROM node:20-alpine AS runner

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# 1. Copie des dépendances de runtime et des fichiers de package
COPY --from=builder /app/package.json /app/package-lock.json ./

# Installer SEULEMENT les dépendances de production
RUN npm install --omit=dev

# 2. Copie des fichiers buildés (.next) et des assets publics
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Définir les variables d'environnement
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_OFFICE_LAT=$NEXT_PUBLIC_OFFICE_LAT
ENV NEXT_PUBLIC_OFFICE_LNG=$NEXT_PUBLIC_OFFICE_LNG
ENV NEXT_PUBLIC_OFFICE_RADIUS_METERS=$NEXT_PUBLIC_OFFICE_RADIUS_METERS
ENV PORT=3000

# Exposer le port
EXPOSE 3000

# Commande de lancement de l'application Next.js
CMD ["npm", "start"]