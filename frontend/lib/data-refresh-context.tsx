"use client"

import { createContext, useContext, useCallback, type ReactNode, useState } from "react";
import { useEmployees } from "./employee-context";
import { useAttendance } from "./attendance-context"; 
import { useLeaves } from "./leave-context"; 

// Interface pour le contexte de rafraîchissement
interface DataRefreshContextType {
    refreshAllData: () => Promise<void>;
    isGlobalRefreshing: boolean;
}

// Contexte (avec des valeurs par défaut pour éviter les erreurs de compilation)
const DataRefreshContext = createContext<DataRefreshContextType | undefined>(undefined);

// Composant Fournisseur
export function DataRefreshProvider({ children }: { children: ReactNode }) {
    
    // Récupérer la fonction de chargement des employés
    const { loadEmployees } = useEmployees();
    const { loadAttendance } = useAttendance();
    const { loadLeaves } = useLeaves();

    const [isGlobalRefreshing, setIsGlobalRefreshing] = useState(false);

    // Fonction globale qui appelle toutes les fonctions de chargement
    const refreshAllData = useCallback(async () => {
        setIsGlobalRefreshing(true);
        console.log("Déclenchement de l'actualisation globale des données...");
        
        try {
            // 1. Actualiser les employés
            await loadEmployees(); 

             await loadAttendance();
             await loadLeaves();

            // 3. Ajouter d'autres appels de chargement ici si nécessaire (ex: départements, etc.)

            console.log("Actualisation globale des données terminée avec succès.");

        } catch (error) {
            console.error("Erreur lors de l'actualisation globale des données:", error);
            // Gérer l'erreur (ex: afficher un message d'erreur global)
        } finally {
            setIsGlobalRefreshing(false);
        }
    }, [loadEmployees, loadAttendance, loadLeaves]); 

    const value = { refreshAllData, isGlobalRefreshing };

    return (
        <DataRefreshContext.Provider value={value}>
            {children}
        </DataRefreshContext.Provider>
    );
}

// Hook personnalisé pour l'utilisation
export const useDataRefresh = () => {
    const context = useContext(DataRefreshContext);
    if (!context) {
        // Cela signifie que le fournisseur n'est pas utilisé au-dessus du composant
        throw new Error('useDataRefresh must be used within a DataRefreshProvider');
    }
    return context;
};