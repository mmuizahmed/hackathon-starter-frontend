import { api } from "../../lib/api";

export function sendChat(body, options) {
  return api("/ai/chat", { method: "POST", body, ...options });
}

export function summarizeDashboard(body, options) {
  return api("/ai/summary", { method: "POST", body, ...options });
}

export function parseSmartLeave(body, options) {
  return api("/ai/smart-leave", { method: "POST", body, ...options });
}

export function explainPayslip(body, options) {
  return api("/ai/explain-payslip", { method: "POST", body, ...options });
}
