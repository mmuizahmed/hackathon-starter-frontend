import { api } from "../../lib/api";
import { withQuery } from "../../lib/query";

export function getSettings(options) {
  return api("/settings", options);
}

export function updateSettings(body) {
  return api("/settings", { method: "PUT", body });
}

export function listDepartments(query = {}, options) {
  return api(withQuery("/departments", query), options);
}

// One extra page covers a company larger than the default page size.
export async function listDepartmentOptions(options) {
  const first = await listDepartments({ page: 1, limit: 100, active: true }, options);
  const items = [...(first?.items || [])];
  if ((first?.total || 0) > items.length) {
    const second = await listDepartments({ page: 2, limit: 100, active: true }, options);
    items.push(...(second?.items || []));
  }
  return items
    .filter((row) => row.active !== false)
    .map((row) => ({ value: row.id, label: row.name }));
}

export function createDepartment(name) {
  return api("/departments", { method: "POST", body: { name } });
}

export function updateDepartment(id, body) {
  return api(`/departments/${id}`, { method: "PATCH", body });
}

export function deleteDepartment(id) {
  return api(`/departments/${id}`, { method: "DELETE" });
}

export function listDesignations(query = {}, options) {
  return api(withQuery("/designations", query), options);
}

export function createDesignation(name) {
  return api("/designations", { method: "POST", body: { name } });
}

export function updateDesignation(id, body) {
  return api(`/designations/${id}`, { method: "PATCH", body });
}

export function deleteDesignation(id) {
  return api(`/designations/${id}`, { method: "DELETE" });
}

export function listLeaveTypes(query = {}, options) {
  return api(withQuery("/leave-types", query), options);
}

export function updateLeaveType(id, body) {
  return api(`/leave-types/${id}`, { method: "PATCH", body });
}

export function listHolidays(query = {}, options) {
  return api(withQuery("/holidays", query), options);
}

export function createHoliday(body) {
  return api("/holidays", { method: "POST", body });
}

export function updateHoliday(id, body) {
  return api(`/holidays/${id}`, { method: "PATCH", body });
}

export function deleteHoliday(id) {
  return api(`/holidays/${id}`, { method: "DELETE" });
}
