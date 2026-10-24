import { Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { AuthLayout } from "../components/layout/AuthLayout";
import { AdminAnnouncementsPage } from "../pages/admin/AnnouncementsPage";
import { AdminAttendancePage } from "../pages/admin/AttendancePage";
import { AdminAuditLogPage } from "../pages/admin/AuditLogPage";
import { AdminCompanySettingsPage } from "../pages/admin/CompanySettingsPage";
import { AdminDashboardPage } from "../pages/admin/DashboardPage";
import { AdminEmployeeDetailPage } from "../pages/admin/EmployeeDetailPage";
import { AdminEmployeesPage } from "../pages/admin/EmployeesPage";
import { AdminLeavePage } from "../pages/admin/LeavePage";
import { AdminLeaveSetupPage } from "../pages/admin/LeaveSetupPage";
import { AdminOrganizationPage } from "../pages/admin/OrganizationPage";
import { AdminPayrollPage } from "../pages/admin/PayrollPage";
import { AdminUsersPage } from "../pages/admin/UsersPage";
import { EmployeeAnnouncementsPage } from "../pages/employee/AnnouncementsPage";
import { EmployeeAttendancePage } from "../pages/employee/AttendancePage";
import { EmployeeDashboardPage } from "../pages/employee/DashboardPage";
import { EmployeeLeavePage } from "../pages/employee/LeavePage";
import { EmployeePayslipsPage } from "../pages/employee/PayslipsPage";
import { EmployeeProfilePage } from "../pages/employee/ProfilePage";
import { HrAnnouncementsPage } from "../pages/hr/AnnouncementsPage";
import { HrAttendancePage } from "../pages/hr/AttendancePage";
import { HrCorrectionsPage } from "../pages/hr/CorrectionsPage";
import { HrDashboardPage } from "../pages/hr/DashboardPage";
import { HrCompanySettingsPage } from "../pages/hr/CompanySettingsPage";
import { HrEmployeeDetailPage } from "../pages/hr/EmployeeDetailPage";
import { HrEmployeesPage } from "../pages/hr/EmployeesPage";
import { HrLeaveApprovalsPage } from "../pages/hr/LeaveApprovalsPage";
import { HrPayrollPage } from "../pages/hr/PayrollPage";
import { HrSalaryStructuresPage } from "../pages/hr/SalaryStructuresPage";
import { ChangePasswordPage } from "../pages/shared/ChangePasswordPage";
import { LoginPage } from "../pages/shared/LoginPage";
import { NotFoundPage } from "../pages/shared/NotFoundPage";
import { SetupPage } from "../pages/shared/SetupPage";
import { roleNavigation } from "./navigation";
import { GuestOnly, HomeRedirect, RequireAuth, RequireFreshPassword, RequireRole, SessionGate } from "./guards";

// Paths live in navigation.js. Pages stay here so the sidebar does not import screens.
const pages = {
  "/admin": AdminDashboardPage,
  "/admin/settings": AdminCompanySettingsPage,
  "/admin/organization": AdminOrganizationPage,
  "/admin/leave-setup": AdminLeaveSetupPage,
  "/admin/users": AdminUsersPage,
  "/admin/employees": AdminEmployeesPage,
  "/admin/attendance": AdminAttendancePage,
  "/admin/leave": AdminLeavePage,
  "/admin/payroll": AdminPayrollPage,
  "/admin/audit": AdminAuditLogPage,
  "/admin/announcements": AdminAnnouncementsPage,
  "/hr": HrDashboardPage,
  "/hr/settings": HrCompanySettingsPage,
  "/hr/employees": HrEmployeesPage,
  "/hr/attendance": HrAttendancePage,
  "/hr/corrections": HrCorrectionsPage,
  "/hr/leave": HrLeaveApprovalsPage,
  "/hr/salary": HrSalaryStructuresPage,
  "/hr/payroll": HrPayrollPage,
  "/hr/announcements": HrAnnouncementsPage,
  "/employee": EmployeeDashboardPage,
  "/employee/attendance": EmployeeAttendancePage,
  "/employee/leave": EmployeeLeavePage,
  "/employee/payslips": EmployeePayslipsPage,
  "/employee/profile": EmployeeProfilePage,
  "/employee/announcements": EmployeeAnnouncementsPage,
};

function roleRoutes(role) {
  return roleNavigation[role].map((route) => {
    const Page = pages[route.path];
    return <Route key={route.path} path={route.path} element={<Page />} />;
  });
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<SessionGate />}>
        <Route element={<AuthLayout />}>
          <Route element={<GuestOnly />}>
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route element={<RequireAuth />}>
            <Route path="/change-password" element={<ChangePasswordPage />} />
          </Route>
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<RequireFreshPassword />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomeRedirect />} />
              <Route element={<RequireRole roles={["admin"]} />}>
                {roleRoutes("admin")}
                <Route path="/admin/employees/:id" element={<AdminEmployeeDetailPage />} />
              </Route>
              <Route element={<RequireRole roles={["hr"]} />}>
                {roleRoutes("hr")}
                <Route path="/hr/employees/:id" element={<HrEmployeeDetailPage />} />
              </Route>
              <Route element={<RequireRole roles={["employee"]} />}>{roleRoutes("employee")}</Route>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
