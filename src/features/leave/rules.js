import { addDays, weekdayIndex } from "../../lib/format.js";

// Sat and Sun only. Public holidays are skipped by the server, and an employee
// cannot read the holiday list, so this number is a preview, not the saved days.
export function countWeekdays(start, end) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start || "") || !/^\d{4}-\d{2}-\d{2}$/.test(end || "")) return 0;
  if (end < start) return 0;

  let count = 0;
  let cursor = start;
  for (let guard = 0; guard < 400 && cursor <= end; guard += 1) {
    const day = weekdayIndex(cursor);
    if (day !== 0 && day !== 6) count += 1;
    cursor = addDays(cursor, 1);
  }
  return count;
}

// Pending can be cancelled. Approved can be cancelled only before it starts.
export function canCancelLeave(request, today) {
  if (!request) return false;
  if (request.status === "pending") return true;
  return request.status === "approved" && request.startDate > today;
}
