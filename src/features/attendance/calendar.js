// The grid is built from the year and month numbers. Using the browser's local
// midnight would shift the first weekday for anyone outside Asia/Karachi.
export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const STATUS_LABELS = {
  present: "Present",
  late: "Late",
  half_day: "Half day",
  absent: "Absent",
  on_leave: "On leave",
  missing_checkout: "Missing checkout",
};

export function daysInMonth(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
}

export function monthStartWeekday(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
}

export function calendarCells(month) {
  if (!/^\d{4}-\d{2}$/.test(month || "")) return [];
  const count = daysInMonth(month);
  const cells = Array.from({ length: monthStartWeekday(month) }, () => null);
  for (let day = 1; day <= count; day += 1) {
    cells.push(`${month}-${String(day).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function shiftMonth(month, delta) {
  const [year, monthNumber] = month.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  const nextMonth = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  return `${shifted.getUTCFullYear()}-${nextMonth}`;
}

export function indexDays(days) {
  const map = new Map();
  for (const day of days || []) {
    if (day?.date) map.set(day.date, day);
  }
  return map;
}

export const BOARD_STATUSES = [
  { status: "present", label: "Present" },
  { status: "late", label: "Late" },
  { status: "half_day", label: "Half day" },
  { status: "absent", label: "Absent" },
  { status: "on_leave", label: "On leave" },
  { status: "missing_checkout", label: "Missing checkout" },
];

export function countByStatus(items) {
  const counts = {};
  for (const item of BOARD_STATUSES) counts[item.status] = 0;
  for (const row of items || []) {
    if (counts[row.status] != null) counts[row.status] += 1;
  }
  return counts;
}
