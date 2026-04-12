"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Building2, Calendar, Briefcase, Crown, User, Copy, Check } from "lucide-react"
import { useState } from "react"

// Interface Employee harmonisée
export interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  department?: string
  position?: string
  phone?: string
  joinDate: string | Date
  role?: 'admin' | 'employee'
  status?: 'active' | 'inactive' | 'onLeave'
  salary?: number
}

interface ProfileHeaderProps {
  employee: Employee
  showSalary?: boolean
}

export function ProfileHeader({ employee, showSalary = false }: ProfileHeaderProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Fonction pour copier dans le presse-papier
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Erreur de copie:', err)
    }
  }

  // Calculs mémorisés pour optimiser les performances
  const profileData = useMemo(() => {
    // 1. Formater la date d'embauche
    let formattedJoinDate = 'Non spécifiée'
    let isValidDate = false
    
    if (employee.joinDate) {
      try {
        const date = new Date(employee.joinDate)
        if (!isNaN(date.getTime())) {
          formattedJoinDate = date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
          isValidDate = true
        }
      } catch (error) {
        console.error('Erreur de formatage de date:', error)
      }
    }

    // 2. Calculer l'ancienneté de manière lisible
    let tenure = 'Non disponible'
    
    if (isValidDate && employee.joinDate) {
      try {
        const joinDate = new Date(employee.joinDate)
        const now = new Date()
        const diffTime = now.getTime() - joinDate.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays < 0) {
          tenure = 'Date future'
        } else if (diffDays === 0) {
          tenure = "Aujourd'hui"
        } else if (diffDays < 30) {
          tenure = `${diffDays} jour${diffDays > 1 ? 's' : ''}`
        } else if (diffDays < 365) {
          const months = Math.floor(diffDays / 30)
          tenure = `${months} mois`
        } else {
          const years = Math.floor(diffDays / 365)
          const remainingDays = diffDays % 365
          const months = Math.floor(remainingDays / 30)
          
          if (months > 0) {
            tenure = `${years} an${years > 1 ? 's' : ''} et ${months} mois`
          } else {
            tenure = `${years} an${years > 1 ? 's' : ''}`
          }
        }
      } catch (error) {
        console.error('Erreur de calcul d\'ancienneté:', error)
      }
    }

    // 3. Générer les initiales
    const initials = `${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`.toUpperCase() || '?'

    // 4. Formater le salaire si disponible
    let formattedSalary = null
    if (showSalary && employee.salary) {
      try {
        formattedSalary = new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'XAF',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(employee.salary)
      } catch (error) {
        formattedSalary = `${employee.salary.toLocaleString('fr-FR')} FCFA`
      }
    }

    return {
      formattedJoinDate,
      tenure,
      initials,
      formattedSalary
    }
  }, [employee, showSalary])

  // Configuration des badges de statut
  const statusConfig = useMemo(() => {
    if (!employee.status) return null

    const configs = {
      active: { 
        label: 'Actif', 
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800' 
      },
      inactive: { 
        label: 'Inactif', 
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-800' 
      },
      onLeave: { 
        label: 'En congé', 
        className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-200 dark:border-orange-800' 
      }
    }

    return configs[employee.status]
  }, [employee.status])

  return (
    <Card className="shadow-lg">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar avec gradient */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gradient-to-br from-primary via-primary to-primary/70 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg transition-transform group-hover:scale-105">
              {profileData.initials}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 shadow-md">
              {employee.role === 'admin' ? (
                <Crown className="h-5 w-5 text-yellow-500" aria-label="Administrateur" />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" aria-label="Employé" />
              )}
            </div>
          </div>

          {/* Informations principales */}
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {employee.firstName} {employee.lastName}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <Briefcase className="text-primary h-4 w-4" aria-hidden="true" />
                  <p className="text-base sm:text-lg text-primary font-medium">
                    {employee.position || 'Poste non assigné'}
                  </p>
                </div>
              </div>
              
              {/* Badges de statut et rôle */}
              <div className="flex flex-wrap gap-2">
                {statusConfig && (
                  <Badge variant="outline" className={statusConfig.className}>
                    {statusConfig.label}
                  </Badge>
                )}
                {employee.role === 'admin' && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                    <Crown className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
            </div>

            {/* Grille d'informations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {/* Département */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <Building2 className="text-primary mt-0.5 flex-shrink-0" size={18} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                    Département
                  </p>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {employee.department || 'Non assigné'}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group relative">
                <Mail className="text-primary mt-0.5 flex-shrink-0" size={18} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                    Email
                  </p>
                  <a 
                    href={`mailto:${employee.email}`}
                    className="text-sm font-semibold text-foreground hover:text-primary truncate block transition-colors"
                  >
                    {employee.email}
                  </a>
                </div>
                <button
                  onClick={() => copyToClipboard(employee.email, 'email')}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-background rounded"
                  aria-label="Copier l'email"
                >
                  {copiedField === 'email' ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  )}
                </button>
              </div>

              {/* Téléphone */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group relative">
                <Phone className="text-primary mt-0.5 flex-shrink-0" size={18} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                    Téléphone
                  </p>
                  {employee.phone ? (
                    <a 
                      href={`tel:${employee.phone}`}
                      className="text-sm font-semibold text-foreground hover:text-primary truncate block transition-colors"
                    >
                      {employee.phone}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-muted-foreground">Non renseigné</p>
                  )}
                </div>
                {employee.phone && (
                  <button
                    onClick={() => copyToClipboard(employee.phone!, 'phone')}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-background rounded"
                    aria-label="Copier le téléphone"
                  >
                    {copiedField === 'phone' ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    )}
                  </button>
                )}
              </div>

              {/* Date d'embauche */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <Calendar className="text-primary mt-0.5 flex-shrink-0" size={18} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                    Embauche
                  </p>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {profileData.formattedJoinDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Barre d'informations supplémentaires */}
            <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-border text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-muted-foreground">Ancienneté:</span>
                <span className="font-semibold text-foreground">{profileData.tenure}</span>
              </div>
              
              {profileData.formattedSalary && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">Salaire:</span>
                  <span className="font-semibold text-foreground">{profileData.formattedSalary}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-muted-foreground">ID:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{employee.id}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

