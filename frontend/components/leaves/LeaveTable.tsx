// frontend/components/leaves/LeaveTable.tsx
"use client"

import { useState } from "react"
import { LeaveRequest, LeaveStatus } from "@/lib/leave-context-types"
import { LeaveStatusBadge } from "./LeaveStatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { useLeaves } from "@/lib/leave-context"
import { Check, X, MessageSquare, Loader2 } from "lucide-react"

export function LeaveTable({ leaves }: { leaves: LeaveRequest[] }) {
    const { user } = useAuth();
    const { updateLeaveStatus } = useLeaves();
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [adminComments, setAdminComments] = useState<{ [key: string]: string }>({});

    const isAdmin = user?.role === 'admin';

    const handleStatusUpdate = async (id: string, status: LeaveStatus) => {
        setActionLoading(id);
        try {
            await updateLeaveStatus(id, status, adminComments[id]);
        } catch (error) {
            console.error("Erreur mise à jour statut:", error);
        } finally {
            setActionLoading(null);
        }
    };

    if (leaves.length === 0) {
        return (
            <div className="p-8 text-center bg-card rounded-lg border border-border">
                <p className="text-muted-foreground">Aucune demande de congé trouvée.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                    <tr>
                        {isAdmin && <th className="px-4 py-3 font-medium">Employé</th>}
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Période</th>
                        <th className="px-4 py-3 font-medium">Raison</th>
                        <th className="px-4 py-3 font-medium">Statut</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {leaves.map((leave) => (
                        <tr key={leave._id} className="hover:bg-muted/30 transition-colors">
                            {isAdmin && (
                                <td className="px-4 py-4">
                                    <div className="font-medium">{leave.employeeId?.firstName} {leave.employeeId?.lastName}</div>
                                    <div className="text-xs text-muted-foreground">{leave.employeeId?.department}</div>
                                </td>
                            )}
                            <td className="px-4 py-4">{leave.type}</td>
                            <td className="px-4 py-4">
                                <div className="text-xs">Du {new Date(leave.startDate).toLocaleDateString()}</div>
                                <div className="text-xs">Au {new Date(leave.endDate).toLocaleDateString()}</div>
                            </td>
                            <td className="px-4 py-4 max-w-xs truncate" title={leave.reason}>
                                {leave.reason}
                            </td>
                            <td className="px-4 py-4">
                                <LeaveStatusBadge status={leave.status} />
                                {leave.adminComment && (
                                    <div className="text-[10px] mt-1 text-muted-foreground flex items-start gap-1">
                                        <MessageSquare size={10} className="mt-0.5" />
                                        <span>{leave.adminComment}</span>
                                    </div>
                                )}
                            </td>
                            <td className="px-4 py-4 text-right">
                                {isAdmin && leave.status === 'Pending' ? (
                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                        <Input 
                                            placeholder="Commentaire..." 
                                            className="h-8 text-xs"
                                            value={adminComments[leave._id] || ""}
                                            onChange={(e) => setAdminComments({...adminComments, [leave._id]: e.target.value})}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="h-7 text-[10px] text-red-600 hover:text-red-700"
                                                onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                                                disabled={actionLoading === leave._id}
                                            >
                                                <X size={12} className="mr-1" /> Refuser
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                className="h-7 text-[10px] bg-green-600 hover:bg-green-700"
                                                onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                                                disabled={actionLoading === leave._id}
                                            >
                                                {actionLoading === leave._id ? (
                                                    <Loader2 size={12} className="animate-spin" />
                                                ) : (
                                                    <><Check size={12} className="mr-1" /> Valider</>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-xs text-muted-foreground italic">
                                        {leave.status === 'Pending' ? 'En attente' : 'Terminé'}
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
