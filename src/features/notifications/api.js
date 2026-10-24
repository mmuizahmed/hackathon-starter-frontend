import { api } from "../../lib/api";
import { withQuery } from "../../lib/query";

export function listNotifications(query = {}, options) {
  return api(withQuery("/notifications", query), options);
}

export function getUnreadCount(options) {
  return api("/notifications/unread-count", options);
}

export function markNotificationRead(id, options) {
  return api(`/notifications/${id}/read`, { method: "POST", ...options });
}

export function markAllNotificationsRead(options) {
  return api("/notifications/read-all", { method: "POST", ...options });
}
