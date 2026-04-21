// frontend/lib/leave-context-types.ts

export type LeaveType = 'Paid' | 'Sick' | 'Unpaid' | 'Other';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
    _id: string;
    employeeId: {
        _id: string;
        firstName: string;
        lastName: string;
        department: string;
        position: string;
    };
    type: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
    status: LeaveStatus;
    adminComment?: string;
    createdAt: string;
    updatedAt: string;
}

export interface LeaveContextType {
    leaves: LeaveRequest[];
    isLoading: boolean;
    error: string | null;
    loadLeaves: () => Promise<void>;
    submitLeave: (request: { type: LeaveType; startDate: string; endDate: string; reason: string }) => Promise<void>;
    updateLeaveStatus: (id: string, status: LeaveStatus, adminComment?: string) => Promise<void>;
    pendingCount: number;
}
