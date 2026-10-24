import { EmployeeDirectory } from "../shared/employees/EmployeeDirectory";

export function HrEmployeesPage() {
  return <EmployeeDirectory mode="manage" detailBase="/hr/employees" />;
}
