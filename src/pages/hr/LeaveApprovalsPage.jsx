import { PageHeader } from "../../components/ui";
import { LeaveInbox } from "../../features/leave/components/LeaveInbox";

export function HrLeaveApprovalsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Approvals"
        description="Each request shows the balance change, holidays in the range, colleagues already off, and leave already taken this year."
      />
      <LeaveInbox canReview />
    </div>
  );
}
