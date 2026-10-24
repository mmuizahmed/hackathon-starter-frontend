const DENIED =
  "Location was blocked. Enter the latitude and longitude, or leave them blank and set them later in Company Settings.";

export function readCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("This browser does not provide location. Type the coordinates, or leave them blank."));
      return;
    }

    // A precise GPS fix can stall the form. A normal fix is enough for the office radius,
    // and a position from the last minute is reused so the button returns quickly.
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        });
      },
      () => reject(new Error(DENIED)),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  });
}
