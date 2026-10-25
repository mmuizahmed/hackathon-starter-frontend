import Human from "@vladmandic/human";
import { normalizeBox } from "./frame.js";

const MODEL_NAMES = ["blazeface", "facemesh", "iris", "faceres"];

// Detector, mesh, iris, and FaceRes. Emotion, body, hand, and object stay off.
// Gesture stays on: a blink is read from the mesh, and it has no extra model.
const FACE_CONFIG = {
  debug: false,
  warmup: "none",
  cacheModels: true,
  cacheSensitivity: 0,
  skipAllowed: false,
  filter: { enabled: false },
  gesture: { enabled: true },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
  segmentation: { enabled: false },
  face: {
    enabled: true,
    detector: {
      rotation: true,
      maxDetected: 5,
      skipFrames: 0,
      skipTime: 0,
      minConfidence: 0.2,
    },
    mesh: { enabled: true },
    iris: { enabled: true },
    description: {
      enabled: true,
      modelPath: "faceres.json",
      skipFrames: 0,
      skipTime: 0,
    },
    emotion: { enabled: false },
    antispoof: { enabled: false },
    liveness: { enabled: false },
  },
};

let pending = null;

function summarize(result) {
  const faces = result?.face || [];
  const face = faces.length === 1 ? faces[0] : null;
  return {
    faceCount: faces.length,
    box: normalizeBox(face?.box),
    gestures: (result?.gesture || []).map((item) => item?.gesture).filter(Boolean),
    descriptor: face?.embedding || null,
  };
}

// IndexedDB keys are the file name only, so a library upgrade must drop the old weights.
async function forgetStaleModels(human, version) {
  const key = "hcm-human-models";
  try {
    if (localStorage.getItem(key) === version) return;
    const listed = await human.tf.io.listModels();
    await Promise.all(
      Object.keys(listed)
        .filter((name) => MODEL_NAMES.some((model) => name === `indexeddb://${model}`))
        .map((name) => human.tf.io.removeModel(name)),
    );
    localStorage.setItem(key, version);
  } catch {
    // A private window can block storage. The CDN copy still loads.
  }
}

async function selectBackend(human, backend) {
  human.config.backend = backend;
  await human.init();
  return human.tf.getBackend() === backend;
}

async function startEngine() {
  // The version is only on an instance. The second instance is the one that loads models.
  const version = new Human({ backend: "webgl" }).version;
  const modelBasePath = `https://cdn.jsdelivr.net/npm/@vladmandic/human@${version}/models/`;
  const human = new Human({ ...FACE_CONFIG, backend: "webgl", modelBasePath });
  await forgetStaleModels(human, version);

  let backend = "webgl";
  if (!(await selectBackend(human, "webgl"))) {
    backend = "wasm";
    if (!(await selectBackend(human, "wasm"))) {
      throw new Error("Could not start WebGL or WASM for face detection.");
    }
  }
  await human.load();

  let tail = Promise.resolve();
  return {
    version,
    backend,
    detect(video) {
      const run = tail.then(() => human.detect(video));
      tail = run.then(
        () => undefined,
        () => undefined,
      );
      return run.then(summarize);
    },
  };
}

export function loadFaceEngine() {
  if (!pending) {
    pending = startEngine().catch((error) => {
      pending = null;
      throw error;
    });
  }
  return pending;
}
