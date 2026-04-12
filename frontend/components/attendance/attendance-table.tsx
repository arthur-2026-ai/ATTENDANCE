"use client"

import React, { useMemo } from 'react';
import { Card } from "@/components/ui/card"
// Import des types et du hook d'employés réels
import { AttendanceRecord } from "../../lib/attendance-context-types";
import { Employee } from "../../lib/employee-context-types"; 
import { useEmployees } from "../../lib/employee-context";
import { Loader2 } from 'lucide-react';


export interface AttendanceTableProps { 
  // Les données DOIVENT être déjà filtrées par la page parente (AttendancePage)
  attendanceData: AttendanceRecord[]; 
  filters: { // Gardons les filtres pour référence, bien qu'ils ne soient pas utilisés pour le filtrage direct ici
    startDate: string
    endDate: string
    department: string
    employee: string
  }
}

// Interface pour la Map de recherche rapide
type EmployeeMap = Map<string, Employee>;

export function AttendanceTable({ attendanceData, filters }: AttendanceTableProps) {
  
  // Utiliser le hook réel pour accéder à la liste d'employés et au statut de chargement
  const { employees, isLoading: isEmployeesLoading } = useEmployees();

  // 1. 🎯 Création de la Map d'Employés (O(1) lookup)
  const employeeMap: EmployeeMap = useMemo(() => {
    if (isEmployeesLoading || !employees) return new Map();
    // Création de la Map: { employeeId: employeeObject }
    // Ajout de 'name' pour un accès facile
    return new Map(employees.map(e => [e._id, { ...e, name: `${e.firstName} ${e.lastName}` } as Employee]));
  }, [employees, isEmployeesLoading]);

  // 2. Les enregistrements sont déjà filtrés par le parent. Nous utilisons directement attendanceData.
  const recordsToDisplay = attendanceData;


  // Fonction pour déterminer la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present": return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
      case "Late": return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200"
      case "Absent": return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200"
    }
  }

  if (isEmployeesLoading || employeeMap.size === 0) {
      return (
        <Card className="p-8 text-center flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Chargement des données d'employés pour la table...
        </Card>
      );
  }

  // Rendu
  return (
    <Card className="shadow-lg border-none">
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Employé</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Département</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Arrivée</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Départ</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recordsToDisplay.map((record) => {
              // Recherche O(1) pour l'information de l'employé
              const info = employeeMap.get(record.employeeId);
              
              const employeeName = info ? `${info.firstName} ${info.lastName}` : "ID inconnu";
              const departmentName = info?.department || "N/A";

              return (
                <tr key={record._id} className="hover:bg-muted/75 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">
                    {new Date(record.date).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{employeeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{departmentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {/* CORRECTION: Utilisation de record.arrivalTime à la place de record.time */}
                    {record.arrivalTime ? record.arrivalTime : "-"} 
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {/* Le champ departureTime est utilisé s'il existe */}
                    {record.departureTime ? record.departureTime : "-"} 
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {recordsToDisplay.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
            Aucun enregistrement ne correspond aux filtres appliqués.
        </div>
      )}
      <div className="px-6 py-3 border-t border-border bg-muted/50 text-sm text-muted-foreground rounded-b-lg">
        Affichage de {recordsToDisplay.length} enregistrement{recordsToDisplay.length !== 1 ? "s" : ""}
      </div>
    </Card>
  )
}