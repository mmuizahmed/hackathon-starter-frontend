import { api } from "../../lib/api";
import { toQuery } from "../../lib/query";

export function listAnnouncements(params = {}, options) {
  return api(`/announcements${toQuery(params)}`, options);
}
