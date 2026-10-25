import { asDescriptor } from "./frame.js";

export const FACE_MODEL = "human-faceres";

// The server compares with human.match.similarity (order 2, multiplier 25).
// Keep the raw average. Normalizing it would change that distance.
export function averageDescriptors(rows) {
  const usable = [];
  for (const row of rows || []) {
    const descriptor = asDescriptor(row);
    if (!descriptor) continue;
    if (usable.length && descriptor.length !== usable[0].length) continue;
    usable.push(descriptor);
  }
  if (!usable.length) return null;
  const width = usable[0].length;
  const sum = new Array(width).fill(0);
  for (const row of usable) {
    for (let index = 0; index < width; index += 1) sum[index] += row[index];
  }
  const count = usable.length;
  return sum.map((value) => value / count);
}

// Numbers only. The camera image stays on this device.
export function cameraAttendanceBody({ descriptor, lat, lng, accuracy, faceCount = 1 }) {
  return {
    source: "camera",
    lat,
    lng,
    accuracy,
    faceCount,
    descriptor,
    liveness: { blink: true },
  };
}

function firstNumber(...values) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

export function readCameraResult(payload) {
  const record = payload || {};
  return {
    status: record.status || null,
    distanceMeters: firstNumber(record.location?.distanceMeters, record.distanceMeters),
    faceMatchScore: firstNumber(record.faceMatchScore),
    checkIn: record.checkIn || null,
    checkOut: record.checkOut || null,
  };
}

export function formatMatchScore(score) {
  if (typeof score !== "number" || !Number.isFinite(score)) return null;
  return score.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatMeters(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return `${Math.round(value)} m`;
}
