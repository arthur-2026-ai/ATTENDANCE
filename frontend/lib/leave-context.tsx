// frontend/lib/leave-context.tsx
"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './auth-context';
import { fetchApi } from './http-client';
import { LeaveRequest, LeaveContextType, LeaveStatus, LeaveType } from './leave-context-types';

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export function LeaveProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadLeaves = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchApi('leaves', { method: 'GET' });
            setLeaves(data);
        } catch (err: any) {
            setError(err.message || "Échec du chargement des demandes de congés.");
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    const submitLeave = async (request: { type: LeaveType; startDate: string; endDate: string; reason: string }) => {
        if (!user) return;
        setIsLoading(true);
        try {
            const newLeave = await fetchApi('leaves', {
                method: 'POST',
                body: JSON.stringify(request)
            });
            setLeaves(prev => [newLeave, ...prev]);
        } catch (err: any) {
            setError(err.message || "Échec de l'envoi de la demande.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateLeaveStatus = async (id: string, status: LeaveStatus, adminComment?: string) => {
        if (!user) return;
        setIsLoading(true);
        try {
            const updatedLeave = await fetchApi(`leaves/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status, adminComment })
            });
            setLeaves(prev => prev.map(l => l._id === id ? updatedLeave : l));
        } catch (err: any) {
            setError(err.message || "Échec de la mise à jour de la demande.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Calculer le nombre de demandes en attente pour le badge de l'admin
    const pendingCount = useMemo(() => {
        if (user?.role !== 'admin') return 0;
        return leaves.filter(l => l.status === 'Pending').length;
    }, [leaves, user?.role]);

    // Charger les congés automatiquement au montage si utilisateur connecté
    useEffect(() => {
        if (user) {
            loadLeaves();
        }
    }, [user, loadLeaves]);

    return (
        <LeaveContext.Provider value={{ leaves, isLoading, error, loadLeaves, submitLeave, updateLeaveStatus, pendingCount }}>
            {children}
        </LeaveContext.Provider>
    );
}

export function useLeaves() {
    const context = useContext(LeaveContext);
    if (context === undefined) {
        throw new Error('useLeaves must be used within a LeaveProvider');
    }
    return context;
}
