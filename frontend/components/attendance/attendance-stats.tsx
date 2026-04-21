"use client"

import React, { useMemo } from 'react';
import { Card } from "@/components/ui/card"
import { Loader2 } from 'lucide-react';
import { useEmployees } from "../../lib/employee-context";
import { AttendanceRecord } from "../../lib/attendance-context-types";



interface AttendanceStatsProps {
  attendanceData: AttendanceRecord[];
  filters: {
    startDate: string
    endDate: string
    department: string
    employee: string
  }
}



export function AttendanceStats({ attendanceData, filters }: AttendanceStatsProps) {

  // Utilisation de useEmployees uniquement pour afficher un loader si les données ne sont pas prêtes (bien que le parent le gère)
  const { isLoading: isEmployeesLoading } = useEmployees();

  // 1. 🎯 CALCUL SIMPLIFIÉ (Basé UNIQUEMENT sur les données d'entrée déjà filtrées)
  const stats = useMemo(() => {
    // Si les données d'entrée sont vides, les stats sont 0.
    if (attendanceData.length === 0) {
      return { total: 0, present: 0, late: 0, absent: 0 };
    }

    // Le filtrage n'est PLUS nécessaire ici. Nous calculons directement sur attendanceData.
    return {
      // Le total est le nombre d'enregistrements passés (ce qui représente le total filtré)
      total: attendanceData.length,
      present: attendanceData.filter((r) => r.status === "Présent").length,
      late: attendanceData.filter((r) => r.status === "En retard").length,
      absent: attendanceData.filter((r) => r.status === "Absent").length,
    };

  }, [attendanceData]); // Dépendance uniquement à la liste de présence filtrée.
  const presentOrLate = stats.present + stats.late;
  const attendanceRate = stats.total > 0 ? Math.round((presentOrLate / stats.total) * 100) : 0;

  // Affichage d'un loader si l'initialisation du parent n'est pas terminée
  if (isEmployeesLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground flex items-center justify-center">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Chargement des données...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="shadow-md transition-all hover:shadow-lg">
        <div className="p-6">
          <p className="text-sm text-muted-foreground font-medium">Taux d'Assiduité</p>
          <p className="text-3xl font-bold text-primary mt-2">{attendanceRate}%</p>
        </div>
      </Card>
      <Card className="shadow-md transition-all hover:shadow-lg">
        <div className="p-6">
          <p className="text-sm text-muted-foreground font-medium">Présences Enregistrées</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{presentOrLate}</p>
          <p className="text-xs text-gray-500 mt-1">({stats.present} Présent, {stats.late} Retard)</p>
        </div>
      </Card>
      <Card className="shadow-md transition-all hover:shadow-lg">
        <div className="p-6">
          <p className="text-sm text-muted-foreground font-medium">Total Enregistrements</p>
          <p className="text-3xl font-bold text-foreground mt-2">{stats.total}</p>
        </div>
      </Card>
      <Card className="shadow-md transition-all hover:shadow-lg">
        <div className="p-6">
          <p className="text-sm text-muted-foreground font-medium">Absences Déclarées</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.absent}</p>
        </div>
      </Card>
    </div>
  )
}