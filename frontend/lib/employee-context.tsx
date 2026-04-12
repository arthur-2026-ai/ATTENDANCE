"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { fetchApi } from './http-client'; 
import type { Employee, EmployeeContextType } from './employee-context-types'; 
import { useAuth } from "./auth-context"

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, initialLoading} = useAuth();
  
  // --- A. RÉCUPÉRATION (GET /api/employees) ---
  // Rendre cette fonction publique pour permettre l'actualisation manuelle.
  const loadEmployees = useCallback(async () => {
        setIsLoading(true);
        try {
            // Note : Cette vérification du rôle est effectuée ici pour l'isolation, 
            // mais l'API devrait idéalement garantir que seuls les admins voient tout.
            if (user?.role !== 'admin') {
                setEmployees([]);
                return;
            }
            
            const data: Employee[] = await fetchApi('employees', { method: 'GET' });
            // Filtrage côté client pour s'assurer que seuls les non-admins sont affichés dans la liste d'administration
            const nonAdminData = data.filter(e => e.role !== 'admin');
            setEmployees(nonAdminData); 
        } catch (error) {
            console.error("Échec du chargement des employés:", error);
            setEmployees([]); 
        } finally {
            setIsLoading(false);
        }
    }, [user?.role]); // Ajout de user?.role aux dépendances

  // --- B. AJOUT (POST /api/employees) ---
  const addEmployee: EmployeeContextType['addEmployee'] = async (employeeData) => {
    const newEmployee: Employee = await fetchApi('employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
    
    // FILTRAGE DANS L'ÉTAT LOCAL : N'ajouter que si ce n'est pas un admin
    if (newEmployee.role !== 'admin') {
        setEmployees(prev => [...prev, newEmployee]);
    }
    
    return newEmployee;
  };

  // --- C. MODIFICATION (PUT /api/employees/:id) ---
  const updateEmployee: EmployeeContextType['updateEmployee'] = async (employee) => {
    const updatedEmployee: Employee = await fetchApi(`employees/${employee._id}`, {
      method: 'PUT',
      body: JSON.stringify(employee),
    });
    
    setEmployees(prev => prev.map(emp => {
      // Si c'est l'employé mis à jour, nous le retournons UNIQUEMENT s'il n'est pas admin
      if (emp._id === updatedEmployee._id) {
        return updatedEmployee.role !== 'admin' ? updatedEmployee : null;
      }
      return emp;
    }).filter(Boolean) as Employee[]); 
    
    return updatedEmployee;
  };

  // --- D. SUPPRESSION (DELETE /api/employees/:id) ---
  const deleteEmployee: EmployeeContextType['deleteEmployee'] = async (id) => {
    await fetchApi(`employees/${id}`, {
      method: 'DELETE',
    });
    setEmployees(prev => prev.filter(emp => emp._id !== id));
  };


  // --- LOGIQUE DE CHARGEMENT AMÉLIORÉE ---
  useEffect(() => {
    if (initialLoading) return;

    if (user && user.role === 'admin') {
        loadEmployees();
    } else {
      setEmployees([]);
      setIsLoading(false);
    }
  }, [user, initialLoading, loadEmployees]); 

  // 🎯 MISE À JOUR : loadEmployees est maintenant exposé
  const value = { employees, isLoading, loadEmployees, addEmployee, updateEmployee, deleteEmployee };

  return <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>;
}

export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
};