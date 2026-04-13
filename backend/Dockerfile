# Étape 1: Phase de construction (pour installer TOUTES les dépendances)
FROM node:20-alpine AS build

# Répertoire de travail
WORKDIR /app

# 1. Copier les fichiers de dépendances pour optimiser le cache
COPY package.json package-lock.json ./

# Installer toutes les dépendances (y compris les devDependencies)
RUN npm install

# 2. Copier le reste du code (server.js, routes, etc.)
COPY . .

# 🚨 CORRECTION CRUCIALE : Le 'tree' montre que le script d'amorçage est nommé 'seed.js' 
# et qu'il est à la racine du répertoire 'backend'. 
# Nous le copions en tant que 'seedUsers.js' pour correspondre à la commande dans docker-compose.yml.
COPY seed.js /app/seedUsers.js

# Étape 2: Phase de service (Image de production légère)
FROM node:20-alpine AS runner

# Répertoire de travail
WORKDIR /app

# Copie des fichiers de package
COPY --from=build /app/package.json /app/package-lock.json ./

# Installer SEULEMENT les dépendances de production
RUN npm install --omit=dev

# Copie du code source complet depuis l'étape de construction
# Cette ligne est cruciale pour que tous vos fichiers (routes, models, server.js) soient présents.
COPY --from=build /app/ /app/

# Définir les variables d'environnement
ENV NODE_ENV=production
ENV PORT=5000

# Exposer le port (bonne pratique)
EXPOSE 5000

# Commande de lancement du serveur
CMD ["node", "server.js"]