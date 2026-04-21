/**
 * Calcule la distance entre deux coordonnées GPS en mètres
 * en utilisant la formule de Haversine.
 */
export function calculateDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Rayon de la Terre en mètres
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export interface GeolocationValidationResult {
  isValid: boolean;
  distance: number | null;
  error?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Vérifie si l'utilisateur est dans le rayon du bureau.
 */
export async function validateOfficeLocation(
  officeLat: number,
  officeLng: number,
  radiusMeters: number
): Promise<GeolocationValidationResult> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      resolve({
        isValid: false,
        distance: null,
        error: "La géolocalisation n'est pas supportée par ce navigateur."
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        const distance = calculateDistanceInMeters(
          userLat,
          userLng,
          officeLat,
          officeLng
        );

        if (distance <= radiusMeters) {
          resolve({ isValid: true, distance, latitude: userLat, longitude: userLng });
        } else {
          resolve({
            isValid: false,
            distance,
            error: `Vous êtes trop loin du bureau (à ${Math.round(
              distance
            )} mètres). La limite est de ${radiusMeters} mètres.`,
            latitude: userLat,
            longitude: userLng
          });
        }
      },
      (error) => {
        let errorMsg = "Erreur de géolocalisation inconnue.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = "Vous devez autoriser l'accès GPS pour pointer.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = "Les informations GPS sont indisponibles.";
            break;
          case error.TIMEOUT:
            errorMsg = "La demande GPS a mis trop de temps.";
            break;
        }
        resolve({ isValid: false, distance: null, error: errorMsg });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}
