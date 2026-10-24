import { useEffect, useRef, useState } from "react";
import { Badge, Button, Card, DataTable, ErrorState, FilterBar, PageHeader, Spinner, StatCard } from "../../components/ui";
import { useTheme } from "../../context/ThemeContext";
import { summarizeDashboard } from "../../features/assistant/api";
import { assistantProblem } from "../../features/assistant/messages";
import { getAbsenceAnomalies, getAttritionRisk, getHrDashboard } from "../../features/dashboards/api";
import { CategoryChart } from "../../features/dashboards/components/CategoryChart";
import { SummaryCard } from "../../features/dashboards/components/SummaryCard";
import { TrendChart } from "../../features/dashboards/components/TrendChart";
import { defaultHrRange, filtersToQuery } from "../../features/dashboards/ranges";
import { listDepartmentOptions } from "../../features/organization/api";
import { formatPercent, titleCase } from "../../lib/format";

const LEVEL_TONE = { watch: "amber", concern: "orange", serious: "red" };

function withValues(rows, key) {
  return Array.isArray(rows) && rows.some((row) => Number(row?.[key]) > 0) ? rows : [];
}

function displayedKpis(data, anomalies, risk) {
  return {
    headcount: data.headcount,
    presentToday: data.presentToday,
    onLeaveToday: data.onLeaveToday,
    lateToday: data.lateToday,
    pendingLeave: data.pendingLeave,
    pendingCorrections: data.pendingCorrections,
    attendanceTrend: data.attendanceTrend,
    absenteeismByDepartment: data.absenteeismByDepartment,
    leaveByType: data.leaveByType,
    topLateComers: data.topLateComers,
    anomalyFlags: anomalies?.flags || [],
    attritionRisk: risk?.items || [],
  };
}

