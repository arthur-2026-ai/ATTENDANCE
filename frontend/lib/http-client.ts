const API_BASE = typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000" 
    : "http://api:5000"; // côté serveur dans Docker

export async function fetchApi(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token && !endpoint.includes('auth/login')) { 
        throw new Error("Authentification requise pour l'opération. Jeton non trouvé.");
    }

    const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> | undefined),
    };

    if (token) defaultHeaders['Authorization'] = `Bearer ${token}`;

    const url = `${API_BASE}/api/${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: defaultHeaders,
        });

        if (response.status === 204) return null;

        let data: any = {};
        try { data = await response.json(); } catch {}

        if (!response.ok) {
            const errorMessage = data.message || `Erreur API: ${response.status} ${response.statusText}`;
            if (response.status === 401) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        const errorMessage = error instanceof Error 
            ? error.message 
            : "Impossible de joindre l'API. Vérifiez que le backend est en cours d'exécution.";
        console.error(`Erreur requête ${url}:`, errorMessage);
        throw new Error(errorMessage);
    }
}
