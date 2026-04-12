// Mock data for the Orion Attendance system
export const mockEmployees = [
  {
    id: 1,
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice@company.com",
    department: "Engineering",
    position: "Senior Developer",
    phone: "+1 (555) 123-4567",
    joinDate: "2022-01-15",
  },
  {
    id: 2,
    firstName: "Bob",
    lastName: "Smith",
    email: "bob@company.com",
    department: "Design",
    position: "UI/UX Designer",
    phone: "+1 (555) 234-5678",
    joinDate: "2022-06-20",
  },
  {
    id: 3,
    firstName: "Carol",
    lastName: "Williams",
    email: "carol@company.com",
    department: "HR",
    position: "HR Manager",
    phone: "+1 (555) 345-6789",
    joinDate: "2021-03-10",
  },
  {
    id: 4,
    firstName: "David",
    lastName: "Brown",
    email: "david@company.com",
    department: "Engineering",
    position: "Backend Developer",
    phone: "+1 (555) 456-7890",
    joinDate: "2022-09-05",
  },
  {
    id: 5,
    firstName: "Emma",
    lastName: "Davis",
    email: "emma@company.com",
    department: "Marketing",
    position: "Marketing Specialist",
    phone: "+1 (555) 567-8901",
    joinDate: "2023-01-20",
  },
  
]

export const mockAttendance = [
  { id: 1, employeeId: 1, date: "2025-11-10", arrivalTime: "08:45", departureTime: "17:30", status: "Present" },
  { id: 2, employeeId: 2, date: "2025-11-10", arrivalTime: "09:15", departureTime: "18:00", status: "Present" },
  { id: 3, employeeId: 3, date: "2025-11-10", arrivalTime: null, departureTime: null, status: "Absent" },
  { id: 4, employeeId: 4, date: "2025-11-10", arrivalTime: "09:45", departureTime: null, status: "Present" },
  { id: 5, employeeId: 5, date: "2025-11-10", arrivalTime: "08:30", departureTime: "17:45", status: "Present" },
  { id: 6, employeeId: 1, date: "2025-11-09", arrivalTime: "08:50", departureTime: "17:35", status: "Present" },
  { id: 7, employeeId: 2, date: "2025-11-09", arrivalTime: "10:00", departureTime: "18:15", status: "Late" },
  { id: 8, employeeId: 3, date: "2025-11-09", arrivalTime: "08:40", departureTime: "17:20", status: "Present" },


]

export const mockUsers = [
  { id: 1, email: "admin@company.com", password: "admin123", role: "admin", name: "Admin User" },
  { id: 2, email: "employee@company.com", password: "employee123", role: "employee", name: "Employee User" },
]
