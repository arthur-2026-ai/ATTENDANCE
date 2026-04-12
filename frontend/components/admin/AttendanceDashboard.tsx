// src/components/admin/AttendanceDashboard.tsx

import { Button } from "@/components/ui/button";
import { useAttendance } from "@/lib/attendance-context";
import { RefreshCw, Loader2 } from "lucide-react";

export function AttendanceDashboard() {
    const { loadAttendance, isLoading } = useAttendance();

    return (
        <div>
            <Button onClick={loadAttendance} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Actualiser les données
            </Button>
            {/* ... (Rendu du tableau et des statistiques) */}
        </div>
    );
}