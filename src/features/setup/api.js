import { api } from "../../lib/api";

export function getSetupStatus(options) {
  return api("/setup/status", options);
}

export function completeSetup(body) {
  return api("/setup", { method: "POST", body });
}
