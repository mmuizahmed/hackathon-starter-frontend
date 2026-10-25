import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TemporaryPasswordDialog } from "../../../components/people/TemporaryPasswordDialog";
import { Button, ConfirmDialog, DataTable, Input, PageHeader, Select } from "../../../components/ui";
import { useToast } from "../../../context/ToastContext";
import { exportEmployeesCsv, listEmployees, updateEmployee } from "../../../features/employees/api";
import { listDepartments, listDesignations } from "../../../features/organization/api";
import { usePagedResource } from "../../../hooks/usePagedResource";
import { downloadBlob } from "../../../lib/download";
import { messageFrom } from "../../../lib/errors";
import { formatDate, formatMoney } from "../../../lib/format";
import { EmployeeFormModal } from "./EmployeeFormModal";
import { ImportEmployeesModal } from "./ImportEmployeesModal";
import { EmployeeStatus } from "./EmployeeStatus";

const EMPTY_FILTERS = { search: "", departmentId: "", designationId: "", status: "" };

function catalogOptions(rows, placeholder) {
  return [
    { value: "", label: placeholder },
    ...(rows || []).map((row) => ({ value: row.id, label: row.name })),
  ];
}

export function EmployeeDirectory({ mode, detailBase }) {
  const manage = mode === "manage";
  const toast = useToast();
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [issued, setIssued] = useState(null);
  const [exiting, setExiting] = useState(null);
  const [exitWorking, setExitWorking] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(
    (page, signal) => listEmployees({ ...filters, page }, { signal }),
    [filters],
  );
  const list = usePagedResource(load);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      listDepartments({ active: "true", limit: 100 }, { signal: controller.signal }),
      listDesignations({ active: "true", limit: 100 }, { signal: controller.signal }),
    ])
      .then(([departmentPage, designationPage]) => {
        setDepartments(departmentPage?.items || []);
        setDesignations(designationPage?.items || []);
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        toast.error(messageFrom(error, "Could not load departments."));
      });
    return () => controller.abort();
  }, [toast]);

  function applyFilters(event) {
    event.preventDefault();
    setFilters({ ...draft, search: draft.search.trim() });
    list.setPage(1);
  }

  function clearFilters() {
    setDraft(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    list.setPage(1);
  }

  async function onExport() {
    setExporting(true);
    try {
      const file = await exportEmployeesCsv(filters);
      downloadBlob(file.filename || "employees.csv", file.blob);
    } catch (error) {
      toast.error(messageFrom(error, "Could not export employees."));
    } finally {
      setExporting(false);
    }
  }

  function onSaved(result, meta) {
    setFormOpen(false);
    setEditing(null);
    list.refresh();
    if (!meta.editing) {
      setIssued({
        email: result?.employee?.email || meta.email,
        password: result?.temporaryPassword || "",
      });
      return;
    }
    toast.success("Employee updated.");
  }

  async function onExit() {
    if (!exiting) return;
    setExitWorking(true);
    try {
      await updateEmployee(exiting.id, { status: "exited" });
      setExiting(null);
      list.refresh();
      toast.success(`${exiting.name} marked as exited.`);
    } catch (error) {
      toast.error(messageFrom(error, "Could not update this employee."));
    } finally {
      setExitWorking(false);
    }
  }

  const columns = [
    {
      key: "name",
      header: "Employee",
      render: (row) => (
        <div>
          <Link className="font-medium text-brand-700 hover:underline dark:text-brand-200" to={`${detailBase}/${row.id}`}>
            {row.name}
          </Link>
          <p className="text-xs font-normal text-zinc-500 dark:text-zinc-400">{row.code}</p>
        </div>
      ),
    },
    { key: "email", header: "Email" },
    { key: "department", header: "Department", render: (row) => row.department?.name || "—" },
    { key: "designation", header: "Designation", render: (row) => row.designation?.name || "—" },
    { key: "status", header: "Status", render: (row) => <EmployeeStatus status={row.status} /> },
    { key: "joinDate", header: "Joined", render: (row) => formatDate(row.joinDate) },
    { key: "salary", header: "Basic", align: "right", render: (row) => formatMoney(row.salary?.basic) },
  ];

  if (manage) {
    columns.push({
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="ghost" className="h-8 px-2" onClick={() => { setEditing(row); setFormOpen(true); }}>
            Edit
          </Button>
          {row.status === "exited" ? null : (
            <Button variant="ghost" className="h-8 px-2" onClick={() => setExiting(row)}>
              Exit
            </Button>
          )}
        </div>
      ),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description={manage ? "Register people, update job details, and import a CSV." : "Directory of everyone in the company."}
        actions={
          manage ? (
            <>
              <Button variant="secondary" onClick={onExport} loading={exporting}>Export CSV</Button>
              <Button variant="secondary" onClick={() => setImportOpen(true)}>Import CSV</Button>
              <Button onClick={() => { setEditing(null); setFormOpen(true); }}>Register employee</Button>
            </>
          ) : null
        }
      />
      <form className="grid grid-cols-2 gap-3 lg:grid-cols-5" onSubmit={applyFilters}>
        <div className="col-span-2 lg:col-span-1">
          <Input
            name="search"
            label="Search"
            placeholder="Name, code, or email"
            value={draft.search}
            onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))}
          />
        </div>
        <Select
          name="departmentId"
          label="Department"
          value={draft.departmentId}
          options={catalogOptions(departments, "All departments")}
          onChange={(event) => setDraft((current) => ({ ...current, departmentId: event.target.value }))}
        />
        <Select
          name="designationId"
          label="Designation"
          value={draft.designationId}
          options={catalogOptions(designations, "All designations")}
          onChange={(event) => setDraft((current) => ({ ...current, designationId: event.target.value }))}
        />
        <Select
          name="status"
          label="Status"
          value={draft.status}
          options={[{ value: "", label: "All statuses" }, { value: "active", label: "Active" }, { value: "probation", label: "Probation" }, { value: "exited", label: "Exited" }]}
          onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}
        />
        <div className="flex items-end gap-2">
          <Button type="submit" className="flex-1 lg:flex-none">Apply</Button>
          <Button type="button" variant="secondary" className="flex-1 lg:flex-none" onClick={clearFilters}>Clear</Button>
        </div>
      </form>
      <DataTable
        columns={columns}
        rows={list.items}
        loading={list.loading}
        error={list.error}
        onRetry={list.refresh}
        page={list.page}
        limit={list.limit}
        total={list.total}
        onPageChange={list.setPage}
        caption="Employees"
        emptyTitle="No employees"
        emptyMessage={manage ? "Register the first employee, or import a CSV." : "Employees appear here after HR registers them."}
      />
      {manage ? (
        <>
          <EmployeeFormModal
            open={formOpen}
            employee={editing}
            departments={departments}
            designations={designations}
            onClose={() => { setFormOpen(false); setEditing(null); }}
            onSaved={onSaved}
          />
          <ImportEmployeesModal open={importOpen} onClose={() => setImportOpen(false)} onCommitted={() => { list.setPage(1); list.refresh(); }} />
          <TemporaryPasswordDialog
            open={Boolean(issued)}
            email={issued?.email}
            password={issued?.password}
            onClose={() => setIssued(null)}
          />
          <ConfirmDialog
            open={Boolean(exiting)}
            title={`Mark ${exiting?.name || "employee"} as exited?`}
            message="Their login is deactivated. You can set them back to active later by editing the record."
            confirmLabel="Mark exited"
            tone="danger"
            loading={exitWorking}
            onConfirm={onExit}
            onCancel={() => setExiting(null)}
          />
        </>
      ) : null}
    </div>
  );
}
