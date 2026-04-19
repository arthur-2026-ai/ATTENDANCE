// lib/employee-context-types.ts

// Définition de l'interface principale pour un employé.
export interface Employee {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    position: string;
    phone: string;
    joinDate: string; // Date d'entrée (format YYYY-MM-DD)
    passwordHash?: string; // Le hachage du mot de passe (côté backend uniquement, optionnel)
    role: 'admin' | 'employee';
    status?: 'active' | 'inactive' | 'onLeave'; // Statut optionnel pour éviter l'erreur TS
}


export interface EmployeeContextType {
    employees: Employee[];
    isLoading: boolean;
    // Fonctions CRUD qui communiquent avec l'API
    loadEmployees: () => Promise<void>;
    addEmployee: (employeeData: Omit<Employee, '_id'> & { password?: string }) => Promise<Employee>;
    updateEmployee: (employee: Employee) => Promise<Employee>;
    deleteEmployee: (id: string) => Promise<void>;
}