export function HrDashboardPage() {
  const { theme } = useTheme();
  const [filters, setFilters] = useState(() => defaultHrRange());
  const [departments, setDepartments] = useState([]);
  const [data, setData] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [risk, setRisk] = useState(null);
  const [error, setError] = useState("");
  const [insightError, setInsightError] = useState("");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const summaryAbort = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    listDepartmentOptions({ signal: controller.signal })
      .then((options) => {
        if (active) setDepartments(options);
      })
      .catch((requestError) => {
        if (!active || requestError.name === "AbortError") return;
        setDepartments([]);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setSummary(null);
    setSummaryError("");
    summaryAbort.current?.abort();
    const query = filtersToQuery(filters);
    Promise.allSettled([
      getHrDashboard(query, { signal: controller.signal }),
      getAbsenceAnomalies(query, { signal: controller.signal }),
      getAttritionRisk(query, { signal: controller.signal }),
    ]).then((results) => {
      if (!active) return;
      if (results.some((result) => result.reason?.name === "AbortError")) return;
      const [dashboard, anomalyResult, riskResult] = results;
      if (dashboard.status === "rejected") {
        setData(null);
        setError(dashboard.reason?.message || "Could not load the dashboard.");
      } else {
        setData(dashboard.value);
        setError("");
      }
      if (anomalyResult.status === "fulfilled") setAnomalies(anomalyResult.value);
      else setAnomalies(null);
      if (riskResult.status === "fulfilled") setRisk(riskResult.value);
      else setRisk(null);
      const insightFailure = [anomalyResult, riskResult].find((result) => result.status === "rejected");
      setInsightError(insightFailure ? insightFailure.reason?.message || "Could not load insights." : "");
      setLoading(false);
    });
    return () => {
      active = false;
      controller.abort();
    };
  }, [filters]);

  async function onSummarize() {
    if (!data || summaryLoading) return;
    summaryAbort.current?.abort();
    const controller = new AbortController();
    summaryAbort.current = controller;
    setSummaryLoading(true);
    setSummaryError("");
    try {
      const result = await summarizeDashboard(
        {
          kpis: displayedKpis(data, anomalies, risk),
          filters: {
            from: filters.from,
            to: filters.to,
            ...(filters.department ? { departmentId: filters.department } : {}),
          },
        },
        { signal: controller.signal },
      );
      setSummary(result);
    } catch (requestError) {
      if (requestError.name === "AbortError") return;
      setSummary(null);
      setSummaryError(assistantProblem(requestError));
    } finally {
      if (summaryAbort.current === controller) setSummaryLoading(false);
    }
  }

  const pending = (data?.pendingLeave || 0) + (data?.pendingCorrections || 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Today's attendance, pending approvals, and patterns in the selected range."
        actions={
          <Button variant="secondary" disabled={!data || summaryLoading} onClick={onSummarize}>
            Summarize
          </Button>
        }
      />
      <FilterBar
        from={filters.from}
        to={filters.to}
        department={filters.department}
        departments={departments}
        onChange={setFilters}
        onClear={() => setFilters(defaultHrRange())}
      />
      {loading && !data ? <Spinner label="Loading HR figures" /> : null}
      {error ? <ErrorState title="Could not load the dashboard" message={error} onRetry={() => setFilters({ ...filters })} /> : null}
      {data ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Headcount" value={data.headcount ?? 0} />
            <StatCard label="Present" value={data.presentToday ?? 0} hint="Today" />
            <StatCard label="On leave" value={data.onLeaveToday ?? 0} hint="Today" />
            <StatCard label="Late" value={data.lateToday ?? 0} hint="Today" />
            <StatCard
              label="Pending approvals"
              value={pending}
              hint={`${data.pendingLeave ?? 0} leave · ${data.pendingCorrections ?? 0} corrections`}
            />
          </div>
          <SummaryCard
            summary={summary}
            loading={summaryLoading}
            error={summaryError}
            onRetry={onSummarize}
          />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card title="Attendance trend">
              <TrendChart data={data.attendanceTrend || []} theme={theme} />
            </Card>
            <Card title="Absenteeism by department">
              <CategoryChart
                data={withValues(data.absenteeismByDepartment, "expectedDays")}
                nameKey="name"
                valueKey="rate"
                valueLabel="Absenteeism"
                theme={theme}
                formatValue={formatPercent}
                emptyTitle="No absenteeism"
                emptyMessage="Department rates appear when the range has expected working days."
              />
            </Card>
            <Card title="Leave by type">
              <CategoryChart
                data={withValues(data.leaveByType, "days")}
                nameKey="code"
                valueKey="days"
                valueLabel="Approved days"
                theme={theme}
                emptyTitle="No leave in this range"
                emptyMessage="Approved days are grouped by leave type."
              />
            </Card>
            <Card title="Top late arrivals">
              <DataTable
                caption="Top late arrivals"
                columns={[
                  { key: "name", header: "Name" },
                  { key: "lateDays", header: "Late arrivals", align: "right" },
                ]}
                rows={data.topLateComers || []}
                total={(data.topLateComers || []).length}
                emptyTitle="No late arrivals"
                emptyMessage="This list stays empty when nobody arrived late in the range."
              />
            </Card>
          </div>
          {insightError ? <ErrorState title="Could not load insight lists" message={insightError} onRetry={() => setFilters({ ...filters })} /> : null}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card
              title="Absence flags"
              actions={<Badge tone="neutral">Rule-based</Badge>}
            >
              {(anomalies?.flags || []).length === 0 ? (
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  No absence flags for the 12 months ending {anomalies?.to || filters.to}. Bradford, Monday or Friday, and holiday-adjacent checks found nothing to show.
                </p>
              ) : (
                <ul className="space-y-4">
                  {anomalies.flags.map((flag) => (
                    <li key={flag.employeeId}>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{flag.name}</p>
                        <Badge tone={LEVEL_TONE[flag.level] || "neutral"}>{titleCase(flag.level)}</Badge>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{flag.department?.name}</span>
                      </div>
                      <ul className="mt-1 list-disc pl-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                        {(flag.reasons || []).map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card title="Attrition risk" actions={<Badge tone="neutral">Rule-based</Badge>}>
              {(risk?.items || []).length === 0 ? (
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  No one scored above zero. The score uses tenure, late arrivals, absenteeism, unpaid leave, and pay versus the department median.
                </p>
              ) : (
                <ul className="space-y-4">
                  {risk.items.map((item) => (
                    <li key={item.employeeId}>
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                          {item.name}
                          <span className="ml-2 font-normal text-zinc-500 dark:text-zinc-400">{item.department?.name}</span>
                        </p>
                        <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{item.score}</p>
                      </div>
                      <ul className="mt-1 list-disc pl-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                        {(item.drivers || []).map((driver) => (
                          <li key={driver.key}>{driver.reason}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
