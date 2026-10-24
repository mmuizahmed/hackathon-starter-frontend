import { PageHeader } from "../../components/ui";
import { CorrectionsInbox } from "../../features/attendance/components/CorrectionsInbox";

export function HrCorrectionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Corrections"
        description="Compare the requested times with the recorded day. Approve or reject with a comment."
      />
      <CorrectionsInbox canReview />
    </div>
  );
}
