import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, DataTable, ErrorState, IconButton, PageHeader, Spinner, StatusPill } from "../../components/ui";
import { getAttendanceCalendar, listCorrections } from "../../features/attendance/api";
import { shiftMonth } from "../../features/attendance/calendar";
import { AttendanceCalendar } from "../../features/attendance/components/AttendanceCalendar";
import { currentMonthInKarachi, formatDate, formatMonth, formatTime, todayInKarachi } from "../../lib/format";
import { CorrectionForm } from "./attendance/CorrectionForm";
import { DayDetail } from "./attendance/DayDetail";

const LIMIT = 10;

export function EmployeeAttendancePage() {
  const today = todayInKarachi();
  const [month, setMonth] = useState(() => currentMonthInKarachi());
  const [calendar, setCalendar] = useState(null);
  const [selected, setSelected] = useState(null);
  const [calendarError, setCalendarError] = useState("");
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [corrections, setCorrections] = useState(null);
  const [correctionError, setCorrectionError] = useState("");
  const [correctionLoading, setCorrectionLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setCalendarLoading(true);
    getAttendanceCalendar({ month }, { signal: controller.signal })
      .then((result) => {
        if (!active) return;
        setCalendar(result);
        setCalendarError("");
        setSelected((current) => {
          if (current && result?.days?.some((day) => day.date === current.date)) {
            return result.days.find((day) => day.date === current.date) || current;
          }
          return result?.days?.find((day) => day.date === today) || null;
        });
      })
      .catch((error) => {
        if (!active || error.name === "AbortError") return;
        setCalendarError(error.message);
      })
      .finally(() => {
        if (active) setCalendarLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [month, reloadKey, today]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setCorrectionLoading(true);
    listCorrections({ page, limit: LIMIT }, { signal: controller.signal })
      .then((result) => {
        if (!active) return;
        setCorrections(result);
        setCorrectionError("");
      })
      .catch((error) => {
        if (!active || error.name === "AbortError") return;
        setCorrectionError(error.message);
      })
      .finally(() => {
        if (active) setCorrectionLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [page, reloadKey]);

  function reload() {
    setReloadKey((value) => value + 1);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Attendance" description="Your month, the status of each day, and correction requests." />

      {calendarLoading && !calendar ? <Spinner label="Loading the month" /> : null}
      {calendarError && !calendar ? (
        <ErrorState title="Could not load attendance" message={calendarError} onRetry={reload} />
      ) : null}

      {calendar ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
          <Card title="Calendar">
            <div className="mb-3 flex items-center justify-between gap-2">
              <IconButton
                label="Previous month"
                onClick={() => {
                  setSelected(null);
                  setMonth((current) => shiftMonth(current, -1));
                }}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </IconButton>
              <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{formatMonth(calendar.month || month)}</p>
              <IconButton
                label="Next month"
                onClick={() => {
                  setSelected(null);
                  setMonth((current) => shiftMonth(current, 1));
                }}
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </IconButton>
            </div>
            <AttendanceCalendar
              month={calendar.month || month}
              days={calendar.days || []}
              today={today}
              selectedDate={selected?.date || ""}
              onSelectDay={setSelected}
            />
          </Card>
          <div className="space-y-4">
            <DayDetail day={selected} />
            <div id="request-correction" className="scroll-mt-6">
              <CorrectionForm today={today} initialDate={selected?.date || ""} onCreated={reload} />
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">My corrections</h2>
        <DataTable
          caption="My attendance corrections"
          columns={[
            { key: "date", header: "Date", render: (row) => formatDate(row.date) },
            { key: "requestedCheckIn", header: "Check in", render: (row) => formatTime(row.requestedCheckIn) },
            { key: "requestedCheckOut", header: "Check out", render: (row) => formatTime(row.requestedCheckOut) },
            { key: "reason", header: "Reason", wrap: true },
            { key: "status", header: "Status", render: (row) => <StatusPill status={row.status} /> },
          ]}
          rows={corrections?.items || []}
          page={corrections?.page || page}
          limit={corrections?.limit || LIMIT}
          total={corrections?.total || 0}
          onPageChange={setPage}
          loading={correctionLoading}
          error={correctionError}
          onRetry={reload}
          emptyTitle="No corrections"
          emptyMessage="Request a correction when a check-in or check-out was missed."
        />
      </div>
    </div>
  );
}
