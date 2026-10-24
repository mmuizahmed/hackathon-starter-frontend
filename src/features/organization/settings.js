export function settingsToForm(settings) {
  return {
    companyName: settings?.companyName || "",
    officeStart: settings?.officeStart || "09:00",
    graceMinutes: String(settings?.graceMinutes ?? 15),
    halfDayHours: String(settings?.halfDayHours ?? 5),
    weekend: Array.isArray(settings?.weekend) && settings.weekend.length > 0 ? [...settings.weekend] : ["Sat", "Sun"],
    officeLat: settings?.officeLat == null ? "" : String(settings.officeLat),
    officeLng: settings?.officeLng == null ? "" : String(settings.officeLng),
    radiusMeters: String(settings?.radiusMeters ?? 150),
    latePenaltyEnabled: Boolean(settings?.latePenalty?.enabled),
    latesPerHalfDay: String(settings?.latePenalty?.latesPerHalfDay ?? 3),
  };
}

export function buildSettingsPayload(form) {
  const latBlank = form.officeLat === "";
  const lngBlank = form.officeLng === "";
  const payload = {
    companyName: form.companyName.trim(),
    officeStart: form.officeStart,
    graceMinutes: Number(form.graceMinutes),
    halfDayHours: Number(form.halfDayHours),
    weekend: form.weekend,
    radiusMeters: Number(form.radiusMeters),
    latePenalty: {
      enabled: Boolean(form.latePenaltyEnabled),
      latesPerHalfDay: Number(form.latesPerHalfDay),
    },
  };

  if (latBlank && lngBlank) {
    payload.officeLat = null;
    payload.officeLng = null;
  } else {
    payload.officeLat = Number(form.officeLat);
    payload.officeLng = Number(form.officeLng);
  }

  return payload;
}

export function validateSettingsForm(form) {
  const errors = {};
  if (!form.companyName.trim()) errors.companyName = "Enter the company name.";
  if (!form.officeStart) errors.officeStart = "Enter the office start time.";
  if (form.graceMinutes === "" || Number.isNaN(Number(form.graceMinutes))) {
    errors.graceMinutes = "Enter grace minutes.";
  }
  if (form.halfDayHours === "" || Number(form.halfDayHours) < 1) {
    errors.halfDayHours = "Enter half-day hours.";
  }
  if (!Array.isArray(form.weekend) || form.weekend.length === 0) {
    errors.weekend = "Choose at least one weekend day.";
  }
  const latBlank = form.officeLat === "";
  const lngBlank = form.officeLng === "";
  if (latBlank !== lngBlank) {
    errors.officeLat = "Enter both latitude and longitude, or leave both blank.";
  }
  if (form.radiusMeters === "" || Number(form.radiusMeters) <= 0) {
    errors.radiusMeters = "Enter the office radius in meters.";
  }
  if (form.latesPerHalfDay === "" || Number(form.latesPerHalfDay) < 1) {
    errors.latesPerHalfDay = "Enter how many lates make a half day.";
  }
  return errors;
}
