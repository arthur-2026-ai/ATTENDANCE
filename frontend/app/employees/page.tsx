"use client"

// Imports nécessaires
import { useState } from "react" 
import { useAuth } from "../../lib/auth-context" 
import { redirect } from "next/navigation"
import { Loader2 } from "lucide-react"

// EmployeeTable, EmployeeFormModal et EmployeeDetailModal
import { EmployeeTable } from "../../components/admin/EmployeeTable" 
import { EmployeeFormModal } from "../../components/admin/EmployeeFormModal" 
import { EmployeeDetailModal } from "../../components/admin/EmployeeDetailModal" 
import { Employee } from "../../lib/employee-context-types" 

// Contextes nécessaires
import { EmployeeProvider, useEmployees } from "../../lib/employee-context" 


// --- Composant Conteneur de la Page ---

function EmployeesContent() {
  const { user, initialLoading } = useAuth()
  const { isLoading: employeesLoading } = useEmployees() 
  
  // --- 1. Gestion des états des modales ---
  
  // Modale d'Édition/Ajout
  const [isEditModalOpen, setIsEditModalOpen] = useState(false) 
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null)

  // Modale de Détails
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false) 
  const [employeeToView, setEmployeeToView] = useState<Employee | null>(null) 

  // --- 2. Handlers pour la Table ---
  
  // Ajouter
  const handleAddClick = () => {
      setEmployeeToEdit(null);
      setIsEditModalOpen(true);
  }

  // Éditer
  const handleEditClick = (employee: Employee) => {
      setEmployeeToEdit(employee);
      setIsEditModalOpen(true);
  }
  
  // Voir les Détails (CORRIGÉ: Cette fonction manquait dans votre version précédente)
  const handleViewDetailsClick = (employee: Employee) => {
      setEmployeeToView(employee);
      setIsDetailModalOpen(true);
  }
  
  // Fermer Modale d'Édition/Ajout
  const handleCloseEditModal = () => {
      setIsEditModalOpen(false);
      setEmployeeToEdit(null);
  }
  
  // Fermer Modale de Détails
  const handleCloseDetailModal = () => {
      setIsDetailModalOpen(false);
      setEmployeeToView(null);
  }
  
  // Supprimer (passé à la table pour satisfaire l'interface)
  const handleDeleteClick = (id: string) => {
      console.log(`Action de suppression reçue pour l'ID: ${id}. Traitement dans EmployeeTable.`);
  }

  // --- 3. Protection de la route et Gestion du Chargement Initial ---
  
  if (initialLoading || employeesLoading) {
    return (
        <div className="p-8 text-center flex flex-col justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin mr-2 text-primary" />
            <p className="text-xl text-foreground mt-4">Chargement des employés et vérification de l'accès...</p>
        </div>
    );
  }

  // Protection de la route (Admin seulement)
  if (!user || user.role !== "admin") {
    redirect("/")
  }
  
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestion des Employés</h1>
        <p className="text-muted-foreground mt-2">Ajouter, modifier et supprimer les utilisateurs de l'entreprise</p>
      </div>

      {/* Tableau des employés avec les handlers passés */}
      <EmployeeTable 
        onAddClick={handleAddClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick} 
        onViewDetailsClick={handleViewDetailsClick} // CORRIGÉ : Ajout de la propriété manquante
      /> 
      
      {/* Modale d'Ajout/Édition */}
      <EmployeeFormModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        employeeToEdit={employeeToEdit}
      />
      
      {/* Modale de Détails */}
      <EmployeeDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        employee={employeeToView}
      />
    </div>
  )
}


// --- Composant Racine (Fournisseur de Contexte) ---

export default function EmployeesPage() {
    return (
        <EmployeeProvider> 
            <EmployeesContent />
        </EmployeeProvider>
    )
}