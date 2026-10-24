import { api } from "../../lib/api";
import { collectPages, withQuery } from "../../lib/query";

export function checkIn(body = { source: "web" }, options) {
  return api("/attendance/check-in", { method: "POST", body, ...options });
}

export function checkOut(options) {
  return api("/attendance/check-out", { method: "POST", body: {}, ...options });
}

export function getAttendanceBoard({ date, departmentId } = {}, options) {
  return api(withQuery("/attendance/board", { date, departmentId }), options);
}

export function getAttendanceCalendar({ month, employeeId } = {}, options) {
  return api(withQuery("/attendance/calendar", { month, employeeId }), options);
}

export function listAttendance(query = {}, options) {
  return api(withQuery("/attendance", query), options);
}

export function listCorrections(query = {}, options) {
  return api(withQuery("/attendance/corrections", query), options);
}

export function requestCorrection(body, options) {
  return api("/attendance/corrections", { method: "POST", body, ...options });
}

export function reviewCorrection(id, body, options) {
  return api(`/attendance/corrections/${id}/review`, {
    method: "POST",
    body,
    ...options,
  });
}

export function listDepartments(options) {
  return api(withQuery("/departments", { active: true, limit: 100 }), options);
}

function listEmployeesPage(query, options) {
  return api(withQuery("/employees", { limit: 100, ...query }), options);
}

// Correction rows only have an employee id. The inbox joins the directory for the name.
export function listEmployeeDirectory(options) {
  return collectPages((page) => listEmployeesPage({ page }, options));
}

// A correction stores the requested clock, not the attendance row already on file.
export async function listAttendanceForDates(dates, options) {
  const sorted = [...dates].filter(Boolean).sort();
  if (sorted.length === 0) return [];
  const from = sorted[0];
  const to = sorted[sorted.length - 1];
  return collectPages((page) => listAttendance({ from, to, page, limit: 100 }, options));
}
