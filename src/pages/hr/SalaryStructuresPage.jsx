import { PageHeader } from "../../components/ui";
import { SalaryStructures } from "../../features/payroll/components/SalaryStructures";

export function HrSalaryStructuresPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Salary Structures"
        description="Set basic pay per employee. HRA is 40%, medical is 10%, and gross is 1.5× basic. Older structures stay in the history."
      />
      <SalaryStructures canEdit />
    </div>
  );
}
