"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "../../lib/auth-context" 
import { useAttendance } from "../../lib/attendance-context" 
import { redirect } from "next/navigation"

// Import des hooks de données d'employés
import { useEmployees } from '../../lib/employee-context'; 
import { Employee } from '../../lib/employee-context-types'; 

// Import des composants (supposons que ces chemins sont corrects)
import { AttendanceFilters } from "../../components/attendance/attendance-filters"
import { AttendanceTable } from "../../components/attendance/attendance-table"
import { AttendanceStats } from "../../components/attendance/attendance-stats"
import { Loader2 } from "lucide-react"


// Interface pour les employés avec le champ 'name' calculé
interface EnhancedEmployee extends Employee {
    name: string;
}

// Interface des filtres
interface FiltersState {
    startDate: string;
    endDate: string;
    department: string;
    employee: string;
}


export default function AttendancePage() {
  
  // --- A. HOOKS: Appels inconditionnels en début de composant ---
  
  // 1. Contextes
  const { user, initialLoading } = useAuth() 
  const { attendance, isLoading: isAttendanceLoading, loadAttendance } = useAttendance() 
  const { employees, isLoading: isEmployeesLoading, loadEmployees } = useEmployees(); 
  
  // 2. État local
  const [filters, setFilters] = useState<FiltersState>({
    startDate: "",
    endDate: "",
    department: "",
    employee: "",
  })

  // 3. Logique de chargement des données (useEffect)
  useEffect(() => {
      // Charger la présence si elle est vide
      if (attendance.length === 0) {
          loadAttendance();
      }
      // Charger les employés si la liste est vide
      if (employees.length === 0) {
          loadEmployees(); 
      }
  }, [loadAttendance, attendance.length, loadEmployees, employees.length]);
  
  // 4. Map d'employés pour la recherche rapide (useMemo)
  const employeeMap: Map<string, EnhancedEmployee> = useMemo(() => {
      if (isEmployeesLoading || !employees) return new Map();
      
      return new Map(employees.map(e => [
          e._id, 
          { 
              ...e, 
              name: `${e.firstName} ${e.lastName}` 
          } as EnhancedEmployee // Calculer 'name' ici
      ])); 
  }, [employees, isEmployeesLoading]);
  
  // 5. Logique de Filtrage Complète (useMemo)
  const filteredAttendance = useMemo(() => {
    
      // On utilise employeeMap.size au lieu de isEmployeesLoading pour une vérification plus robuste
      if (isAttendanceLoading || attendance.length === 0 || employeeMap.size === 0) return [];

      return attendance.filter(record => {
          const employeeInfo = employeeMap.get(record.employeeId);
          
          if (!employeeInfo) return false; 

          // Conversion de date pour la comparaison
          const recordDate = new Date(record.date);
          const start = filters.startDate ? new Date(filters.startDate) : null;
          const end = filters.endDate ? new Date(filters.endDate) : null;
          
          // 1. Date
          const matchesDate = 
              (!start || recordDate >= start) && 
              (!end || recordDate <= end);
          
          // 2. Département
          const matchesDepartment = 
              !filters.department || filters.department === "all" || employeeInfo.department === filters.department;

          // 3. Nom d'employé
          const matchesEmployee = 
              !filters.employee || employeeInfo.name.toLowerCase().includes(filters.employee.toLowerCase());

          return matchesDate && matchesDepartment && matchesEmployee;
      });
  }, [attendance, employeeMap, filters, isAttendanceLoading]);

  // 6. Départements Uniques (useMemo)
  const uniqueDepartments = useMemo(() => {
      // Assurez-vous que employees est chargé avant de le mapper
      if (isEmployeesLoading || employees.length === 0) return [];
      return Array.from(new Set(employees.map(e => e.department))).filter(Boolean);
  }, [employees, isEmployeesLoading]);


  // --- B. Fonctions de Rappel (Définies après les Hooks, avant les retours conditionnels) ---
  const handleFilterChange = (newFilters: FiltersState) => {
    setFilters(newFilters)
  }

  const handleExport = () => {
    console.log(`Déclenchement de l'exportation de ${filteredAttendance.length} enregistrements...`);
  }
  
  
  // --- C. Rendu Conditionnel (Guards) ---

  // 1. Gestion du Chargement Initial (Authentification)
  if (initialLoading) { 
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
        <p className="text-xl text-primary ml-4">Vérification de l'authentification...</p>
      </div>
    );
  }
  
  // 2. Protection de la route (après initialLoading = false)
  if (!user || user.role !== "admin") {
    // Si l'utilisateur n'est pas connecté ou n'est pas admin, rediriger.
    redirect("/")
  }

  // 3. Affichage du Loader pour le chargement des données (après l'Auth)
  if (isAttendanceLoading || isEmployeesLoading) { 
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
        <p className="text-xl text-primary ml-4">Chargement des enregistrements et des employés...</p>
      </div>
    );
  }

  // --- D. Rendu Final de la Page ---
  return (
    <div className="space-y-6 p-6 md:p-8">
      <h1 className="text-3xl font-bold">Dashboard Administratif de Présence</h1>
      
      {/* 1. Stats */}
      <AttendanceStats attendanceData={filteredAttendance} filters={filters} />

      {/* 2. Filters */}
      <AttendanceFilters 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onExport={handleExport}
          departmentOptions={uniqueDepartments}
      />

      {/* 3. Table */}
      <AttendanceTable attendanceData={filteredAttendance} filters={filters} />
    </div>
  )
}