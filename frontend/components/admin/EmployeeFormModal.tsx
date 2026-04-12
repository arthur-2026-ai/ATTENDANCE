"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useEmployees } from "../../lib/employee-context"; 
import { Employee } from "../../lib/employee-context-types"; 
import { Loader2 } from "lucide-react";

// Types pour le formulaire (le mot de passe n'est requis qu'à l'ajout)
// Note: Le type Employee doit inclure 'role'.
// En supposant que Employee['role'] soit 'employee' | 'admin'.
type FormData = Omit<Employee, '_id'> & { _id: string; password?: string };

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeToEdit: Employee | null; 
}

export function EmployeeFormModal({ isOpen, onClose, employeeToEdit }: EmployeeFormModalProps) {
  const { addEmployee, updateEmployee } = useEmployees();
  
  // 🎯 CORRECTION DANS L'INITIALISATION: Suppression de l'assertion de type redondante
  const initialState: FormData = {
    _id: '',
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    position: '',
    phone: '',
    joinDate: new Date().toISOString().split('T')[0],
    password: '',
    role: 'employee', 
  };
  
  const [formData, setFormData] = useState<FormData>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Synchroniser les données du formulaire avec l'employé à éditer
  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        ...employeeToEdit,
        _id: employeeToEdit._id,
        // S'assurer que les champs n'existant pas dans Employee (comme password) sont null/vides
        password: '', 
      });
    } else {
      setFormData(initialState);
    }
  }, [employeeToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // Gestion du champ select pour le rôle (Ajouté)
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      // 🎯 Mise à jour pour utiliser 'employee' au lieu de 'user'
      setFormData({ ...formData, role: e.target.value as 'employee' | 'admin' });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Données à envoyer (sans le _id si c'est un ajout, ou le mot de passe s'il n'est pas modifié)
    const dataToSend = { ...formData };
    
    if (employeeToEdit) {
      // Édition
      if (dataToSend.password === '') {
        delete dataToSend.password; // N'envoyer le mot de passe que s'il est explicitement modifié
      }
      try {
        // Le type de retour du contexte est Employee.
        await updateEmployee(dataToSend as Employee);
        console.log(`Employé ${dataToSend.firstName} mis à jour.`);
        onClose();
      } catch (err: any) {
        // Le throw de fetchApi est bien géré ici
        setError(err.message || "Échec de la mise à jour de l'employé.");
      }
    } else {
      // Ajout
      if (!dataToSend.password || dataToSend.password.trim() === '') {
        setError("Le mot de passe initial est requis pour la création.");
        setIsSubmitting(false);
        return;
      }
      
      try {
        await addEmployee(dataToSend);
        console.log(`Employé ${dataToSend.firstName} ajouté avec succès.`);
        onClose();
      } catch (err: any) {
        setError(err.message || "Échec de l'ajout de l'employé. Email peut-être déjà utilisé.");
      }
    }
    setIsSubmitting(false);
  };
  
  const title = employeeToEdit ? "Modifier l'Employé" : "Ajouter un Nouvel Employé";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        {error && <div className="text-red-600 border p-2 rounded bg-red-50 dark:bg-red-950 dark:text-red-300">{error}</div>}

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          {/* Champs Prénom / Nom */}
          <div className="grid grid-cols-2 gap-4">
            <Input name="firstName" placeholder="Prénom" value={formData.firstName} onChange={handleChange} required />
            <Input name="lastName" placeholder="Nom" value={formData.lastName} onChange={handleChange} required />
          </div>

          {/* Champ Email */}
          <Input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          
          {/* Champ Mot de Passe */}
          <Input 
            name="password" 
            type="password" 
            placeholder={employeeToEdit ? "Nouveau Mot de passe (laisser vide pour ne pas changer)" : "Mot de passe Initial"} 
            value={formData.password} 
            onChange={handleChange} 
            required={!employeeToEdit}
          />
          
          {/* Département / Position */}
          <div className="grid grid-cols-2 gap-4">
            <div className='flex flex-col gap-1'>
                <label htmlFor="department" className="text-sm font-medium text-foreground">Département</label>
                <select
                    id="department"
                    name="department"
                    value={formData.department || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground h-10"
                >
                    <option value="" disabled>Sélectionner...</option>
                    <option value="FullStack">FullStack</option>
                    <option value="Gestion de Projet">Gestion de Projet</option>
                    <option value="Design">Design</option>
                    <option value="HR">RH</option>
                    <option value="Securité Informatique">Securité Informatique</option>
                    <option value="Marketing">Marketing</option>
                    <option value="BACKEND">BACKEND</option>
                    <option value="FRONTEND">FRONTEND</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Support Technique">Interlligence Artificielle</option>
                </select>
            </div>
            <div className='flex flex-col gap-1'>
                <label htmlFor="position" className="text-sm font-medium text-foreground">Poste</label>
                <Input type="text" id="position" name="position" value={formData.position || ""} onChange={handleChange} />
            </div>
          </div>
          
          {/* Rôle et Date d'Entrée */}
          <div className="grid grid-cols-2 gap-4">
             <div className='flex flex-col gap-1'>
                <label htmlFor="role" className="text-sm font-medium text-foreground">Rôle</label>
                <select
                    id="role"
                    name="role"
                    // 🎯 CORRECTION DANS LA VALEUR DU SELECT
                    value={formData.role} 
                    onChange={handleRoleChange}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground h-10"
                    required
                >
                    {/* 🎯 CORRECTION DANS LES OPTIONS */}
                    <option value="employee">Employé (employee)</option>
                    <option value="admin">Administrateur (admin)</option>
                </select>
            </div>
            <Input name="joinDate" type="date" value={formData.joinDate} onChange={handleChange} required />
          </div>
          
          {/* Téléphone (simple input) */}
          <Input name="phone" placeholder="Téléphone" value={formData.phone} onChange={handleChange} />


          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.firstName}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {employeeToEdit ? "Enregistrer les modifications" : "Ajouter l'employé"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}