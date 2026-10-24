import { formatDays, formatMoney } from "../../lib/format.js";

export function describeLine(line) {
  if (!line) return "";
  const parts = [];
  if (line.days != null) parts.push(`${formatDays(line.days)} ${Number(line.days) === 1 ? "day" : "days"}`);
  if (line.factor != null) parts.push(`× ${line.factor}`);
  if (line.perDay != null) parts.push(`per day ${formatMoney(line.perDay)}`);
  if (line.lates != null) {
    parts.push(`${formatDays(line.lates)} late ${Number(line.lates) === 1 ? "arrival" : "arrivals"}`);
  }
  if (line.label === "Late penalty" && line.latesPerHalfDay != null) {
    parts.push(`${formatDays(line.latesPerHalfDay)} lates per half day`);
  }
  if (line.label === "Late penalty" && line.halfDays != null) {
    parts.push(`${formatDays(line.halfDays)} half ${Number(line.halfDays) === 1 ? "day" : "days"}`);
  }
  if (line.enabled === false) parts.push("rule is off");
  if (line.formula) parts.push(line.formula);
  if (line.slabLabel) parts.push(line.slabLabel);
  return parts.join(" · ");
}
