import { useEffect, useState } from "react";
import { Button, DatePicker, FormAlert, Input, Modal, Select, Textarea } from "../../../components/ui";
import { createEmployee, updateEmployee } from "../../../features/employees/api";
import {
  EMPTY_EMPLOYEE_FORM,
  GENDER_OPTIONS,
  STATUS_OPTIONS,
  buildEmployeePayload,
  employeeToForm,
  validateEmployeeForm,
} from "../../../features/employees/form";
import { ApiError } from "../../../lib/api";
import { fieldMessage, messageFrom } from "../../../lib/errors";

function withCurrent(rows, current) {
  const options = (rows || [])
    .filter((row) => row.active !== false || row.id === current?.id)
    .map((row) => ({
      value: row.id,
      label: row.active === false ? `${row.name} (inactive)` : row.name,
    }));
  if (current?.id && !options.some((option) => option.value === current.id)) {
    options.unshift({ value: current.id, label: current.name || "Current" });
  }
  return options;
}

export function EmployeeFormModal({ open, employee, departments, designations, onClose, onSaved }) {
  const editing = Boolean(employee);
  const [form, setForm] = useState(EMPTY_EMPLOYEE_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(employee ? employeeToForm(employee) : EMPTY_EMPLOYEE_FORM);
    setErrors({});
    setFormError("");
  }, [open, employee]);

  function onChange(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const nextErrors = validateEmployeeForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSaving(true);
    setFormError("");
    try {
      const payload = buildEmployeePayload(form);
      if (!editing && payload.status === "exited") payload.status = "active";
      const result = editing ? await updateEmployee(employee.id, payload) : await createEmployee(payload);
      onSaved(result, { editing, email: payload.email });
    } catch (error) {
      const fieldErrors = error instanceof ApiError ? error.errors : null;
      if (fieldErrors) {
        setErrors({
          code: fieldMessage(fieldErrors, "code"),
          name: fieldMessage(fieldErrors, "name"),
          email: fieldMessage(fieldErrors, "email"),
          departmentId: fieldMessage(fieldErrors, "departmentId"),
          designationId: fieldMessage(fieldErrors, "designationId"),
          joinDate: fieldMessage(fieldErrors, "joinDate"),
          basicSalary: fieldMessage(fieldErrors, "basicSalary"),
          status: fieldMessage(fieldErrors, "status"),
        });
      }
      setFormError(messageFrom(error, "Could not save this employee."));
    } finally {
      setSaving(false);
    }
  }

  const statusOptions = employee?.status === "exited"
    ? STATUS_OPTIONS
    : STATUS_OPTIONS.filter((option) => option.value !== "exited");

  return (
    <Modal
      open={open}
      title={editing ? "Edit employee" : "Register employee"}
      onClose={() => (saving ? undefined : onClose())}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" form="employee-form" loading={saving}>{editing ? "Save" : "Register"}</Button>
        </>
      }
    >
      <form id="employee-form" className="space-y-3" onSubmit={onSubmit}>
        <FormAlert message={formError} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input name="code" label="Employee code" value={form.code} error={errors.code} required onChange={(event) => onChange("code", event.target.value)} />
          <Input name="name" label="Name" value={form.name} error={errors.name} required onChange={(event) => onChange("name", event.target.value)} />
          <Input name="email" type="email" label="Email" value={form.email} error={errors.email} required onChange={(event) => onChange("email", event.target.value)} />
          <Input name="phone" label="Phone" value={form.phone} onChange={(event) => onChange("phone", event.target.value)} />
        </div>
        <Textarea name="address" label="Address" rows={2} value={form.address} onChange={(event) => onChange("address", event.target.value)} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            name="departmentId"
            label="Department"
            placeholder="Choose"
            value={form.departmentId}
            error={errors.departmentId}
            options={withCurrent(departments, employee?.department)}
            required
            onChange={(event) => onChange("departmentId", event.target.value)}
          />
          <Select
            name="designationId"
            label="Designation"
            placeholder="Choose"
            value={form.designationId}
            error={errors.designationId}
            options={withCurrent(designations, employee?.designation)}
            required
            onChange={(event) => onChange("designationId", event.target.value)}
          />
          <DatePicker name="joinDate" label="Join date" value={form.joinDate} error={errors.joinDate} required onChange={(event) => onChange("joinDate", event.target.value)} />
          <Select name="status" label="Status" value={form.status} options={statusOptions} onChange={(event) => onChange("status", event.target.value)} />
          <Select name="gender" label="Gender" value={form.gender} options={GENDER_OPTIONS} onChange={(event) => onChange("gender", event.target.value)} />
          <Input
            name="basicSalary"
            type="number"
            label="Basic salary"
            min="1"
            step="1"
            value={form.basicSalary}
            error={errors.basicSalary}
            required
            onChange={(event) => onChange("basicSalary", event.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
