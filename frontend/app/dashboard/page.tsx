"use client"

import { useMemo, memo } from "react" 
import { redirect } from "next/navigation"
import { Users, CheckCircle, Clock, AlertCircle, Loader2, UserX, TrendingUp, Calendar } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useEmployees } from "@/lib/employee-context"
import { useAttendance } from "@/lib/attendance-context"
import type { Employee } from "@/lib/employee-context-types"


// Composant StatCard optimisé
interface StatCardProps {
  title: string
  value: string
  icon: React.ElementType
  trend?: { value: number; direction: 'up' | 'down' }
  color: 'blue' | 'green' | 'orange' | 'red'
}

const StatCard = memo(({ title, value, icon: Icon, trend, color }: StatCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  }

  return (
    <Card className="shadow-lg transition-all hover:shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

StatCard.displayName = 'StatCard'

// Composant pour afficher les employés absents
interface AbsentEmployeesCardProps {
  absentEmployees: Employee[]
  totalEmployees: number
}

const AbsentEmployeesCard = memo(({ absentEmployees, totalEmployees }: AbsentEmployeesCardProps) => (
  <Card className="shadow-lg h-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-lg font-semibold flex items-center gap-2">
        <UserX className="h-5 w-5 text-red-500" aria-hidden="true" />
        Absents Aujourd'hui
      </CardTitle>
      <Badge variant="destructive" className="ml-2">
        {absentEmployees.length}
      </Badge>
    </CardHeader>
    <CardContent className="pt-4">
      {absentEmployees.length === 0 ? (
        <div className="text-center p-6 bg-green-50 dark:bg-green-950 rounded-lg">
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" aria-hidden="true" />
          <p className="font-semibold text-green-700 dark:text-green-300 mb-1">
            Excellent !
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            Tous les employés sont présents aujourd'hui
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-2">
            {absentEmployees.map((emp) => (
              <div 
                key={emp._id} 
                className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {emp.firstName} {emp.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {emp.department || 'N/A'} • {emp.position || 'N/A'}
                  </p>
                </div>
                <UserX className="h-5 w-5 text-red-400 flex-shrink-0 ml-2" aria-hidden="true" />
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </CardContent>
  </Card>
))

AbsentEmployeesCard.displayName = 'AbsentEmployeesCard'

// Utilitaire pour normaliser les dates
const normalizeDate = (date: string | Date): string | null => {
  try {
    const dateObject = new Date(date)
    if (isNaN(dateObject.getTime())) {
      return null
    }
    return dateObject.toISOString().split('T')[0]
  } catch (error) {
    console.error('Erreur de normalisation de date:', error)
    return null
  }
}

export default function DashboardPage() {
  const { user, initialLoading } = useAuth()
  const { employees, isLoading: employeesLoading } = useEmployees()
  const { attendance, isLoading: attendanceLoading } = useAttendance()
  
  // Date du jour
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  // Calculer les statistiques avec useMemo pour optimiser les performances
  const stats = useMemo(() => {
    // Filtrer les enregistrements d'aujourd'hui
    const todayAttendance = attendance.filter(record => {
      const recordDate = normalizeDate(record.date)
      return recordDate === today
    })

    // IDs des employés présents (présents ou en retard)
    const presentTodayIds = new Set(
      todayAttendance
        .filter(record => record.status === 'Present' || record.status === 'Late')
        .map(record => record.employeeId)
    )

    // Calculs
    const totalEmployees = employees.length
    const presentToday = presentTodayIds.size
    const lateArrivals = todayAttendance.filter(record => record.status === 'Late').length
    const absentToday = totalEmployees - presentToday
    
    // Liste des employés absents
    const absentEmployees = employees.filter(emp => !presentTodayIds.has(emp._id))

    // Taux de présence
    const attendanceRate = totalEmployees > 0 
      ? ((presentToday / totalEmployees) * 100).toFixed(1)
      : "0"

    // Résumé par département
    const departmentSummary = employees.reduce((acc, emp) => {
      const deptName = emp.department || 'Non assigné'
      if (!acc[deptName]) {
        acc[deptName] = { count: 0, present: 0 }
      }
      acc[deptName].count += 1
      
      if (presentTodayIds.has(emp._id)) {
        acc[deptName].present += 1
      }
      return acc
    }, {} as Record<string, { count: number; present: number }>)

    return {
      totalEmployees,
      presentToday,
      lateArrivals,
      absentToday,
      absentEmployees,
      attendanceRate,
      departmentSummary,
      todayAttendance
    }
  }, [employees, attendance, today])

  // État de chargement
  if (initialLoading || employeesLoading || attendanceLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true" />
        <p className="text-xl text-foreground mt-4">Chargement du tableau de bord...</p>
      </div>
    )
  }

  // Redirection si non autorisé
  if (!user || user.role !== "admin") {
    redirect("/")
  }

  // État vide - aucun employé
  if (stats.totalEmployees === 0) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de Bord Administrateur</h1>
          <p className="text-muted-foreground mt-2">Bienvenue ! Commencez par ajouter des employés.</p>
        </div>
        <Card className="p-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Aucun employé enregistré</h3>
          <p className="text-muted-foreground mb-6">
            Ajoutez votre premier employé pour commencer à suivre les présences.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de Bord Administrateur</h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            Aperçu pour le {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Employés" 
          value={stats.totalEmployees.toString()} 
          icon={Users} 
          color="blue" 
        />
        <StatCard
          title="Présents Aujourd'hui"
          value={stats.presentToday.toString()}
          icon={CheckCircle}
          color="green"
        />
        <StatCard 
          title="Arrivées en Retard" 
          value={stats.lateArrivals.toString()} 
          icon={Clock} 
          color="orange" 
        />
        <StatCard 
          title="Absents" 
          value={stats.absentToday.toString()} 
          icon={AlertCircle} 
          color="red" 
        />
      </div>

      {/* Detailed Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Liste des Absents */}
        <AbsentEmployeesCard 
          absentEmployees={stats.absentEmployees}
          totalEmployees={stats.totalEmployees}
        />

        {/* Taux de Présence Global */}
        <Card className="shadow-lg h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Taux de Présence Global</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <p className="text-sm font-medium text-foreground">Présence du jour</p>
                <p className="text-3xl font-bold text-primary">{stats.attendanceRate}%</p>
              </div>
              <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${stats.attendanceRate}%` }}
                  role="progressbar"
                  aria-valuenow={Number(stats.attendanceRate)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Présents</span>
                <span className="font-medium text-green-600">{stats.presentToday}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">En retard</span>
                <span className="font-medium text-orange-600">{stats.lateArrivals}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Absents</span>
                <span className="font-medium text-red-600">{stats.absentToday}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground pt-4 border-t">
              Ce taux reflète la proportion d'employés présents ou en retard aujourd'hui.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}