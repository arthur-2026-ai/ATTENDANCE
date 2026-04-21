// frontend/app/leaves/page.tsx
"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLeaves } from "@/lib/leave-context"
import { LeaveTable } from "@/components/leaves/LeaveTable"
import { LeaveFormModal } from "@/components/leaves/LeaveFormModal"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Calendar, CheckCircle2, Clock } from "lucide-react"

export default function LeavesPage() {
    const { user, initialLoading } = useAuth();
    const { leaves, isLoading, pendingCount } = useLeaves();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isAdmin = user?.role === 'admin';

    // Séparer les demandes pour l'affichage Admin (Priorité au "En attente")
    const sortedLeaves = useMemo(() => {
        if (!leaves) return [];
        if (isAdmin) {
            // Pour l'admin, on met les 'Pending' en premier
            return [...leaves].sort((a, b) => {
                if (a.status === 'Pending' && b.status !== 'Pending') return -1;
                if (a.status !== 'Pending' && b.status === 'Pending') return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
        }
        return leaves;
    }, [leaves, isAdmin]);

    if (initialLoading || (!leaves && isLoading)) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestion des Congés</h1>
                    <p className="text-muted-foreground mt-1">
                        {isAdmin 
                            ? "Consultez et gérez les demandes de congés de vos employés." 
                            : "Gérez vos demandes de congés et suivez leur statut."}
                    </p>
                </div>
                {!isAdmin && (
                    <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Plus size={18} />
                        Nouvelle Demande
                    </Button>
                )}
            </div>

            {/* Stats Cards (Simplifiées) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-lg">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">En attente</p>
                        <p className="text-2xl font-bold">{isAdmin ? pendingCount : leaves.filter(l => l.status === 'Pending').length}</p>
                    </div>
                </div>
                <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Approuvées</p>
                        <p className="text-2xl font-bold">{leaves.filter(l => l.status === 'Approved').length}</p>
                    </div>
                </div>
                <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{leaves.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30">
                    <h2 className="font-semibold">Historique des demandes</h2>
                </div>
                <LeaveTable leaves={sortedLeaves} />
            </div>

            <LeaveFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
