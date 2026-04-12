// src/components/attendance/attendance-filters.tsx
"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Download, Filter } from "lucide-react"

// 🎯 CORRECTION 1: Ajout de 'departmentOptions' aux props
interface AttendanceFiltersProps {
  filters: {
    startDate: string
    endDate: string
    department: string
    employee: string
  }
  // Utiliser le type exact FiltersState si défini et exporté, sinon 'any' est correct ici
  onFilterChange: (filters: any) => void 
  onExport: () => void
  departmentOptions: string[] // 🎯 PROPRIÉTÉ AJOUTÉE
}

// Déstructuration de la nouvelle prop
export function AttendanceFilters({ filters, onFilterChange, onExport, departmentOptions }: AttendanceFiltersProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    onFilterChange({
      ...filters,
      [name]: value,
    })
  }

  return (
    <div className="bg-card rounded-lg p-4 border border-border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Filter size={20} />
          Filtres
        </h3>
        {/* 🎯 CHANGEMENT DE TEXTE (pour la cohérence) */}
        <Button onClick={onExport} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Download size={18} />
          Exporter (PDF/CSV)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Date de début</label>
          <Input type="date" name="startDate" value={filters.startDate} onChange={handleInputChange} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Date de fin</label>
          <Input type="date" name="endDate" value={filters.endDate} onChange={handleInputChange} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Département</label>
          <select
            name="department"
            value={filters.department}
            onChange={handleInputChange}
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground"
          >
            <option value="">Tous les départements</option>
            {/* 🎯 CORRECTION 2: Rendu dynamique basé sur les props */}
            {departmentOptions.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Employé</label>
          <Input
            type="text"
            name="employee"
            placeholder="Rechercher un employé..."
            value={filters.employee}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  )
}