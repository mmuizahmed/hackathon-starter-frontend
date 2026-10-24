import { api, apiBlob } from "../../lib/api";
import { toQuery } from "../../lib/query";

export function listPayslips(params = {}, options) {
  return api(`/payslips${toQuery(params)}`, options);
}

export function getPayslip(id, options) {
  return api(`/payslips/${id}`, options);
}

// The PDF route returns bytes, not the JSON envelope.
export function downloadPayslipPdf(id, options) {
  return apiBlob(`/payslips/${id}/pdf`, options);
}
