import { PageHeader } from "../../components/ui";
import { HolidaysPanel } from "./leave/HolidaysPanel";
import { LeaveTypesPanel } from "./leave/LeaveTypesPanel";

export function AdminLeaveSetupPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Leave Types & Holidays"
        description="Yearly quotas and the public holiday calendar."
      />
      <LeaveTypesPanel />
      <HolidaysPanel />
    </div>
  );
}
