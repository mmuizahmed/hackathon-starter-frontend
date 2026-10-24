import { api } from "../../lib/api";
import { withQuery } from "../../lib/query";

export function listAudit(query = {}, options) {
  return api(withQuery("/audit", { limit: 20, ...query }), options);
}
