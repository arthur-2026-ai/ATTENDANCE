// frontend/components/leaves/LeaveStatusBadge.tsx
import { LeaveStatus } from "@/lib/leave-context-types";
import { cn } from "@/lib/utils";

export function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
    const statusStyles = {
        Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        Approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        Rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };

    const statusLabels = {
        Pending: "En attente",
        Approved: "Approuvé",
        Rejected: "Refusé",
    };

    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", statusStyles[status])}>
            {statusLabels[status]}
        </span>
    );
}
