import { Badge } from "../../../components/ui";

const TONE = { active: "green", probation: "amber", exited: "neutral" };
const LABEL = { active: "Active", probation: "Probation", exited: "Exited" };

export function EmployeeStatus({ status }) {
  return <Badge tone={TONE[status] || "neutral"}>{LABEL[status] || status || "Unknown"}</Badge>;
}
