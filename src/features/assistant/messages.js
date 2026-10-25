export const SUGGESTED_QUESTIONS = {
  admin: [
    "What is the company headcount?",
    "What is the payroll cost this month?",
    "What is the attrition rate this year?",
  ],
  hr: [
    "How many active employees are in Engineering?",
    "Who came late most often this month?",
    "What is this month's attendance rate?",
  ],
  employee: ["How many sick leaves do I have left?", "Kitni annual chutti bachi hai?"],
};

// 429 is a hard stop. A 200 with fallback is the timeout or missing-key path.
export function assistantProblem(error, data) {
  if (error?.status === 429) return "Too many AI requests. Try again in an hour.";
  if (data?.fallback) {
    return data.answer || data.message || data.explanation || "The assistant is not configured yet.";
  }
  if (error?.code === "unreachable") return "I could not reach the assistant. Please try again in a moment.";
  if (error) return error.message || "I could not reach the assistant. Please try again in a moment.";
  return "";
}

const TOOL_LABELS = {
  get_headcount: "Headcount",
  get_attendance_summary: "Attendance",
  get_late_comers: "Late arrivals",
  get_leave_summary: "Leave summary",
  get_my_leave_balance: "Your leave balance",
  get_payroll_summary: "Payroll",
  search_employees: "Employee search",
};

// Unknown tools still read as words, not snake_case.
export function toolLabel(tool) {
  if (!tool) return "";
  if (TOOL_LABELS[tool]) return TOOL_LABELS[tool];
  const words = String(tool).replace(/^get_/, "").replaceAll("_", " ").trim();
  if (!words) return "";
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function basedOnText(sources) {
  const labels = [];
  for (const source of sources || []) {
    const label = toolLabel(source?.tool);
    if (label && !labels.includes(label)) labels.push(label);
  }
  if (labels.length === 0) return "";
  return `Based on: ${labels.join(", ")}`;
}

// Nothing is saved from this. The person still submits the normal leave form.
export function smartLeaveDraft(data) {
  if (!data || data.fallback) return null;
  const code = data.leaveTypeCode || data.type;
  const startDate = data.startDate || data.start;
  const endDate = data.endDate || data.end;
  if (!code || !startDate || !endDate) return null;
  return { code, startDate, endDate, reason: data.reason || "" };
}
