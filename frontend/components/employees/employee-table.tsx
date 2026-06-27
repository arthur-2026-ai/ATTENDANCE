"use client"

import { useState } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Trash2, Edit2, Plus, Loader2 } from "lucide-react"
import { useEmployees } from "../../lib/employee-context"
import { Employee } from "../../lib/employee-context-types"

// 🎯 INTERFACE DE PROP NÉCESSAIRE POUR RÉSOUDRE L'ERREUR DE TYPE
interface EmployeeTableProps {
  onAddClick: () => void
  onEditClick: (employee: Employee) => void
  onDeleteClick: (id: string) => void
}

// 🎯 Le composant doit être exporté de manière standard pour être reconnu
export function EmployeeTable({ onAddClick, onEditClick, onDeleteClick }: EmployeeTableProps) {
  const { employees, isLoading, deleteEmployee } = useEmployees();

  const [searchTerm, setSearchTerm] = useState("")

  const filteredEmployees = employees.filter(
    (emp) => {
      // Filtrage sécurisé
      const term = searchTerm.toLowerCase();

      const firstNameMatch = emp.firstName?.toLowerCase().includes(term);
      const lastNameMatch = emp.lastName?.toLowerCase().includes(term);
      const emailMatch = emp.email?.toLowerCase().includes(term);
      const departmentMatch = emp.department?.toLowerCase().includes(term);

      return firstNameMatch || lastNameMatch || emailMatch || departmentMatch;
    }
  );


  // --- Fonction de suppression réelle ---

  const handleDelete = async (id: string) => {
    // Ici, nous utiliserions un modal personnalisé plutôt que window.confirm
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cet employé ? (Utilisez un modal personnalisé dans l'application finale)");

    if (confirmed) {
      try {
        await deleteEmployee(id);
      } catch (error) {
        // Afficher un message d'erreur à l'utilisateur ici
      }
    }
  }

  // --- RENDU ---

  if (isLoading) {
    return (
      <Card className="p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
        <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
        <span className="text-lg mt-2 text-muted-foreground">Chargement des données employés...</span>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Input
          placeholder="Rechercher par nom, email ou département..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm w-full sm:w-auto"
        />
        <Button onClick={onAddClick} className="w-full sm:w-auto">
          <Plus size={18} className="mr-2" />
          Ajouter Employé
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap tracking-wider text-foreground">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap tracking-wider text-foreground">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap tracking-wider text-foreground">Department</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap tracking-wider text-foreground">Position</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap tracking-wider text-foreground">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap tracking-wider text-foreground">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap tracking-wider text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEmployees.map((employee) => (
                <tr key={employee._id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">
                    {employee.firstName} {employee.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{employee.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{employee.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{employee.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{employee.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(employee.joinDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditClick(employee)}
                        className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(employee._id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredEmployees.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            {searchTerm ? "Aucun employé trouvé correspondant à votre recherche." : "Il n'y a pas d'employés enregistrés."}
          </div>
        )}
      </Card>
    </div>
  )
}