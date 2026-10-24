const KARACHI = "Asia/Karachi";

// en-CA is the locale that prints YYYY-MM-DD. The time zone is still Karachi.
export function karachiToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: KARACHI,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function karachiMonth(now = new Date()) {
  return karachiToday(now).slice(0, 7);
}

export function formatRupees(value) {
  if (value == null || value === "" || Number.isNaN(Number(value))) return "—";
  const formatted = Number(value).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `Rs ${formatted}`;
}

export function formatPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return `${Number(value).toLocaleString("en-PK", { maximumFractionDigits: 2 })}%`;
}

export function formatHours(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return `${Number(value).toLocaleString("en-PK", { maximumFractionDigits: 2 })} h`;
}

function calendarDate(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDay(value) {
  if (!value) return "—";
  const date = calendarDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-PK", {
    timeZone: KARACHI,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-PK", {
    timeZone: KARACHI,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-PK", {
    timeZone: KARACHI,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function weekdayIndex(dateStr) {
  const [year, month, day] = String(dateStr).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function addDays(dateStr, days) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

export function shiftMonth(month, delta) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  const nextYear = date.getUTCFullYear();
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${nextYear}-${nextMonth}`;
}

export function monthLabel(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-PK", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
}

export function titleCase(value) {
  const text = String(value || "").replaceAll("_", " ");
  if (!text) return "—";
  return text.charAt(0).toUpperCase() + text.slice(1);
}
