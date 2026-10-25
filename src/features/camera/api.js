import { api } from "../../lib/api";
import { FACE_MODEL } from "./payload";

export function getMyFace(options) {
  return api("/face/me", options);
}

export function enrollFace(descriptor, options) {
  return api("/face/enroll", {
    method: "POST",
    body: { descriptor, model: FACE_MODEL },
    ...options,
  });
}

export function resetFace(employeeId, options) {
  return api(`/face/${employeeId}`, { method: "DELETE", ...options });
}
