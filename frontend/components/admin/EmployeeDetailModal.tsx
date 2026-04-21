"use client"

import React, { useCallback, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog" 
import { Button } from "@/components/ui/button" 
import { User, Mail, Briefcase, Calendar, Phone, MapPin, DollarSign, Building2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Employee } from '../../lib/employee-context-types'


interface EmployeeDetailModalProps {
  isOpen: boolean
  onClose: () => void
  employee: Employee | null
}

// Composant DetailItem extrait pour éviter la recréation
const DetailItem = React.memo(({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon: React.ElementType
  label: string
  value: string | undefined 
}) => (
  <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg transition-colors hover:bg-muted">
    <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" aria-hidden="true" />
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
      <p className="text-base font-semibold text-foreground break-words">
        {value || <span className="text-muted-foreground font-normal">Non spécifié</span>}
      </p>
    </div>
  </div>
))

DetailItem.displayName = 'DetailItem'

export function EmployeeDetailModal({ isOpen, onClose, employee }: EmployeeDetailModalProps) {
  
  // Fonction de formatage de date mémorisée
  const formatDate = useCallback((dateString: string | Date): string => {
    if (!dateString) return "N/A"
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Date invalide"
      
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      console.error('Erreur de formatage de date:', error)
      return "Date invalide"
    }
  }, [])

  // Badge de statut mémorisé
  const statusBadge = useMemo(() => {
    if (!employee?.status) return null

    const statusConfig = {
      active: { label: 'Actif', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
      inactive: { label: 'Inactif', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' },
      onLeave: { label: 'En congé', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' }
    }

    const config = statusConfig[employee.status]
    if (!config) return null

    return (
      <Badge className={config.className} variant="secondary">
        {config.label}
      </Badge>
    )
  }, [employee?.status])

  // Calculer l'ancienneté
  const tenure = useMemo(() => {
    if (!employee?.joinDate) return null

    try {
      const joinDate = new Date(employee.joinDate)
      if (isNaN(joinDate.getTime())) return null

      const now = new Date()
      const years = now.getFullYear() - joinDate.getFullYear()
      const months = now.getMonth() - joinDate.getMonth()
      
      let totalMonths = years * 12 + months
      if (totalMonths < 0) totalMonths = 0

      const displayYears = Math.floor(totalMonths / 12)
      const displayMonths = totalMonths % 12

      if (displayYears > 0 && displayMonths > 0) {
        return `${displayYears} an${displayYears > 1 ? 's' : ''} et ${displayMonths} mois`
      } else if (displayYears > 0) {
        return `${displayYears} an${displayYears > 1 ? 's' : ''}`
      } else if (displayMonths > 0) {
        return `${displayMonths} mois`
      } else {
        return "Moins d'un mois"
      }
    } catch (error) {
      return null
    }
  }, [employee?.joinDate])

  // Gestion de la fermeture avec callback
  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  // Ne rien afficher si pas d'employé
  if (!employee) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-[425px] md:max-w-2xl max-h-[90vh] overflow-y-auto"
        aria-describedby="employee-details-description"
      >
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2 mb-2">
                <User className="h-6 w-6" aria-hidden="true" />
                {employee.firstName} {employee.lastName}
              </DialogTitle>
              <DialogDescription id="employee-details-description">
                Informations complètes de l'employé
              </DialogDescription>
            </div>
            {statusBadge}
          </div>
        </DialogHeader>

        {/* Bloc d'informations principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          
          {/* Section Contact */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4" aria-hidden="true" />
              Contact
            </h3>
          </div>
          
          <DetailItem 
            icon={Mail} 
            label="Email" 
            value={employee.email} 
          />
          <DetailItem 
            icon={Phone} 
            label="Téléphone" 
            value={employee.phone} 
          />


          <Separator className="col-span-1 md:col-span-2 my-2" />

          {/* Section Emploi */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4" aria-hidden="true" />
              Informations professionnelles
            </h3>
          </div>

          <DetailItem 
            icon={Building2} 
            label="Département" 
            value={employee.department} 
          />
          <DetailItem 
            icon={Briefcase} 
            label="Poste" 
            value={employee.position} 
          />
          <DetailItem 
            icon={Calendar} 
            label="Date d'embauche" 
            value={formatDate(employee.joinDate)} 
          />
          {tenure && (
            <DetailItem 
              icon={Calendar} 
              label="Ancienneté" 
              value={tenure} 
            />
          )}
          
        </div>

        {/* Footer avec actions */}
        <div className="pt-6 flex justify-between items-center border-t">
          <p className="text-xs text-muted-foreground">
            ID: {employee._id}
          </p>
          <div className="flex gap-2">
            <Button onClick={handleClose} variant="outline">
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
