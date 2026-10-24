import { api } from "../../lib/api";
import { toQuery } from "../../lib/query";

export function checkIn(body = { source: "web" }, options) {
  return api("/attendance/check-in", { method: "POST", body, ...options });
}

export function checkOut(options) {
  return api("/attendance/check-out", { method: "POST", body: {}, ...options });
}

export function listAttendance(params = {}, options) {
  return api(`/attendance${toQuery(params)}`, options);
}

export function getAttendanceCalendar(params = {}, options) {
  return api(`/attendance/calendar${toQuery(params)}`, options);
}

export function listCorrections(params = {}, options) {
  return api(`/attendance/corrections${toQuery(params)}`, options);
}

export function requestCorrection(body, options) {
  return api("/attendance/corrections", { method: "POST", body, ...options });
}
