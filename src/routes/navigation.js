import {
  BadgeDollarSign,
  Building2,
  CalendarCheck,
  CalendarDays,
  Clock,
  IdCard,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Receipt,
  ScrollText,
  Settings,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";

// Sidebar and routes both read this list. The first item is that role's home.
export const roleNavigation = {
  admin: [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { path: "/admin/settings", label: "Company Settings", icon: Settings },
    { path: "/admin/organization", label: "Departments & Designations", icon: Building2 },
    { path: "/admin/leave-setup", label: "Leave Types & Holidays", icon: CalendarDays },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/employees", label: "Employees", icon: IdCard },
    { path: "/admin/attendance", label: "Attendance", icon: Clock },
    { path: "/admin/leave", label: "Leave", icon: CalendarCheck },
    { path: "/admin/payroll", label: "Payroll", icon: Wallet },
    { path: "/admin/audit", label: "Audit Log", icon: ScrollText },
    { path: "/admin/announcements", label: "Announcements", icon: Megaphone },
  ],
  hr: [
    { path: "/hr", label: "Dashboard", icon: LayoutDashboard, end: true },
    { path: "/hr/settings", label: "Company Settings", icon: Settings },
    { path: "/hr/employees", label: "Employees", icon: IdCard },
    { path: "/hr/attendance", label: "Attendance", icon: Clock },
    { path: "/hr/corrections", label: "Corrections", icon: ListChecks },
    { path: "/hr/leave", label: "Leave Approvals", icon: CalendarCheck },
    { path: "/hr/salary", label: "Salary Structures", icon: BadgeDollarSign },
    { path: "/hr/payroll", label: "Payroll", icon: Wallet },
    { path: "/hr/announcements", label: "Announcements", icon: Megaphone },
  ],
  employee: [
    { path: "/employee", label: "Dashboard", icon: LayoutDashboard, end: true },
    { path: "/employee/attendance", label: "My Attendance", icon: Clock },
    { path: "/employee/leave", label: "My Leave", icon: CalendarCheck },
    { path: "/employee/payslips", label: "My Payslips", icon: Receipt },
    { path: "/employee/profile", label: "My Profile", icon: UserRound },
    { path: "/employee/announcements", label: "Announcements", icon: Megaphone },
  ],
};

export function homePathForRole(role) {
  return roleNavigation[role]?.[0]?.path ?? null;
}
