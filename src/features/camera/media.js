export function cameraErrorMessage(error) {
  const name = error?.name || "";
  if (error?.code === "insecure" || name === "SecurityError") {
    return "The camera needs a secure page. Use https, or localhost.";
  }
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Camera permission was denied. Allow the camera and try again.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No camera was found on this device.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "The camera is already in use by another app.";
  }
  return "The camera could not be started.";
}

export async function openUserCamera() {
  if (typeof window !== "undefined" && window.isSecureContext === false) {
    const error = new Error("insecure");
    error.code = "insecure";
    throw error;
  }
  const media = typeof navigator !== "undefined" ? navigator.mediaDevices : null;
  if (!media?.getUserMedia) {
    const error = new Error("insecure");
    error.code = "insecure";
    throw error;
  }

  // `ideal` prefers the front camera and still works when a laptop has only one.
  const video = {
    facingMode: { ideal: "user" },
    width: { ideal: 640 },
    height: { ideal: 480 },
  };
  return media.getUserMedia({ audio: false, video });
}

export function stopStream(stream) {
  stream?.getTracks?.().forEach((track) => track.stop());
}
