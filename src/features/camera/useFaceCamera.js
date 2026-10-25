import { useEffect, useRef, useState } from "react";
import { SAMPLE_GOAL, STATUS, emptyFrame, nextFrameState } from "./frame";
import { cameraErrorMessage, openUserCamera, stopStream } from "./media";

const EMPTY_VIEW = {
  faceCount: 0,
  faceBox: null,
  frameWidth: 0,
  frameHeight: 0,
  descriptor: null,
  blinkDetected: false,
  status: "",
  error: "",
  samples: [],
};

export function useFaceCamera(active, { sampleGoal = 0 } = {}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const frameRef = useRef(emptyFrame());
  const samplesRef = useRef([]);
  const [view, setView] = useState(() => ({
    ...EMPTY_VIEW,
    status: active ? STATUS.loading : "",
  }));

  useEffect(() => {
    if (!active) {
      frameRef.current = emptyFrame();
      samplesRef.current = [];
      setView(EMPTY_VIEW);
      return undefined;
    }

    let stopped = false;
    let frameId = 0;
    let failures = 0;
    let owned = null;
    const goal = sampleGoal || SAMPLE_GOAL;

    // Strict mode starts two cameras. Each effect only stops the stream it opened.
    function release() {
      stopStream(owned);
      const video = videoRef.current;
      if (video && owned && video.srcObject === owned) video.srcObject = null;
      if (streamRef.current === owned) streamRef.current = null;
      owned = null;
    }

    async function loop(engine) {
      if (stopped) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2) {
        frameId = requestAnimationFrame(() => loop(engine));
        return;
      }

      try {
        const observation = await engine.detect(video);
        if (stopped) return;
        failures = 0;
        const next = nextFrameState(frameRef.current, observation);
        frameRef.current = next;

        let samples = samplesRef.current;
        if (sampleGoal > 0 && next.blinkDetected && next.stable && next.descriptor && samples.length < goal) {
          samples = [...samples, next.descriptor];
          samplesRef.current = samples;
        } else if (!next.blinkDetected && samples.length) {
          samples = [];
          samplesRef.current = [];
        }

        setView({
          faceCount: next.faceCount,
          faceBox: next.box,
          frameWidth: video.videoWidth || 0,
          frameHeight: video.videoHeight || 0,
          descriptor: next.descriptor,
          blinkDetected: next.blinkDetected,
          status: next.status,
          error: "",
          samples,
        });
      } catch {
        failures += 1;
        if (!stopped && failures >= 3) {
          setView((current) => ({ ...current, error: "The camera frame could not be read." }));
          return;
        }
      }

      if (!stopped) frameId = requestAnimationFrame(() => loop(engine));
    }

    async function start() {
      setView((current) => ({ ...current, status: STATUS.loading, error: "" }));
      let engine;
      try {
        const loaded = await import("./engine.js");
        engine = await loaded.loadFaceEngine();
      } catch {
        if (!stopped) {
          setView((current) => ({
            ...current,
            status: "",
            error: "Face models could not be loaded. Check the network and try again.",
          }));
        }
        return;
      }
      if (stopped) return;

      setView((current) => ({ ...current, status: STATUS.camera }));
      let stream;
      try {
        stream = await openUserCamera();
      } catch (error) {
        if (!stopped) {
          setView((current) => ({ ...current, status: "", error: cameraErrorMessage(error) }));
        }
        return;
      }
      owned = stream;
      streamRef.current = stream;
      if (stopped) {
        release();
        return;
      }

      const video = videoRef.current;
      if (!video) {
        release();
        if (!stopped) {
          setView((current) => ({ ...current, status: "", error: "The camera preview is not on the page." }));
        }
        return;
      }
      video.muted = true;
      video.srcObject = stream;
      try {
        await video.play();
      } catch {
        if (!stopped) {
          setView((current) => ({ ...current, status: "", error: "The camera preview could not be started." }));
        }
        return;
      }
      if (stopped) return;
      // The first frame also compiles the WebGL shaders, so keep the loading label.
      setView((current) => ({ ...current, status: STATUS.loading }));
      loop(engine);
    }

    start();
    return () => {
      stopped = true;
      cancelAnimationFrame(frameId);
      release();
    };
  }, [active, sampleGoal]);

  return { videoRef, ...view };
}
