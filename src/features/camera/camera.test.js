import assert from "node:assert/strict";
import test from "node:test";
import { SAMPLE_MIN, STABLE_FRAMES, STATUS, asDescriptor, emptyFrame, nextFrameState, normalizeBox } from "./frame.js";
import { accuracyWarning } from "./location.js";
import { cameraErrorMessage } from "./media.js";
import { attendanceActionError } from "../attendance/messages.js";
import { averageDescriptors, cameraAttendanceBody, formatMatchScore, readCameraResult } from "./payload.js";

const box = { x: 100, y: 80, width: 120, height: 160 };
const descriptor = Array.from({ length: 128 }, (_, index) => index / 10);

function still(extra = {}) {
  return { faceCount: 1, box, gestures: [], descriptor, ...extra };
}

function holdStill(state = emptyFrame()) {
  let next = state;
  for (let index = 0; index < STABLE_FRAMES; index += 1) next = nextFrameState(next, still());
  return next;
}

test("a face must stay still before the blink prompt", () => {
  let state = emptyFrame();
  state = nextFrameState(state, still());
  assert.equal(state.status, STATUS.still);
  state = holdStill();
  assert.equal(state.status, STATUS.blink);
  assert.equal(state.eyesWereOpen, true);
  assert.equal(state.blinkDetected, false);
});

test("a blink counts only after both eyes were open", () => {
  let state = holdStill();
  state = nextFrameState(state, still({ gestures: ["blink left eye"] }));
  assert.equal(state.blinkDetected, false);
  state = nextFrameState(state, still({ gestures: ["blink left eye", "blink right eye"] }));
  assert.equal(state.blinkDetected, true);
  assert.equal(state.status, STATUS.blinked);
});

test("a second face clears the blink", () => {
  let state = holdStill();
  state = nextFrameState(state, still({ gestures: ["blink left eye", "blink right eye"] }));
  state = nextFrameState(state, { faceCount: 2, box, gestures: [], descriptor });
  assert.equal(state.faceCount, 2);
  assert.equal(state.blinkDetected, false);
  assert.equal(state.status, STATUS.many);
  assert.equal(state.descriptor, null);
});

test("no face and a short descriptor are rejected", () => {
  const state = nextFrameState(holdStill(), { faceCount: 0 });
  assert.equal(state.status, STATUS.none);
  assert.equal(asDescriptor([1, 2, 3]), null);
  assert.equal(asDescriptor(descriptor)?.length, 128);
  assert.deepEqual(normalizeBox([10, 20, 30, 40]), { x: 10, y: 20, width: 30, height: 40 });
});

test("enrollment averages descriptors of the same length", () => {
  const first = [1, 3, 5, ...Array.from({ length: 125 }, () => 0)];
  const second = [3, 5, 7, ...Array.from({ length: 125 }, () => 0)];
  const averaged = averageDescriptors([first, second]);
  assert.equal(averaged.length, 128);
  assert.equal(averaged[0], 2);
  assert.equal(averaged[1], 4);
  assert.ok(SAMPLE_MIN >= 3);
  assert.equal(averageDescriptors([[1, 2]]), null);
});

test("camera attendance sends a signature and a blink, not a photo", () => {
  const body = cameraAttendanceBody({
    descriptor,
    lat: 24.86,
    lng: 67.01,
    accuracy: 18.4,
    faceCount: 1,
  });
  assert.equal(body.source, "camera");
  assert.deepEqual(body.liveness, { blink: true });
  assert.equal(body.faceCount, 1);
  assert.equal(body.descriptor, descriptor);
  assert.equal("image" in body, false);
  assert.equal("photo" in body, false);
});

test("the server match score and distance are read from the attendance row", () => {
  const reading = readCameraResult({
    status: "present",
    faceMatchScore: 0.82,
    location: { distanceMeters: 42.2 },
  });
  assert.equal(reading.status, "present");
  assert.equal(reading.faceMatchScore, 0.82);
  assert.equal(reading.distanceMeters, 42.2);
  assert.equal(formatMatchScore(0.82), "0.82");
  assert.equal(formatMatchScore(null), null);
});

test("camera failures keep the server sentence", () => {
  for (const message of [
    "Enroll your face first",
    "Blink check failed",
    "Face does not match the enrolled face",
    "Face descriptor is required",
    "Face descriptor length does not match the enrolled face",
    "GPS accuracy must be 100 meters or better",
    "You are outside the office area",
  ]) {
    assert.equal(attendanceActionError({ status: 422, message }, "in"), message);
    assert.equal(attendanceActionError({ status: 422, message }, "out"), message);
  }
});

test("accuracy above 100 meters warns, and the camera names permission problems", () => {
  assert.equal(accuracyWarning(80), "");
  assert.match(accuracyWarning(140), /100 m/);
  assert.match(cameraErrorMessage({ name: "NotAllowedError" }), /denied/i);
  assert.match(cameraErrorMessage({ name: "NotFoundError" }), /No camera/);
  assert.match(cameraErrorMessage({ code: "insecure" }), /secure page/);
});
