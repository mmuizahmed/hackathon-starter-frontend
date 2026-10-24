import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge, Button, Card, DataTable, EmptyState, ErrorState, FormAlert, Input, Select } from "../../../components/ui";
import { useToast } from "../../../context/ToastContext";
import { useAbortableRequest } from "../../../hooks/useAbortableRequest";
import { formatDate, formatMoney, todayInKarachi } from "../../../lib/format";
import { listEmployeeDirectory, listSalaryStructures, saveSalaryStructure } from "../api";
import { deriveSalary } from "../salaryMath";
import { SalaryPreview } from "./SalaryPreview";

const PAGE_SIZE = 20;

function employeeLabel(employee) {
  const suffix = employee.status && employee.status !== "active" ? ` · ${employee.status}` : "";
  return `${employee.name} (${employee.code})${suffix}`;
}

export function SalaryStructures({ canEdit = false }) {
  const toast = useToast();
  const [params] = useSearchParams();
  const [employeeId, setEmployeeId] = useState(params.get("employeeId") || "");
  const [page, setPage] = useState(1);
  const [basic, setBasic] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState(todayInKarachi());
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadDirectory = useCallback((signal) => listEmployeeDirectory({ signal }), []);
  const directory = useAbortableRequest(loadDirectory);

  const loadStructures = useCallback(
    (signal) => {
      if (!employeeId) return Promise.resolve(null);
      return listSalaryStructures({ employeeId, page, limit: PAGE_SIZE }, { signal });
    },
    [employeeId, page],
  );
  const structures = useAbortableRequest(loadStructures);

  const employees = directory.data || [];
  const options = employees.map((employee) => ({ value: employee.id, label: employeeLabel(employee) }));
  if (employeeId && !options.some((option) => option.value === employeeId)) {
    options.unshift({ value: employeeId, label: employeeId });
  }
  const historyItems = structures.data?.items || [];
  const historyMatches =
    historyItems.length === 0 || historyItems[0]?.employeeId === employeeId;
  const active = historyMatches ? historyItems.find((row) => row.active) || null : null;

  // Prefill from the active row once it loads. Page 2 of history must not wipe the form.
  useEffect(() => {
    if (!canEdit || !employeeId || page !== 1 || !structures.data || !historyMatches) return;
    setBasic(active ? String(active.basic) : "");
    setEffectiveFrom(todayInKarachi());
    setFieldErrors({});
    setFormError("");
  }, [canEdit, employeeId, page, structures.data, historyMatches, active]);

  const preview = deriveSalary(basic);

  function chooseEmployee(nextId) {
    setEmployeeId(nextId);
    setPage(1);
    setBasic("");
    setFieldErrors({});
    setFormError("");
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!canEdit || saving) return;
    const nextErrors = {};
    if (!employeeId) nextErrors.employeeId = "Choose an employee.";
    if (!preview) nextErrors.basic = "Enter a basic salary greater than 0.";
    if (!effectiveFrom) nextErrors.effectiveFrom = "Choose the date this pay starts.";
    setFieldErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await saveSalaryStructure(employeeId, {
        basic: preview.basic,
        effectiveFrom,
      });
      toast.success("Salary structure saved.");
      structures.reload();
    } catch (requestError) {
      const message = requestError.message || "Could not save the salary.";
      setFormError(message);
      if (requestError.errors) setFieldErrors(requestError.errors);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {directory.error ? (
        <ErrorState title="Could not load employees" message={directory.error} onRetry={directory.reload} />
      ) : (
        <div className="max-w-md">
          <Select
            name="employeeId"
            label="Employee"
            placeholder={directory.loading ? "Loading employees" : "Select an employee"}
            value={employeeId}
            options={options}
            error={fieldErrors.employeeId}
            disabled={directory.loading}
            onChange={(event) => chooseEmployee(event.target.value)}
          />
        </div>
      )}

      {!employeeId ? (
        <EmptyState title="Select an employee" message="Salary history loads after you choose someone." />
      ) : null}

      {employeeId && structures.error && !structures.loading ? (
        <ErrorState title="Could not load salary history" message={structures.error} onRetry={structures.reload} />
      ) : null}

      {employeeId && canEdit ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Structure">
            <form className="space-y-4" onSubmit={onSubmit}>
              <FormAlert message={formError} />
              <Input
                name="basic"
                label="Basic"
                type="number"
                min="1"
                step="0.01"
                inputMode="decimal"
                value={basic}
                error={fieldErrors.basic}
                hint="Allowances are calculated from this amount."
                onChange={(event) => setBasic(event.target.value)}
              />
              <Input
                name="effectiveFrom"
                label="Effective from"
                type="date"
                value={effectiveFrom}
                error={fieldErrors.effectiveFrom}
                hint="Payroll uses the structure that covers the last day of the month. A future date does not change an open draft."
                onChange={(event) => setEffectiveFrom(event.target.value)}
              />
              <Button type="submit" loading={saving} disabled={!employeeId}>
                Save structure
              </Button>
            </form>
          </Card>
          <Card title="Preview">
            <SalaryPreview salary={preview} />
          </Card>
        </div>
      ) : null}

      {employeeId && !canEdit && !structures.loading && !structures.error && !active ? (
        <EmptyState title="No salary structure" message="HR has not saved a structure for this employee." />
      ) : null}

      {employeeId && !canEdit && active ? (
        <Card title="Current structure">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Basic", active.basic],
              ["HRA", active.allowances?.hra],
              ["Medical", active.allowances?.medical],
              ["Gross", active.gross],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</dt>
                <dd className="mt-1 text-sm font-medium tabular-nums text-zinc-950 dark:text-zinc-50">
                  {formatMoney(value)}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-zinc-500">Effective {formatDate(active.effectiveFrom)}. Admin can view this. HR changes it.</p>
        </Card>
      ) : null}

      {employeeId ? (
        <DataTable
          caption="Salary history"
          columns={[
            { key: "effectiveFrom", header: "From", render: (row) => formatDate(row.effectiveFrom) },
            { key: "effectiveTo", header: "Until", render: (row) => (row.effectiveTo ? formatDate(row.effectiveTo) : "—") },
            { key: "basic", header: "Basic", align: "right", render: (row) => formatMoney(row.basic) },
            { key: "hra", header: "HRA", align: "right", render: (row) => formatMoney(row.allowances?.hra) },
            { key: "medical", header: "Medical", align: "right", render: (row) => formatMoney(row.allowances?.medical) },
            { key: "gross", header: "Gross", align: "right", render: (row) => formatMoney(row.gross) },
            {
              key: "active",
              header: "Status",
              render: (row) => (row.active ? <Badge tone="green">Active</Badge> : <Badge>Previous</Badge>),
            },
          ]}
          rows={structures.loading ? [] : structures.data?.items || []}
          page={structures.data?.page || page}
          limit={structures.data?.limit || PAGE_SIZE}
          total={structures.loading ? 0 : structures.data?.total || 0}
          onPageChange={setPage}
          loading={structures.loading}
          emptyTitle="No salary history"
          emptyMessage="Saving a structure keeps the older rows here."
        />
      ) : null}
    </div>
  );
}
