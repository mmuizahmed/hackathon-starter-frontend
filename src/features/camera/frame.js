// FaceRes descriptors are 1024 numbers. The API accepts 64 to 2048.
const MIN_LENGTH = 64;
const MAX_LENGTH = 2048;

// A few quiet frames before a blink counts, so motion is not read as closed eyes.
export const STABLE_FRAMES = 3;
const MOVE_LIMIT = 0.08;

export const STATUS = {
  loading: "Loading models",
  camera: "Starting camera",
  none: "No face",
  many: "More than one face",
  still: "Hold still",
  blink: "Please blink",
  blinked: "Blink detected ✓",
};

export const SAMPLE_MIN = 3;
export const SAMPLE_GOAL = 5;

export function emptyFrame() {
  return {
    faceCount: 0,
    box: null,
    stableFrames: 0,
    stable: false,
    eyesWereOpen: false,
    blinkDetected: false,
    descriptor: null,
    status: STATUS.none,
  };
}

export function asDescriptor(value) {
  if (!value || typeof value === "string" || typeof value.length !== "number") return null;
  const list = Array.from(value);
  if (list.length < MIN_LENGTH || list.length > MAX_LENGTH) return null;
  if (list.some((item) => typeof item !== "number" || !Number.isFinite(item))) return null;
  return list;
}

export function normalizeBox(box) {
  if (!box) return null;
  const values = Array.isArray(box) ? box : [box.x, box.y, box.width ?? box.w, box.height ?? box.h];
  if (values.length < 4 || values.some((item) => typeof item !== "number" || !Number.isFinite(item))) return null;
  const [x, y, width, height] = values;
  if (width <= 0 || height <= 0) return null;
  return { x, y, width, height };
}

function centerShift(previous, next) {
  const dx = Math.abs(previous.x + previous.width / 2 - (next.x + next.width / 2));
  const dy = Math.abs(previous.y + previous.height / 2 - (next.y + next.height / 2));
  const scale = Math.max(previous.width, previous.height, 1);
  return Math.max(dx, dy) / scale;
}

// Human reports a blink as both eyes closed. It only counts after a still, open frame.
export function nextFrameState(previous, observation) {
  const count = observation?.faceCount || 0;
  const box = count === 1 ? normalizeBox(observation.box) : null;
  let stableFrames = 0;
  if (box) {
    const still = previous.box && centerShift(previous.box, box) <= MOVE_LIMIT;
    stableFrames = still ? previous.stableFrames + 1 : 1;
  }
  const stable = stableFrames >= STABLE_FRAMES;

  const gestures = observation?.gestures || [];
  const closedLeft = gestures.includes("blink left eye");
  const closedRight = gestures.includes("blink right eye");
  let eyesWereOpen = previous.eyesWereOpen;
  let blinkDetected = previous.blinkDetected;

  if (count !== 1) {
    eyesWereOpen = false;
    blinkDetected = false;
  } else if (stable && closedLeft && closedRight && eyesWereOpen) {
    blinkDetected = true;
  } else if (stable && !closedLeft && !closedRight) {
    eyesWereOpen = true;
  }

  const descriptor = count === 1 ? asDescriptor(observation?.descriptor) : null;
  let status = STATUS.none;
  if (count > 1) status = STATUS.many;
  else if (count === 1 && blinkDetected) status = STATUS.blinked;
  else if (count === 1 && !stable) status = STATUS.still;
  else if (count === 1) status = STATUS.blink;

  return {
    faceCount: count,
    box,
    stableFrames,
    stable,
    eyesWereOpen,
    blinkDetected,
    descriptor,
    status,
  };
}
