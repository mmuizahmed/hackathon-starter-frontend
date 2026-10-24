import { formatDate, formatDateRange, formatDays } from "../../lib/format.js";

// The inbox shows the balance the way a reviewer says it: "Casual 10 -> 8".
export function balanceText(row) {
  const name = row?.leaveType?.name || "Leave";
  const balance = row?.context?.balance;
  if (!balance) return "—";
  if (balance.before == null && balance.after == null) return `${name} has no yearly cap`;
  return `${name} ${formatDays(balance.before)} -> ${formatDays(balance.after)}`;
}

export function holidayText(holidays) {
  if (!holidays || holidays.length === 0) return "None in this range";
  return holidays
    .map((holiday) => {
      const tentative = holiday.tentative ? " (tentative)" : "";
      return `${formatDate(holiday.date)} ${holiday.name}${tentative}`;
    })
    .join("; ");
}

export function colleagueText(colleagues) {
  if (!colleagues || colleagues.length === 0) return "None in this department";
  return colleagues
    .map((person) => {
      const code = person.code ? ` (${person.code})` : "";
      return `${person.name || "Colleague"}${code} · ${formatDateRange(person.startDate, person.endDate)}`;
    })
    .join("; ");
}

export function yearLeaveText(rows) {
  if (!rows || rows.length === 0) return "No approved leave this year";
  return rows
    .map((row) => `${row.code || "Leave"} · ${formatDateRange(row.startDate, row.endDate)} · ${formatDays(row.days)}d`)
    .join("; ");
}
