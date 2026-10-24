import { useSearchParams } from "react-router-dom";
import { PageHeader } from "../../components/ui";
import { AttendanceBoard } from "../../features/attendance/components/AttendanceBoard";
import { CorrectionsInbox } from "../../features/attendance/components/CorrectionsInbox";
import { ViewTabs } from "../../features/hr/ViewTabs";

export function AdminAttendancePage() {
  const [params, setParams] = useSearchParams();
  const view = params.get("view") === "corrections" ? "corrections" : "board";

  function setView(next) {
    const updated = new URLSearchParams(params);
    if (next === "corrections") updated.set("view", "corrections");
    else updated.delete("view");
    setParams(updated);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Company attendance for a day. Corrections are visible here. HR approves them."
        actions={
          <ViewTabs
            label="Attendance views"
            value={view}
            onChange={setView}
            options={[
              { value: "board", label: "Daily board" },
              { value: "corrections", label: "Corrections" },
            ]}
          />
        }
      />
      {view === "corrections" ? <CorrectionsInbox canReview={false} /> : <AttendanceBoard />}
    </div>
  );
}
