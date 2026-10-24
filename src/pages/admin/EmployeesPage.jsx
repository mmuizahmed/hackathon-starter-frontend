import { EmployeeDirectory } from "../shared/employees/EmployeeDirectory";

export function AdminEmployeesPage() {
  return <EmployeeDirectory mode="view" detailBase="/admin/employees" />;
}
