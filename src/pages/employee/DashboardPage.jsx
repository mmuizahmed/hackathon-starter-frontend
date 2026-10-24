import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, ErrorState, PageHeader, Spinner, StatCard } from "../../components/ui";
import { listAnnouncements } from "../../features/announcements/api";
import { listAttendance } from "../../features/attendance/api";
import { getMyDashboard } from "../../features/dashboards/api";
import { getLeaveBalances } from "../../features/leave/api";
import { todayInKarachi } from "../../lib/format";
import { AnnouncementList } from "./dashboard/AnnouncementList";
import { CheckInWidget } from "./dashboard/CheckInWidget";
import { LastPayslipCard } from "./dashboard/LastPayslipCard";
import { LeaveBalanceList } from "./dashboard/LeaveBalanceList";
import { WeekHours } from "./dashboard/WeekHours";

function openAssistant() {
  window.dispatchEvent(new CustomEvent("hcm:open-assistant"));
}

export function EmployeeDashboardPage() {
  const [dash, setDash] = useState(null);
  const [balances, setBalances] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementError, setAnnouncementError] = useState("");
  const [todayRow, setTodayRow] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const today = todayInKarachi();
    setLoading(true);

    Promise.allSettled([
      getMyDashboard({ signal: controller.signal }),
      getLeaveBalances({}, { signal: controller.signal }),
      listAnnouncements({ limit: 4 }, { signal: controller.signal }),
      listAttendance({ from: today, to: today, limit: 5 }, { signal: controller.signal }),
    ]).then((results) => {
      if (!active) return;
      if (results.some((result) => result.reason?.name === "AbortError")) return;
      const [dashboard, balancePage, announcementPage, attendancePage] = results;
      if (dashboard.status === "rejected") {
        setError(dashboard.reason?.message || "Could not load your dashboard.");
        return;
      }
      setDash(dashboard.value);
      setError("");
      setBalances(
        balancePage.status === "fulfilled" ? balancePage.value?.items || [] : dashboard.value?.leaveBalances || [],
      );
      if (announcementPage.status === "fulfilled") {
        setAnnouncements(announcementPage.value?.items || []);
        setAnnouncementError("");
      } else {
        setAnnouncements([]);
        setAnnouncementError(announcementPage.reason?.message || "Could not load announcements.");
      }
      const items = attendancePage.status === "fulfilled" ? attendancePage.value?.items || [] : [];
      setTodayRow(items.find((item) => item.date === today) || null);
    })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadKey]);

  function reload() {
    setReloadKey((value) => value + 1);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Your hours, late arrivals, leave left, and last payslip."
        actions={
          <Button variant="secondary" onClick={openAssistant}>
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            Ask my assistant
          </Button>
        }
      />

      {loading && !dash ? <Spinner label="Loading your dashboard" /> : null}
      {error && !dash ? <ErrorState title="Could not load your dashboard" message={error} onRetry={reload} /> : null}

      {dash ? (
        <>
          <CheckInWidget today={todayRow} status={dash.todayStatus} onChanged={reload} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <WeekHours hours={dash.hoursThisWeek} expected={dash.expectedHours} />
            <StatCard label="Late this month" value={dash.lateCount ?? 0} hint="Late arrivals from the first of the month through today." />
            <LastPayslipCard payslip={dash.lastPayslip} />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <LeaveBalanceList items={balances.length ? balances : dash.leaveBalances || []} />
            <AnnouncementList items={announcements} error={announcementError} onRetry={reload} />
          </div>
        </>
      ) : null}
    </div>
  );
}
