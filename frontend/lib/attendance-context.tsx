"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { fetchApi } from './http-client'; 
import type { AttendanceRecord, AttendanceContextType } from '@/lib/attendance-context-types'; 
import { useAuth } from "@/lib/auth-context";


const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined)

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true) 
  const { user, initialLoading } = useAuth(); 

  
  // --- A. RÉCUPÉRATION (GET /api/attendance) ---
  const loadAttendance = useCallback(async () => {
    // Si l'utilisateur n'est pas prêt ou n'est pas admin, on ne charge rien
    if (!user || initialLoading) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const records: AttendanceRecord[] = await fetchApi('attendance', { method: 'GET' });

      // DÉDUPLICATION (si nécessaire)
      const uniqueRecordsMap = new Map<string, AttendanceRecord>();
      records.forEach(record => {
        uniqueRecordsMap.set(record._id, record); 
      });
      
      const uniqueRecords = Array.from(uniqueRecordsMap.values());

      // Tri par date la plus récente
      const sortedRecords = [...uniqueRecords].sort((a, b) => b.date.localeCompare(a.date));
      
      setAttendance(sortedRecords); 
    } catch (error) {
      console.error("Échec du chargement des enregistrements :", error);
      setAttendance([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, initialLoading]); // 🎯 Ajout de user et initialLoading aux dépendances

  // --- B. ENREGISTREMENT d'ARRIVÉE (Check-in) ---
  const addCheckIn: AttendanceContextType['addCheckIn'] = async (date, time) => {
    try {
      const newRecord: AttendanceRecord = await fetchApi('attendance/check-in', {
        method: 'POST',
        body: JSON.stringify({ date, time }),
      });

      // Ajout du nouvel enregistrement en tête de liste et suppression de l'ancien si _id est le même
      setAttendance((prev) => {
        const filteredPrev = prev.filter((r) => r._id !== newRecord._id);
        return [newRecord, ...filteredPrev];
      });

    } catch (error) {
      throw error; 
    }
  }

  // --- C. ENREGISTREMENT de DÉPART (Check-out) ---
  const addCheckOut: AttendanceContextType['addCheckOut'] = async (date, time) => {
    try {
      const updatedRecord: AttendanceRecord = await fetchApi('attendance/check-out', {
        method: 'POST', 
        body: JSON.stringify({ date, time }),
      });

      // Mise à jour de l'enregistrement dans la liste
      setAttendance((prev) => 
        prev.map((r) => (r._id === updatedRecord._id ? updatedRecord : r))
      );
      
    } catch (error) {
      throw error;
    }
  }
  
  // --- D. CHARGEMENT INITIAL ---
  useEffect(() => {
    // Déclenche le chargement dès que l'état d'authentification est prêt (user est défini ou null)
    if (!initialLoading) {
      loadAttendance();
    }
  }, [initialLoading, loadAttendance]); 

  const value = { attendance, isLoading, addCheckIn, addCheckOut, loadAttendance };

  return (
    <AttendanceContext.Provider 
      value={value}>
      {children}
    </AttendanceContext.Provider>
  )
}

export function useAttendance() {
  const context = useContext(AttendanceContext)
  if (!context) {
    throw new Error("useAttendance must be used within AttendanceProvider")
  }
  return context
}