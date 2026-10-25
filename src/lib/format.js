// Dates in this product are Asia/Karachi calendar days. Format from the date
// parts, or from an ISO instant converted in that zone, so the browser zone
// cannot move a check-in to the previous evening.

export function todayInKarachi(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(now);
}

export function currentMonthInKarachi(now = new Date()) {
  return todayInKarachi(now).slice(0, 7);
}

export function formatDate(value) {
  if (!value) return "—";
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return String(value);
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatMonth(month) {
  if (!/^\d{4}-\d{2}$/.test(month || "")) return month || "—";
  const [year, monthNumber] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
}

export function formatDateRange(start, end) {
  if (!start) return "—";
  if (!end || start === end) return formatDate(start);
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function karachiParts(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const read = (type) => parts.find((part) => part.type === type)?.value || "";
  return {
    date: `${read("year")}-${read("month")}-${read("day")}`,
    time: `${read("hour")}:${read("minute")}`,
  };
}

export function formatTime(value) {
  if (!value) return "—";
  if (/^\d{2}:\d{2}$/.test(value)) return value;
  return karachiParts(value)?.time || "—";
}

// Show the next calendar day when a shift crosses midnight in Karachi.
export function formatClock(value, attendanceDate) {
  if (!value) return "—";
  if (/^\d{2}:\d{2}$/.test(value)) return value;
  const parts = karachiParts(value);
  if (!parts) return "—";
  if (attendanceDate && parts.date !== attendanceDate) {
    return `${parts.time} (${formatDate(parts.date)})`;
  }
  return parts.time;
}

export function hoursBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return null;
  const start = new Date(checkIn).getTime();
  const end = new Date(checkOut).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null;
  return Math.round(((end - start) / 3600000) * 100) / 100;
}

export function formatHours(hours) {
  if (hours == null || !Number.isFinite(Number(hours))) return "—";
  return `${Number(hours).toFixed(2)} h`;
}

export function formatMoney(value) {
  if (value == null || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return new Intl.NumberFormat("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}

export function formatDays(value) {
  if (value == null || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return Number.isInteger(number) ? String(number) : number.toFixed(2);
}

const SOURCE_LABELS = {
  web: "Web",
  camera: "Camera",
  correction: "Correction",
};

export function sourceLabel(source) {
  if (!source) return "—";
  return SOURCE_LABELS[source] || String(source);
}

export function formatPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return `${Number(value).toLocaleString("en-PK", { maximumFractionDigits: 2 })}%`;
}

// Payslip sentences include the currency word. The digits stay in formatMoney.
export function formatRupees(value) {
  const amount = formatMoney(value);
  return amount === "—" ? amount : `Rs ${amount}`;
}

export function formatDateTime(value) {
  if (!value) return "—";
  const parts = karachiParts(value);
  if (!parts) return "—";
  return `${formatDate(parts.date)}, ${parts.time}`;
}

export function titleCase(value) {
  const text = String(value || "").replaceAll("_", " ");
  if (!text) return "—";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Dashboard cards round to whole rupees. Payslips keep the paisa with formatRupees.
export function formatRupeesWhole(value) {
  if (value == null || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return `Rs ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(number)}`;
}

// Short axis labels such as 400K and 1.6M.
export function formatCompact(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return new Intl.NumberFormat("en-PK", { notation: "compact", maximumFractionDigits: 1 }).format(number);
}
