// The brief's office defaults. A judge should be able to accept these and move on.
export const WEEK_DAYS = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

export const DEFAULT_OFFICE_SETTINGS = {
  officeStart: "09:00",
  graceMinutes: "15",
  halfDayHours: "5",
  weekend: ["saturday", "sunday"],
  officeLat: "",
  officeLng: "",
  radiusMeters: "150",
};

// `weekend` is an array of lowercase day names. The contract does not name the
// shape; this is the one we send. Change it here if the API expects another.
export function buildSetupPayload(form) {
  const settings = {
    officeStart: form.officeStart,
    graceMinutes: Number(form.graceMinutes),
    halfDayHours: Number(form.halfDayHours),
    weekend: form.weekend,
    radiusMeters: Number(form.radiusMeters),
  };

  if (form.officeLat !== "" && form.officeLng !== "") {
    settings.officeLat = Number(form.officeLat);
    settings.officeLng = Number(form.officeLng);
  }

  return {
    companyName: form.companyName.trim(),
    adminName: form.adminName.trim(),
    adminEmail: form.adminEmail.trim(),
    adminPassword: form.adminPassword,
    settings,
  };
}
