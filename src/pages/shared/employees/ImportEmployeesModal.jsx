import { useState } from "react";
import { Button, DataTable, FormAlert, Modal } from "../../../components/ui";
import { EMPLOYEE_CSV_HEADER, importEmployees } from "../../../features/employees/api";
import { downloadText } from "../../../lib/download";
import { messageFrom } from "../../../lib/errors";

function credentialsCsv(rows) {
  const lines = ["row,email,temporaryPassword"];
  rows.forEach((row) => {
    lines.push(`${row.row},${row.email},${row.temporaryPassword}`);
  });
  return lines.join("\n");
}

export function ImportEmployeesModal({ open, onClose, onCommitted }) {
  const [fileName, setFileName] = useState("");
  const [csv, setCsv] = useState("");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [committing, setCommitting] = useState(false);

  function reset() {
    setFileName("");
    setCsv("");
    setReport(null);
    setError("");
  }

  function close() {
    if (checking || committing) return;
    reset();
    onClose();
  }

  function onFile(event) {
    const file = event.target.files?.[0];
    setReport(null);
    setError("");
    if (!file) {
      setFileName("");
      setCsv("");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setCsv(String(reader.result || ""));
    reader.onerror = () => setError("Could not read that file.");
    reader.readAsText(file);
  }

  async function onCheck() {
    if (!csv.trim()) {
      setError("Choose a CSV file first.");
      return;
    }
    setChecking(true);
    setError("");
    try {
      setReport(await importEmployees(csv, { dryRun: true }));
    } catch (err) {
      setError(messageFrom(err, "Could not check this file."));
    } finally {
      setChecking(false);
    }
  }

  async function onCommit() {
    setCommitting(true);
    setError("");
    try {
      const result = await importEmployees(csv, { dryRun: false });
      setReport(result);
      if (result?.ok) onCommitted();
    } catch (err) {
      setError(messageFrom(err, "Could not import these employees."));
    } finally {
      setCommitting(false);
    }
  }

  const errors = report?.errors || [];
  const passwords = report?.temporaryPasswords || [];
  const canCommit = Boolean(report?.ok && report?.dryRun && report.validRows > 0);

  return (
    <Modal
      open={open}
      title="Import employees"
      onClose={close}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={checking || committing}>Close</Button>
          <Button variant="secondary" onClick={onCheck} loading={checking} disabled={!csv || committing}>Check file</Button>
          <Button onClick={onCommit} loading={committing} disabled={!canCommit}>Commit</Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          Columns: code, name, email, phone, address, department, designation, join date, status, gender, basic salary.
          Department and designation are matched by name. Check the file before anyone is created.
        </p>
        <Button
          variant="ghost"
          className="h-8 px-2"
          onClick={() => downloadText("employees-template.csv", `${EMPLOYEE_CSV_HEADER}\n`)}
        >
          Download template
        </Button>
        <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="employee-csv">
          CSV file
          <input
            id="employee-csv"
            name="employeeCsv"
            type="file"
            accept=".csv,text/csv"
            className="mt-1 block w-full text-sm"
            onChange={onFile}
          />
        </label>
        {fileName ? <p className="text-sm text-zinc-500">{fileName}</p> : null}
        <FormAlert message={error} />
        {report ? (
          <p className="text-sm text-zinc-700 dark:text-zinc-200">
            {report.dryRun ? "Dry run." : "Committed."} {report.validRows} valid row{report.validRows === 1 ? "" : "s"}.
            {report.created != null ? ` ${report.created} created.` : ""}
          </p>
        ) : null}
        {errors.length > 0 ? (
          <DataTable
            columns={[
              { key: "row", header: "Row" },
              { key: "field", header: "Field" },
              { key: "reason", header: "Reason", wrap: true },
            ]}
            rows={errors.map((item, index) => ({ ...item, id: `${item.row}-${item.field}-${index}` }))}
            total={errors.length}
            caption="Import errors"
            emptyTitle="No errors"
          />
        ) : null}
        {passwords.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Temporary passwords are shown once. Download them before you close this dialog.
            </p>
            <Button variant="secondary" onClick={() => downloadText("employee-credentials.csv", credentialsCsv(passwords))}>
              Download credentials CSV
            </Button>
            <DataTable
              columns={[
                { key: "row", header: "Row" },
                { key: "email", header: "Email" },
                { key: "temporaryPassword", header: "Temporary password" },
              ]}
              rows={passwords.map((item) => ({ ...item, id: `${item.row}-${item.email}` }))}
              total={passwords.length}
              caption="Temporary passwords"
            />
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
