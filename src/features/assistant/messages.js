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

// Nothing is saved from this. The person still submits the normal leave form.
export function smartLeaveDraft(data) {
  if (!data || data.fallback) return null;
  const code = data.leaveTypeCode || data.type;
  const startDate = data.startDate || data.start;
  const endDate = data.endDate || data.end;
  if (!code || !startDate || !endDate) return null;
  return { code, startDate, endDate, reason: data.reason || "" };
}
