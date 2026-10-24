import { PlaceholderPage } from "../shared/PlaceholderPage";

export function AdminDashboardPage() {
  return (
    <PlaceholderPage
      title="Dashboard"
      description="Company headcount, attrition, payroll cost, and average salary."
      emptyTitle="No figures yet"
      emptyMessage="Numbers are calculated from employees, attendance, leave, and payroll created in the app."
    />
  );
}
