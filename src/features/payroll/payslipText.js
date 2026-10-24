import { formatRupees } from "../../lib/format.js";

const EARNING_LABELS = new Set(["Basic", "HRA", "Medical", "Other allowances"]);

export function splitPayslipLines(breakdown) {
  const lines = Array.isArray(breakdown?.lines) ? breakdown.lines : [];
  const earnings = [];
  const deductions = [];
  let tax = null;

  for (const line of lines) {
    if (/tax/i.test(line.label || "")) tax = line;
    else if (EARNING_LABELS.has(line.label)) earnings.push(line);
    else deductions.push(line);
  }

  return { earnings, deductions, tax };
}

function nounFor(label, days) {
  const lower = String(label || "").toLowerCase();
  let noun = "day";
  if (lower.includes("absent")) noun = "absent day";
  else if (lower.includes("unpaid")) noun = "unpaid day";
  else if (lower.includes("half")) noun = "half day";
  return days === 1 ? noun : `${noun}s`;
}

function trimNumber(value) {
  return Number.isInteger(value) ? String(value) : String(value);
}

// "2 absent days x Rs 6,818.18" is the shape the payslip view prints.
export function lineFormula(line) {
  if (!line) return "";
  if (line.days != null && line.perDay != null) {
    const days = Number(line.days);
    const factor = line.factor != null && Number(line.factor) !== 1 ? ` x ${line.factor}` : "";
    return `${trimNumber(days)} ${nounFor(line.label, days)}${factor} x ${formatRupees(line.perDay)}`;
  }
  if (line.formula) return String(line.formula);
  if (line.lates != null) {
    return `${line.lates} late arrivals, ${line.latesPerHalfDay} per half day`;
  }
  return "";
}

export function payslipShareText(slip) {
  const month = slip?.month || "this month";
  return [
    `Payslip for ${month}.`,
    `Net pay ${formatRupees(slip?.net)}.`,
    `Gross ${formatRupees(slip?.gross)}.`,
    `Deductions ${formatRupees(slip?.deductions)}.`,
    `Tax ${formatRupees(slip?.tax)}.`,
  ].join(" ");
}

export function whatsAppHref(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
