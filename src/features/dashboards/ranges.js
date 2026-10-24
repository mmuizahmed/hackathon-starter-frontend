import { karachiToday } from "../../lib/format.js";

// Attrition on the admin board is year to date unless the person changes the range.
export function defaultAdminRange(today = karachiToday()) {
  return { from: `${today.slice(0, 4)}-01-01`, to: today, department: "" };
}

// HR looks at the current month. Today is the end so future days are not counted as absent.
export function defaultHrRange(today = karachiToday()) {
  return { from: `${today.slice(0, 7)}-01`, to: today, department: "" };
}

export function filtersToQuery(filters) {
  return {
    from: filters.from || undefined,
    to: filters.to || undefined,
    departmentId: filters.department || undefined,
  };
}

export function isYearToDate(filters) {
  if (!filters?.to || !filters?.from) return false;
  return filters.from === `${filters.to.slice(0, 4)}-01-01`;
}
