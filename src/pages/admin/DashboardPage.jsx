import { Banknote, TrendingDown, Users, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button, Card, DataTable, ErrorState, FilterBar, PageHeader, Spinner, StatCard } from "../../components/ui";
import { useTheme } from "../../context/ThemeContext";
import { summarizeDashboard } from "../../features/assistant/api";
import { assistantProblem } from "../../features/assistant/messages";
import { getAdminDashboard } from "../../features/dashboards/api";
import { CategoryChart } from "../../features/dashboards/components/CategoryChart";
import { LatestAnnouncements } from "../../features/announcements/LatestAnnouncements";
import { SummaryCard } from "../../features/dashboards/components/SummaryCard";
import { defaultAdminRange, filtersToQuery, isYearToDate } from "../../features/dashboards/ranges";
import { listDepartmentOptions } from "../../features/organization/api";
import { formatDateTime, formatPercent, formatRupees, formatRupeesWhole, titleCase } from "../../lib/format";

function withValues(rows, key) {
  return Array.isArray(rows) && rows.some((row) => Number(row?.[key]) > 0) ? rows : [];
}

function displayedKpis(data) {
  return {
    headcount: data.headcount,
    attritionRate: data.attritionRate,
    exits: data.exits,
    averageHeadcount: data.averageHeadcount,
    payrollCost: data.payrollCost,
    averageSalary: data.averageSalary,
    headcountByDepartment: data.headcountByDepartment,
    payrollCostByDepartment: data.payrollCostByDepartment,
    gender: data.gender,
    tenureBuckets: data.tenureBuckets,
  };
}

export function AdminDashboardPage() {
  const { theme } = useTheme();
  const [filters, setFilters] = useState(() => defaultAdminRange());
  const [departments, setDepartments] = useState([]);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
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
    getAdminDashboard(filtersToQuery(filters), { signal: controller.signal })
      .then((result) => {
        if (!active) return;
        setData(result);
        setError("");
      })
      .catch((requestError) => {
        if (!active || requestError.name === "AbortError") return;
        setData(null);
        setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
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
          kpis: displayedKpis(data),
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

  const gender = (data?.gender || []).map((row) => ({ ...row, gender: titleCase(row.gender) }));
  const attritionHint = data
    ? `${isYearToDate(filters) ? "Year to date. " : ""}${data.exits} exits, average headcount ${data.averageHeadcount}.`
    : "";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Headcount, attrition, payroll cost, and average salary for the selected range."
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
        onClear={() => setFilters(defaultAdminRange())}
      />
      {loading && !data ? <Spinner label="Loading company figures" /> : null}
      {error ? <ErrorState title="Could not load the dashboard" message={error} onRetry={() => setFilters({ ...filters })} /> : null}
      {data ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard label="Headcount" icon={Users} value={data.headcount ?? 0} hint="Active and probation on the end date." />
            <StatCard label="Attrition" icon={TrendingDown} value={formatPercent(data.attritionRate)} hint={attritionHint} />
            <StatCard label="Payroll cost" icon={Wallet} value={formatRupeesWhole(data.payrollCost)} hint="Gross pay in the selected months." />
            <StatCard label="Average salary" icon={Banknote} value={formatRupeesWhole(data.averageSalary)} hint="Mean gross in the selected months." />
          </div>
          <SummaryCard
            summary={summary}
            loading={summaryLoading}
            error={summaryError}
            onRetry={onSummarize}
          />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card title="Headcount by department">
              <CategoryChart
                data={withValues(data.headcountByDepartment, "count")}
                nameKey="name"
                valueKey="count"
                valueLabel="People"
                theme={theme}
                emptyTitle="No headcount"
                emptyMessage="Department counts appear after employees are registered."
              />
            </Card>
            <Card title="Payroll cost by department">
              <CategoryChart
                data={withValues(data.payrollCostByDepartment, "gross")}
                nameKey="name"
                valueKey="gross"
                valueLabel="Gross"
                theme={theme}
                formatValue={formatRupees}
                emptyTitle="No payroll cost"
                emptyMessage="Cost appears after a payroll run creates payslips."
              />
            </Card>
            <Card title="Gender">
              <CategoryChart
                data={withValues(gender, "count")}
                nameKey="gender"
                valueKey="count"
                valueLabel="People"
                theme={theme}
                emptyTitle="No gender split"
                emptyMessage="This chart uses the people counted in headcount."
              />
            </Card>
            <Card title="Tenure">
              <CategoryChart
                data={withValues(data.tenureBuckets, "count")}
                nameKey="label"
                valueKey="count"
                valueLabel="People"
                theme={theme}
                emptyTitle="No tenure split"
                emptyMessage="Tenure is measured to the end date of the filter."
              />
            </Card>
          </div>
          <LatestAnnouncements />
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Recent audit</h2>
              <Button variant="ghost" to="/admin/audit">
                View all
              </Button>
            </div>
            <DataTable
              caption="Latest audit rows"
              columns={[
                { key: "action", header: "Action" },
                { key: "entity", header: "Entity" },
                { key: "actor", header: "Actor", render: (row) => row.actor?.name || "—" },
                { key: "timestamp", header: "When", render: (row) => formatDateTime(row.timestamp) },
              ]}
              rows={data.audit || []}
              total={(data.audit || []).length}
              loading={false}
              emptyTitle="No audit rows"
              emptyMessage="Creates, updates, approvals, and payroll locks are listed here."
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
