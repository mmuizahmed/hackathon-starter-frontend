import { api, apiBlob } from "../../lib/api";
import { withQuery } from "../../lib/query";

export const EMPLOYEE_CSV_HEADER =
  "code,name,email,phone,address,department,designation,joinDate,status,gender,basicSalary";

export const PAGE_LIMIT = 20;

export function listEmployees(query = {}, options) {
  return api(withQuery("/employees", { limit: PAGE_LIMIT, ...query }), options);
}

export function getEmployee(id, options) {
  return api(`/employees/${id}`, options);
}

export function createEmployee(body) {
  return api("/employees", { method: "POST", body });
}

export function updateEmployee(id, body, options) {
  return api(`/employees/${id}`, { method: "PATCH", body, ...options });
}

export function importEmployees(csv, { dryRun = true } = {}) {
  return api(withQuery("/employees/import", dryRun ? {} : { dryRun: "false" }), {
    method: "POST",
    body: { csv },
  });
}

export function exportEmployeesCsv(query = {}) {
  return apiBlob(withQuery("/employees/export", query), {
    headers: { Accept: "text/csv, application/json" },
  });
}
