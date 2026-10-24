import { api } from "../../lib/api";
import { toQuery } from "../../lib/query";

export function listNotifications(params = {}, options) {
  return api(`/notifications${toQuery(params)}`, options);
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
