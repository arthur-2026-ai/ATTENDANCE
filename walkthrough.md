# Récapitulatif : Géolocalisation pour le Pointage

La fonctionnalité de géolocalisation a été implémentée avec succès. Voici ce qui a changé et comment cela fonctionne :

## Ce qui a été fait :
1. **Un algorithme de calcul de distance (Haversine)** a été ajouté côté client (`frontend/lib/geolocation.ts`).
2. **Le bouton de pointage (`Check-in` / `Check-out`) a été modifié** : lorsqu'un employé (et non un administrateur) clique dessus, le navigateur demande d'abord la permission d'accéder au GPS.
3. Si l'employé se trouve au-delà d'un **rayon de tolérance (par défaut 150 mètres)** par rapport aux coordonnées du bureau, un message d'erreur rouge s'affiche et l'enregistrement de la présence est **bloqué**.

---

## ⚠️ Action Requise pour votre Droplet DigitalOcean

Avant de déployer votre code sur votre serveur Cloud, vous **devez** configurer les coordonnées réelles de vos bureaux.

> [!IMPORTANT]
> Par défaut, j'ai défini les coordonnées sur le centre de Paris avec un rayon de 150m.

1. **Trouvez vos coordonnées GPS :**
   - Allez sur Google Maps.
   - Faites un clic droit sur votre bureau, puis cliquez sur les numéros (ex: `12.34567, 8.91011`) pour les copier.
2. **Modifiez le fichier d'environnement :**
   - Ouvrez le fichier `frontend/.env.local` qui a été créé.
   - Remplacez les valeurs par les vôtres :
     ```env
     NEXT_PUBLIC_OFFICE_LAT=VOTRE_LATITUDE
     NEXT_PUBLIC_OFFICE_LNG=VOTRE_LONGITUDE
     NEXT_PUBLIC_OFFICE_RADIUS_METERS=150
     ```
3. **Pendant le déploiement sur DigitalOcean :**
   - Assurez-vous que ces 3 variables d'environnement sont injectées dans votre conteneur Docker Frontend (ou ajoutées dans votre fichier système/PaaS) afin que l'application compilée sache où sont situés les bureaux physiquement.

> [!CAUTION]
> **HTTPS obligatoire** : La plupart des navigateurs modernes (Chrome, Safari, Firefox mobile) **refusent de fournir la position GPS si le site n'est par sécurisé par `https://`**. Assurez-vous d'ajouter un certificat SSL (par exemple via Certbot/Let's Encrypt ou Nginx Proxy Manager) sur votre Droplet DigitalOcean.
