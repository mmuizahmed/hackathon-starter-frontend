// The brief's office defaults. A judge should be able to accept these and move on.
export const WEEK_DAYS = [
  { value: "Mon", label: "Mon" },
  { value: "Tue", label: "Tue" },
  { value: "Wed", label: "Wed" },
  { value: "Thu", label: "Thu" },
  { value: "Fri", label: "Fri" },
  { value: "Sat", label: "Sat" },
  { value: "Sun", label: "Sun" },
];

export const DEFAULT_OFFICE_SETTINGS = {
  officeStart: "09:00",
  graceMinutes: "15",
  halfDayHours: "5",
  weekend: ["Sat", "Sun"],
  officeLat: "",
  officeLng: "",
  radiusMeters: "150",
};

// `weekend` is an array of short day names ("Sat", "Sun"), as the API contract
// requires (docs/API.md in the backend: Sun, Mon, Tue, Wed, Thu, Fri, Sat).
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
