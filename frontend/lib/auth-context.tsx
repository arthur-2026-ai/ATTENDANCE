"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Interface User (déplacée ici pour la complétude)
interface User {
  id: string 
  firstName: string
  lastName: string
  email: string
  department: string
  position: string
  role: "admin" | "employee"
  phone: string
  joinDate: string // YYYY-MM-DD
  passwordHash?: string // Pour stocker le hash du mot de passe,
  initialLoading?: boolean // Pour indiquer le chargement initial
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  initialLoading: boolean; // Mis à jour pour être obligatoire
  login: (email: string, password: string) => Promise<void>;
  logout: () => void; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Définition de l'URL de base pour l'API ---
// Utilise la variable d'environnement ou localhost par défaut si non définie
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const AUTH_API_URL = `${API_BASE}/api/auth`;


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // AJOUT 1: Gérer l'état de chargement initial (lecture du localStorage)
  const [initialLoading, setInitialLoading] = useState(true); 

  // --- 1. FONCTION DE CONNEXION (MISE À JOUR) ---
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // UTILISATION DE LA NOUVELLE URL BASÉE SUR LA VARIABLE D'ENVIRONNEMENT
      const response = await fetch(`${AUTH_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Échec de la connexion.");
      }

      const data = await response.json();
      const { token, user } = data;
      
      // 🎯 STOCKAGE DU JWT ET DE L'UTILISATEUR DANS LE LOCAL STORAGE
      localStorage.setItem('user', JSON.stringify(data.user)); 
      localStorage.setItem('token', token); // Le jeton JWT !
      
      setUser(data.user); 
      
    } catch (error) {
      // Nettoyer si l'API a renvoyé un token invalide
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- 2. FONCTION DE DÉCONNEXION (AJOUT) ---
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // NOTE : La redirection vers '/' est gérée par le composant appelant (ex: LogoutButton)
  };

  // --- 3. PERSISTANCE DE SESSION (MISE À JOUR) ---
  useEffect(() => {
    // S'exécute une fois au montage du composant
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        
        setUser(parsedUser);
        
      } catch (e) {
        // En cas d'erreur de parsing ou si le token est invalide, on nettoie
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    // AJOUT 2: Indique que la vérification de l'état initial est terminée
    setInitialLoading(false); 

  }, []); // [] garantit que cela ne s'exécute qu'une fois au montage

  // AJOUT 3: Inclure initialLoading dans l'objet de valeur du contexte
  const value = { user, isLoading, login, logout, initialLoading }; 

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personnalisé useAuth()
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};