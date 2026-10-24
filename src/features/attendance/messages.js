// The contract names this 409. Show that sentence even if the body is empty.
export function attendanceActionError(error, action) {
  if (action === "in" && error?.status === 409) return "Already checked in today";
  return error?.message || "The request failed.";
}
