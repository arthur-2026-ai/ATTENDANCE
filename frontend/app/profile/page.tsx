// src/app/profile/page.tsx (CORRECTION)

"use client"

import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"
import { ProfileHeader } from "@/components/profile/profile-header"
// import { EmployeeAttendancePanel } from "@/components/attendance/EmployeeAttendancePanel" // 🎯 Utilisation du composant de pointage générique
// import { EmployeeHistoryTable } from "@/components/dashboard/EmployeeHistoryTable" // 🎯 Utilisation du tableau d'historique générique
import { CheckInWidget } from "@/components/profile/check-in-widget" // Remplacé par le Panel
import { AttendanceHistory } from "@/components/profile/attendance-history" // Remplacé par le Table


export default function ProfilePage() {
  const { user, initialLoading } = useAuth()

  if (initialLoading) {
     return <div className="p-8 text-center text-muted-foreground">Chargement du profil...</div>
  }

  // 1. Protection contre les non-authentifiés
  if (!user) {
    redirect("/login") // Rediriger vers la page de connexion
    return null
  }

  // 2. Si c'est l'admin, rediriger vers son dashboard (si /profile n'est pas utilisé par l'admin)
  // (Ce n'est pas strictement nécessaire si l'admin a aussi un profil, mais c'est une bonne garde)
  if (user.role === "admin") {
      redirect("/dashboard")
      return null
  }

  
  const currentEmployee = user; 

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
        
        {/* En-tête de profil basé sur l'utilisateur connecté */}
        <ProfileHeader employee={currentEmployee} />

        {/* Panneau de Pointage et Historique */}
        <div className="grid grid-cols-1 gap-6">
            
            {/* 🎯 Panneau de Pointage */}
            <div className="w-full">
                {/* Réutilisation du composant de pointage */}
                <CheckInWidget /> 
            </div>
            
            {/* 🎯 Historique de Présence */}
            <div className="w-full">
                {/* Réutilisation du tableau d'historique personnel */}
                <AttendanceHistory /> 
            </div>
        </div>
    </div>
  )
}