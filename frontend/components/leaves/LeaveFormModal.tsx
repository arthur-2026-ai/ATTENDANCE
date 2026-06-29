// frontend/components/leaves/LeaveFormModal.tsx
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useLeaves } from "@/lib/leave-context"
import { LeaveType } from "@/lib/leave-context-types"
import { Loader2 } from "lucide-react"

interface LeaveFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LeaveFormModal({ isOpen, onClose }: LeaveFormModalProps) {
    const { submitLeave } = useLeaves();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        type: 'Paid' as LeaveType,
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [errorMsg, setErrorMsg] = useState("");

    const todayDate = new Date().toISOString().split('T')[0];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (formData.endDate < formData.startDate) {
            setErrorMsg("La date de fin doit être postérieure ou égale à la date de début.");
            return;
        }

        setIsSubmitting(true);
        try {
            await submitLeave(formData);
            onClose();
            setFormData({ type: 'Paid', startDate: '', endDate: '', reason: '' });
        } catch (error) {
            console.error("Erreur lors de la soumission du congé:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Nouvelle Demande de Congé</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {errorMsg && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                            {errorMsg}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Type de congé</label>
                        <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as LeaveType })}
                            required
                        >
                            <option value="Paid">Congés Payés</option>
                            <option value="Sick">Maladie</option>
                            <option value="Unpaid">Sans Solde</option>
                            <option value="Other">Autre</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date de début</label>
                            <Input
                                type="date"
                                value={formData.startDate}
                                min={todayDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date de fin</label>
                            <Input
                                type="date"
                                value={formData.endDate}
                                min={formData.startDate || todayDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Raison / Commentaire</label>
                        <Textarea
                            placeholder="Détaillez votre demande ici..."
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            required
                            rows={4}
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="min-w-[100px]">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Soumettre"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
