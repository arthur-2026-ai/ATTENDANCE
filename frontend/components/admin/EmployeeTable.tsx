"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Trash2,
  Edit2,
  Plus,
  Loader2,
  Search,
  Eye,
  ArrowUpDown,
  Download,
  Users,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { useEmployees } from "../../lib/employee-context"
import { type Employee as EmployeeType } from "../../lib/employee-context-types"
// Types
interface Employee {
  _id: string
  firstName: string
  lastName: string
  email: string
  department?: string
  position?: string
  phone?: string
  joinDate: string | Date
  status?: 'active' | 'inactive' | 'onLeave'
}

interface EmployeeTableProps {
  onAddClick: () => void
  onEditClick: (employee: Employee) => void
  onDeleteClick: (id: string) => void
  onViewDetailsClick: (employee: Employee) => void
}



type SortField = 'name' | 'email' | 'department' | 'position' | 'joinDate'
type SortOrder = 'asc' | 'desc'

export function EmployeeTable({ onAddClick, onEditClick, onDeleteClick, onViewDetailsClick }: EmployeeTableProps) {
  const { employees, isLoading, deleteEmployee } = useEmployees()

  const [searchTerm, setSearchTerm] = useState("")
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const departments = useMemo(() => {
    const depts = new Set(employees.map((emp) => emp.department).filter(Boolean))
    return Array.from(depts).sort()
  }, [employees])

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortOrder('asc') }
  }, [sortField, sortOrder])

  const filteredAndSorted = useMemo(() => {
    let result = employees.filter((emp) => {
      const term = searchTerm.toLowerCase()
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase()
      const matchesSearch = fullName.includes(term) || emp.email?.toLowerCase().includes(term) || emp.department?.toLowerCase().includes(term)
      const matchesDept = departmentFilter === "all" || emp.department === departmentFilter
      //const matchesStatus = statusFilter === "all" || emp.status === statusFilter
      return matchesSearch && matchesDept // && matchesStatus
    })

    result.sort((a, b) => {
      let aVal: any, bVal: any
      switch (sortField) {
        case 'name':
          aVal = `${a.firstName} ${a.lastName}`.toLowerCase()
          bVal = `${b.firstName} ${b.lastName}`.toLowerCase()
          break
        case 'email':
          aVal = a.email.toLowerCase()
          bVal = b.email.toLowerCase()
          break
        case 'department':
          aVal = (a.department || '').toLowerCase()
          bVal = (b.department || '').toLowerCase()
          break
        case 'position':
          aVal = (a.position || '').toLowerCase()
          bVal = (b.position || '').toLowerCase()
          break
        case 'joinDate':
          aVal = new Date(a.joinDate).getTime()
          bVal = new Date(b.joinDate).getTime()
          break
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
    return result
  }, [employees, searchTerm, departmentFilter, statusFilter, sortField, sortOrder])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirmId) return
    setDeletingId(deleteConfirmId)
    try {
      await deleteEmployee(deleteConfirmId)
      onDeleteClick(deleteConfirmId)
      setFeedback({ type: 'success', msg: 'Employé supprimé' })
      setTimeout(() => setFeedback(null), 3000)
    } catch (error) {
      setFeedback({ type: 'error', msg: 'Échec de la suppression' })
      setTimeout(() => setFeedback(null), 3000)
    } finally {
      setDeletingId(null)
      setDeleteConfirmId(null)
    }
  }, [deleteConfirmId, deleteEmployee, onDeleteClick])

  const handleExport = useCallback(() => {
    const headers = ['Nom', 'Prénom', 'Email', 'Département', 'Poste', 'Téléphone', 'Date', 'Statut']
    const rows = filteredAndSorted.map(e => [e.lastName, e.firstName, e.email, e.department || '', e.position || '', e.phone || '', new Date(e.joinDate).toLocaleDateString('fr-FR'), e.status || ''])
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `employes_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
    setFeedback({ type: 'success', msg: `Export: ${filteredAndSorted.length} employé(s)` })
    setTimeout(() => setFeedback(null), 3000)
  }, [filteredAndSorted])

  const StatusBadge = ({ status }: { status?: string }) => {
    if (!status) return null
    const cfg = {
      active: { label: 'Actif', cls: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
      inactive: { label: 'Inactif', cls: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' },
      onLeave: { label: 'Congé', cls: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
    }
    const c = cfg[status as keyof typeof cfg]
    return c ? <Badge variant="outline" className={`${c.cls} text-xs`}>{c.label}</Badge> : null
  }

  const SortHeader = ({ field, children, className = "" }: { field: SortField; children: React.ReactNode; className?: string }) => (
    <TableHead 
      className={`px-4 py-3 text-xs font-semibold uppercase cursor-pointer hover:bg-muted transition ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        <ArrowUpDown className={`h-3 w-3 ${sortField === field ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
    </TableHead>
  )

  if (isLoading) return (
    <Card className="shadow-lg">
      <CardContent className="p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">Chargement...</p>
      </CardContent>
    </Card>
  )

  const hasFilters = searchTerm || departmentFilter !== "all" || statusFilter !== "all"

  return (
    <div className="space-y-4">
      {feedback && (
        <div className={`p-4 rounded-lg border flex items-center gap-3 animate-in slide-in-from-top-2 ${
          feedback.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:text-green-100' 
            : 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:text-red-100'
        }`}>
          {feedback.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span>{feedback.msg}</span>
        </div>
      )}

      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">
                Employés <span className="text-sm font-normal text-muted-foreground">({filteredAndSorted.length}/{employees.length})</span>
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExport} variant="outline" size="sm" disabled={filteredAndSorted.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button onClick={onAddClick} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <span className="text-xs font-medium text-muted-foreground mb-2 block">Département</span>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant={departmentFilter === "all" ? "default" : "outline"} onClick={() => setDepartmentFilter("all")} className="text-xs h-8">Tous</Button>
                {departments.map(d => <Button key={d} size="sm" variant={departmentFilter === d ? "default" : "outline"} onClick={() => setDepartmentFilter(d!)} className="text-xs h-8">{d}</Button>)}
              </div>
            </div>
            <div className="flex-1">
              <span className="text-xs font-medium text-muted-foreground mb-2 block">Statut</span>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant={statusFilter === "all" ? "default" : "outline"} onClick={() => setStatusFilter("all")} className="text-xs h-8">Tous</Button>
                <Button size="sm" variant={statusFilter === "active" ? "default" : "outline"} onClick={() => setStatusFilter("active")} className="text-xs h-8">Actif</Button>
                <Button size="sm" variant={statusFilter === "onLeave" ? "default" : "outline"} onClick={() => setStatusFilter("onLeave")} className="text-xs h-8">Congé</Button>
              </div>
            </div>
          </div>

          {hasFilters && <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(""); setDepartmentFilter("all"); setStatusFilter("all"); }}>Réinitialiser</Button>}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <SortHeader field="name">Nom</SortHeader>
                <SortHeader field="email" className="hidden sm:table-cell">Email</SortHeader>
                <TableHead className="px-4 py-3 hidden lg:table-cell">Statut</TableHead>
                <SortHeader field="department" className="hidden md:table-cell">Département</SortHeader>
                <SortHeader field="joinDate" className="hidden md:table-cell">Date</SortHeader>
                <TableHead className="px-4 py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSorted.map(emp => (
                <TableRow key={emp._id} className="hover:bg-muted/50">
                  <TableCell className="px-4 py-4">
                    <button onClick={() => onViewDetailsClick(emp)} className="text-sm font-semibold text-primary hover:underline">
                      {emp.firstName} {emp.lastName}
                    </button>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-muted-foreground hidden sm:table-cell">{emp.email}</TableCell>
                  { /*<TableCell className="px-4 py-4 hidden lg:table-cell"><StatusBadge status={emp.status} /></TableCell>*/}
                  <TableCell className="px-4 py-4 text-sm text-muted-foreground hidden md:table-cell">{emp.department || '-'}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-muted-foreground hidden md:table-cell">{new Date(emp.joinDate).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onViewDetailsClick(emp)} className="p-2"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => onEditClick(emp)} className="p-2"><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(emp._id)} disabled={deletingId === emp._id} className="text-destructive p-2">
                        {deletingId === emp._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredAndSorted.length === 0 && (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{hasFilters ? "Aucun résultat" : "Aucun employé"}</h3>
            <p className="text-sm text-muted-foreground mb-6">{hasFilters ? "Modifiez vos filtres" : "Ajoutez votre premier employé"}</p>
            {!hasFilters && <Button onClick={onAddClick}><Plus className="h-4 w-4 mr-2" />Ajouter</Button>}
          </div>
        )}
      </Card>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-background p-6 rounded-lg shadow-xl max-w-md w-full animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-muted-foreground mb-6">Êtes-vous sûr ? Cette action est irréversible.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Annuler</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>Supprimer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Demo() {
  const [selected, setSelected] = useState<Employee | null>(null)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Tableau de Gestion des Employés</h1>
          <p className="text-muted-foreground">Tri · Filtres · Export CSV</p>
        </div>
        <EmployeeTable onAddClick={() => alert('Ajouter')} onEditClick={(e) => alert(`Modifier ${e.firstName}`)} onDeleteClick={(id) => console.log('Supprimé:', id)} onViewDetailsClick={setSelected} />
        {selected && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200">
            <p className="text-sm"><strong>Sélectionné:</strong> {selected.firstName} {selected.lastName} - {selected.email}</p>
          </Card>
        )}
      </div>
    </div>
  )
}