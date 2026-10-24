import { api } from "../../lib/api";
import { withQuery } from "../../lib/query";

export function listAnnouncements(query = {}, options) {
  return api(withQuery("/announcements", query), options);
}
