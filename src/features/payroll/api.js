import { api, apiBlob } from "../../lib/api";
import { collectPages, withQuery } from "../../lib/query";

function listEmployeesPage(query, options) {
  return api(withQuery("/employees", { limit: 100, ...query }), options);
}

export function listEmployeeDirectory(options) {
  return collectPages((page) => listEmployeesPage({ page }, options));
}

export function listSalaryStructures(query = {}, options) {
  return api(withQuery("/salary-structures", query), options);
}

export function saveSalaryStructure(employeeId, body, options) {
  return api(`/salary-structures/${employeeId}`, {
    method: "PUT",
    body,
    ...options,
  });
}

export function listPayrollRuns(query = {}, options) {
  return api(withQuery("/payroll/runs", { limit: 100, ...query }), options);
}

export function getPayrollRun(id, options) {
  return api(`/payroll/runs/${id}`, options);
}

export function getPayrollChecks(id, options) {
  return api(`/payroll/runs/${id}/checks`, options);
}

export function generatePayrollRun(month, options) {
  return api("/payroll/runs", {
    method: "POST",
    body: { month },
    ...options,
  });
}

export function finalizePayrollRun(id, body, options) {
  return api(`/payroll/runs/${id}/finalize`, {
    method: "POST",
    body,
    ...options,
  });
}

export function listPayslips(query = {}, options) {
  return api(withQuery("/payslips", query), options);
}

export function getPayslip(id, options) {
  return api(`/payslips/${id}`, options);
}

export async function downloadPayslipPdf(id) {
  const file = await apiBlob(`/payslips/${id}/pdf`);
  const url = URL.createObjectURL(file.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.filename || `payslip-${id}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
