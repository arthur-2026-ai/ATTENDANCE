

"use client"

import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { useAttendance } from "@/lib/attendance-context"

export function AttendanceHistory() {
  const { user } = useAuth()
  const { attendance, isLoading } = useAttendance() // Utilisation de isLoading pour la sécurité

  // log pour debug

  const ids = attendance.map(r => r._id)
  const uniqueIds = new Set(ids)
  if (ids.length !== uniqueIds.size) {
    console.warn("Doublons détectés dans les enregistrements d'attendance:", ids);
  }

  if (!user) return null; // Garde de sécurité

  // 1. Filtrer, trier et limiter les enregistrements
  const employeeRecords = attendance
    .filter((record) => record.employeeId === user.id) 
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
      case "Late":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200"
      case "Absent":
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200"
    }
  }

  // État de chargement
  


  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Historique Récent de Présence</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap text-foreground">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap text-foreground">Arrivée</th>
                <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap text-foreground">Départ</th>
                <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap text-foreground">Durée</th>
                <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap text-foreground">Statut</th>
              </tr>
            </thead>
            <tbody>
              {employeeRecords.map((record) => {
                let duration = "-"
                if (record.arrivalTime && record.departureTime) {
                  const [arrHour, arrMin] = record.arrivalTime.split(":").map(Number)
                  const [depHour, depMin] = record.departureTime.split(":").map(Number)
                  const minutes = depHour * 60 + depMin - (arrHour * 60 + arrMin)
                  const hours = Math.floor(minutes / 60)
                  const mins = minutes % 60
                  duration = `${hours}h ${mins}m`
                }

                return (
                  <tr key={record._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground font-medium">
                      {/* 🎯 Correction: Formatage en français pour la cohérence */}
                      {new Date(record.date).toLocaleDateString("fr-FR", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{record.arrivalTime || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{record.departureTime || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{duration}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {employeeRecords.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">Aucun enregistrement de présence trouvé.</div>
        )}
      </div>
    </Card>
  )
}