// 1. INTERFACE DE L'ENREGISTREMENT DE PRÉSENCE

export interface AttendanceRecord {
  _id: string
  employeeId: string
  date: string // YYYY-MM-DD
  arrivalTime: string | null // HH:MM:SS
  departureTime: string | null // HH:MM:SS
  status: "Présent" | "En retard" | "Absent"
}

// 2. INTERFACE DU CONTEXTE ()
export interface AttendanceContextType {
  attendance: AttendanceRecord[]
  isLoading: boolean;
  loadAttendance: () => Promise<void>;
  addCheckIn: (date: string, time: string) => Promise<void>
  addCheckOut: (date: string, time: string) => Promise<void>
}