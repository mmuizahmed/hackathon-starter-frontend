export const ACCURACY_WARN_METERS = 100;

const GEO_ERRORS = {
  1: "Location permission was denied.",
  2: "Location is unavailable on this device.",
  3: "Location timed out. Move near a window and try again.",
};

export function accuracyWarning(meters) {
  if (typeof meters !== "number" || !Number.isFinite(meters) || meters <= ACCURACY_WARN_METERS) return "";
  return "Accuracy is wider than 100 m. The server decides whether to accept it.";
}

export function readPrecisePosition({ timeout = 15000 } = {}) {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.isSecureContext === false) {
      reject(new Error("Location needs a secure page (https or localhost)."));
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("This browser does not provide location."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => reject(new Error(GEO_ERRORS[error?.code] || "Location could not be read.")),
      { enableHighAccuracy: true, timeout, maximumAge: 0 },
    );
  });
}
