"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface Employee {
  id: number
  firstName: string
  lastName: string
  email: string
  department: string
  position: string
  phone: string
  joinDate: string
}

interface EmployeeModalProps {
  isOpen: boolean
  employee: Employee | null
  onClose: () => void
  onSave: (employee: Employee) => void
}

export function EmployeeModal({ isOpen, employee, onClose, onSave }: EmployeeModalProps) {
  const [formData, setFormData] = useState<Partial<Employee>>({})

  useEffect(() => {
    if (employee) {
      setFormData(employee)
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        department: "",
        position: "",
        phone: "",
        joinDate: new Date().toISOString().split("T")[0],
      })
    }
  }, [employee])

  if (!isOpen) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.firstName && formData.lastName && formData.email) {
      onSave({
        id: employee?.id || Date.now(),
        firstName: formData.firstName || "",
        lastName: formData.lastName || "",
        email: formData.email || "",
        department: formData.department || "",
        position: formData.position || "",
        phone: formData.phone || "",
        joinDate: formData.joinDate || new Date().toISOString().split("T")[0],
      })
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">{employee ? "Edit Employee" : "Add New Employee"}</h2>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">First Name *</label>
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Last Name *</label>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                <Input type="email" name="email" value={formData.email || ""} onChange={handleInputChange} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Department</label>
                  <select
                    name="department"
                    value={formData.department || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground"
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
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Position</label>
                  <Input type="text" name="position" value={formData.position || ""} onChange={handleInputChange} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                  <Input type="tel" name="phone" value={formData.phone || ""} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Join Date</label>
                  <Input type="date" name="joinDate" value={formData.joinDate || ""} onChange={handleInputChange} />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" onClick={onClose} variant="outline" className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  {employee ? "Update" : "Add"} Employee
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </>
  )
}
