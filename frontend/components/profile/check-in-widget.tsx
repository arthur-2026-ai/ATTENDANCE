"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Timer,
  TrendingUp
} from "lucide-react"

import { useAuth } from "../../lib/auth-context"
import { useAttendance } from "../../lib/attendance-context"

// Utilitaire pour obtenir la date locale au format YYYY-MM-DD
const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Utilitaire pour formater l'heure
const formatTime = (date: Date = new Date()): string => {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

// Calculer la durée entre deux heures (format HH:MM:SS)
const calculateDuration = (startTime: string, endTime: string): string => {
  try {
    const [startH, startM, startS] = startTime.split(':').map(Number)
    const [endH, endM, endS] = endTime.split(':').map(Number)
    
    const startSeconds = startH * 3600 + startM * 60 + startS
    const endSeconds = endH * 3600 + endM * 60 + endS
    
    let diffSeconds = endSeconds - startSeconds
    if (diffSeconds < 0) diffSeconds += 24 * 3600 // Gère le passage à minuit
    
    const hours = Math.floor(diffSeconds / 3600)
    const minutes = Math.floor((diffSeconds % 3600) / 60)
    
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`
  } catch {
    return "N/A"
  }
}

export function CheckInWidget() {
  const { user } = useAuth()
  const { addCheckIn, addCheckOut, attendance, isLoading } = useAttendance()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Mettre à jour l'heure actuelle toutes les secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Date du jour en format local (évite les problèmes de timezone)
  const today = useMemo(() => getLocalDateString(), [])

  // Trouver l'enregistrement du jour
  const todayRecord = useMemo(() => {
    return attendance.find((r) => r.employeeId === user?.id && r.date === today)
  }, [attendance, user?.id, today])

  // États dérivés
  const isCheckedIn = !!todayRecord?.arrivalTime && !todayRecord?.departureTime
  const isFinished = !!todayRecord?.departureTime

  // Calculer le temps écoulé depuis le check-in
  const elapsedTime = useMemo(() => {
    if (!isCheckedIn || !todayRecord?.arrivalTime) return null
    return calculateDuration(todayRecord.arrivalTime, formatTime(currentTime))
  }, [isCheckedIn, todayRecord?.arrivalTime, currentTime])

  // Calculer le temps de travail total (si check-out effectué)
  const totalWorkTime = useMemo(() => {
    if (!isFinished || !todayRecord?.arrivalTime || !todayRecord?.departureTime) return null
    return calculateDuration(todayRecord.arrivalTime, todayRecord.departureTime)
  }, [isFinished, todayRecord?.arrivalTime, todayRecord?.departureTime])

  // Effacer les messages après 5 secondes
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  // Handlers
  const handleCheckIn = useCallback(async () => {
    if (!user) return
    
    setError(null)
    setSuccess(null)
    setIsProcessing(true)
    
    try {
      const timeString = formatTime()
      await addCheckIn(today, timeString)
      setSuccess(`Arrivée pointée avec succès à ${timeString}`)
    } catch (err: any) {
      setError(err.message || "Échec du pointage d'arrivée.")
    } finally {
      setIsProcessing(false)
    }
  }, [user, today, addCheckIn])

  const handleCheckOut = useCallback(async () => {
    if (!user) return
    
    setError(null)
    setSuccess(null)
    setIsProcessing(true)
    
    try {
      const timeString = formatTime()
      await addCheckOut(today, timeString)
      setSuccess(`Départ pointé avec succès à ${timeString}`)
    } catch (err: any) {
      setError(err.message || "Échec du pointage de départ.")
    } finally {
      setIsProcessing(false)
    }
  }, [user, today, addCheckOut])

  // État de chargement global
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Chargement de la présence...</p>
        </CardContent>
      </Card>
    )
  }

  const isDisabled = isProcessing

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Présence du Jour
          </CardTitle>
          <Badge 
            variant={isFinished ? "secondary" : isCheckedIn ? "default" : "outline"}
            className="text-xs"
          >
            {isFinished ? "Terminé" : isCheckedIn ? "En cours" : "Non commencé"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Horloge en temps réel */}
        <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Heure actuelle</p>
          <p className="text-3xl font-bold text-foreground font-mono">
            {formatTime(currentTime)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {currentTime.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </p>
        </div>

        {/* Temps écoulé ou temps total */}
        {(elapsedTime || totalWorkTime) && (
          <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <Timer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {isFinished 
                ? `Temps de travail total: ${totalWorkTime}`
                : `Temps écoulé: ${elapsedTime}`
              }
            </span>
          </div>
        )}

        {/* Heures d'arrivée et départ */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 border border-border transition-all hover:border-primary/50">
            <div className="flex items-center gap-2 mb-2">
              <LogIn className="h-4 w-4 text-green-600" />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Arrivée
              </p>
            </div>
            <p className="text-2xl font-bold text-foreground font-mono">
              {todayRecord?.arrivalTime || "--:--:--"}
            </p>
            {todayRecord?.arrivalTime && (
              <div className="mt-2">
                <CheckCircle2 className="h-3 w-3 text-green-600 inline mr-1" />
                <span className="text-xs text-green-600">Pointé</span>
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg bg-muted/50 border border-border transition-all hover:border-primary/50">
            <div className="flex items-center gap-2 mb-2">
              <LogOut className="h-4 w-4 text-orange-600" />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Départ
              </p>
            </div>
            <p className="text-2xl font-bold text-foreground font-mono">
              {todayRecord?.departureTime || "--:--:--"}
            </p>
            {todayRecord?.departureTime && (
              <div className="mt-2">
                <CheckCircle2 className="h-3 w-3 text-orange-600 inline mr-1" />
                <span className="text-xs text-orange-600">Pointé</span>
              </div>
            )}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleCheckIn}
            disabled={isDisabled || isCheckedIn || isFinished}
            className={`flex-1 h-12 gap-2 transition-all ${
              isCheckedIn || isFinished
                ? ""
                : "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
            }`}
            variant={isCheckedIn || isFinished ? "secondary" : "default"}
          >
            {isProcessing && !isCheckedIn ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LogIn className="h-5 w-5" />
            )}
            Pointer l'Arrivée
          </Button>

          <Button
            onClick={handleCheckOut}
            disabled={isDisabled || !isCheckedIn || isFinished}
            className={`flex-1 h-12 gap-2 transition-all ${
              !isCheckedIn || isFinished
                ? ""
                : "bg-orange-900 hover:bg-orange-700 text-white shadow-md hover:shadow-lg"
            }`}
            variant={!isCheckedIn || isFinished ? "secondary" : "default"}
          >
            {isProcessing && isCheckedIn ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LogOut className="h-5 w-5" />
            )}
            Pointer le Départ
          </Button>
        </div>

        {/* Messages d'erreur et succès */}
        {error && (
          <Alert variant="destructive" className="animate-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-100 dark:border-green-900 animate-in slide-in-from-top-2">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Message de statut */}
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            {isCheckedIn
              ? `Vous êtes arrivé(e) à ${todayRecord?.arrivalTime}. N'oubliez pas de pointer votre départ.`
              : isFinished
                ? `Journée terminée ! Vous avez travaillé ${totalWorkTime}.`
                : "Commencez votre journée en pointant votre arrivée."}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
