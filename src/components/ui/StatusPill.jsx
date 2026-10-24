import { Badge } from "./Badge";

const STATUS = {
  present: { label: "Present", tone: "green" },
  late: { label: "Late", tone: "amber" },
  half_day: { label: "Half day", tone: "orange" },
  absent: { label: "Absent", tone: "red" },
  on_leave: { label: "On leave", tone: "blue" },
  missing_checkout: { label: "Missing checkout", tone: "yellow" },
  pending: { label: "Pending", tone: "amber" },
  approved: { label: "Approved", tone: "green" },
  rejected: { label: "Rejected", tone: "red" },
};

export function StatusPill({ status }) {
  const item = STATUS[status] || { label: status ? String(status) : "Unknown", tone: "neutral" };
  return <Badge tone={item.tone}>{item.label}</Badge>;
}
