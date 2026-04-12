"use client"

import type React from "react"
import { useState, useCallback, useMemo } from "react"
import { useAuth } from "../../lib/auth-context" 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Mail, Lock, LogIn, Loader2, AlertTriangle } from 'lucide-react'
import { Eye, EyeOff } from 'lucide-react'


export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string>("")
  const { login: authLogin, isLoading } = useAuth()
  
  // Fonction utilitaire pour simuler la temporisation pour l'exponentiel backoff
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // useState pour gérer la visibilité du mot de passe
  const [showPassword, setShowPassword] = useState(false);

  // Fonction pour basculer la visibilité du mot de passe
  const togglePasswordVisibility = () => {
    setShowPassword(prevState => !prevState);
  };

  // 🚨 Logique de connexion mise à jour avec gestion du backoff et des erreurs
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (isLoading) return; // Empêcher les soumissions multiples

    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts) {
      try {
        // 🚨 APPEL DE LA LOGIQUE DE CONNEXION GÉRÉE PAR LE CONTEXTE
        await authLogin(email, password);
        
        return; 
        
      } catch (err: any) {
        attempt++;
        
        // Gérer l'erreur spécifique pour le backoff
        const isNetworkError = err.message && (err.message.includes('Failed to fetch') || err.message.includes('Network request failed'));
        
        if (attempt >= maxAttempts || !isNetworkError) {
          // C'est la dernière tentative ou c'est une erreur d'identifiants (non réseau)
          const errorMessage = err.message || "Erreur de connexion inconnue.";
          setError(errorMessage);
          break; 
        }
        
        // Attente exponentielle pour la prochaine tentative
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`Tentative de connexion échouée (Tentative ${attempt}). Nouvelle tentative dans ${delay / 1000}ms...`);
        await sleep(delay);
      }
    }
  }, [email, password, authLogin, isLoading]);


  // Utiliser useMemo pour le rendu du bouton (optimisation et lisibilité)
  const buttonContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center">
          <Loader2 className="animate-spin h-5 w-5 mr-3" />
          Authentification...
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center">
        <LogIn className="h-5 w-5 mr-2" />
        Se connecter
      </div>
    );
  }, [isLoading]);


  return (
    <Card className="w-full max-w-md shadow-2xl transition-all duration-300">
      <div className="p-8 space-y-6">
        <div className="mb-6 text-center">
          <div className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-3xl mx-auto mb-4 shadow-lg">
            O
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orion-Attendance</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Connectez-vous à votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Champ Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Champ Mot de passe */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />

              <Input
                id="password"
                type={showPassword ? "text" : "password"} 
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-700 
                          bg-gray-50 dark:bg-gray-800 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
              />

              {/* 👁️ Bouton show/hide */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 
                          hover:text-gray-700 dark:hover:text-gray-300"
                tabIndex={-1} // évite sélection au tab
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-sm font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                {error}
            </div>
          )}

          {/* Bouton de soumission */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition duration-150 shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {buttonContent}
          </Button>
        </form>
        
        <div className="text-center text-sm mt-4">
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Mot de passe oublié ?
            </a>
        </div>
      </div>
    </Card>
  )
}