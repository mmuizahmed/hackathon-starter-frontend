import { PageHeader } from "../../components/ui";
import { AttendanceBoard } from "../../features/attendance/components/AttendanceBoard";

export function HrAttendancePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Daily board for check-in, check-out, hours, and status. Open a person to see their month."
      />
      <AttendanceBoard />
    </div>
  );
}
