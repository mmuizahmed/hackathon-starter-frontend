import { PageHeader } from "../../components/ui";
import { LeaveInbox } from "../../features/leave/components/LeaveInbox";

export function AdminLeavePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave"
        description="Leave requests across the company, including balance, holidays, and colleagues. HR approves them."
      />
      <LeaveInbox canReview={false} />
    </div>
  );
}
