
import { useState, useEffect, useMemo } from 'react';
import { fetchApi } from './http-client'; 

// 1. Interface de l'Employé (Source de Vérité)
export interface Employee {
  _id: string; // L'identifiant MongoDB principal
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  phone: string;
  joinDate: string;
  // Note: 'name' n'est pas dans le backend, nous allons le calculer
}

interface UseEmployeesDataResult {
  employees: (Employee & { name: string })[];
  isEmployeesLoading: boolean;
  employeesError: string | null;
}

// 2. Le Hook de Données
export function useEmployeesData(): UseEmployeesDataResult {
  const [employeesRaw, setEmployeesRaw] = useState<Employee[]>([]);
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(true);
  const [employeesError, setEmployeesError] = useState<string | null>(null);

  const loadEmployees = async () => {
    setIsEmployeesLoading(true);
    setEmployeesError(null);
    try {
      // 🎯 REMPLACER PAR VOTRE VRAIE ROUTE API
      const data: Employee[] = await fetchApi('employees', { method: 'GET' }); 
      
      setEmployeesRaw(data);
    } catch (error) {
      console.error("Échec du chargement des employés:", error);
      setEmployeesError("Impossible de charger la liste des employés.");
      setEmployeesRaw([]);
    } finally {
      setIsEmployeesLoading(false);
    }
  };

  useEffect(() => {
    // Charger les employés au montage initial
    loadEmployees();
  }, []);

  // 3. Ajouter la propriété 'name' (Calculé)
  // Nous utilisons useMemo pour éviter de recalculer à chaque rendu si les données sont stables
  const employees = useMemo(() => {
    return employeesRaw.map(e => ({
      ...e,
      // Calculer le nom complet pour faciliter le filtrage
      name: `${e.firstName} ${e.lastName}`, 
    }));
  }, [employeesRaw]);

  return { employees, isEmployeesLoading, employeesError };
}