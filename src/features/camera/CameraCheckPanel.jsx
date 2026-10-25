import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BrandMark } from "../../components/BrandMark";
import { Button, FormAlert, Spinner, StatusPill } from "../../components/ui";
import { useToast } from "../../context/ToastContext";
import { checkIn, checkOut } from "../attendance/api";
import { attendanceActionError } from "../attendance/messages";
import { formatTime } from "../../lib/format";
import { accuracyWarning, readPrecisePosition } from "./location";
import { cameraAttendanceBody, formatMatchScore, formatMeters, readCameraResult } from "./payload";
import { FacePreview } from "./FacePreview";
import { useFaceCamera } from "./useFaceCamera";

const STEPS = ["Camera", "One face", "Blink", "Location", "Submit"];

function StepList({ current }) {
  return (
    <ol className="flex flex-wrap gap-2" aria-label="Camera check-in steps">
      {STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li
            key={label}
            className={
              done
                ? "rounded-control bg-brand-700 px-2 py-1 text-xs font-medium text-white"
                : active
                  ? "rounded-control border border-brand-700 px-2 py-1 text-xs font-medium text-brand-800 dark:text-brand-200"
                  : "rounded-control bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            }
            aria-current={active ? "step" : undefined}
          >
            {index + 1}. {label}
          </li>
        );
      })}
    </ol>
  );
}

function ResultList({ result }) {
  const reading = readCameraResult(result);
  const distance = formatMeters(reading.distanceMeters);
  const score = formatMatchScore(reading.faceMatchScore);
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex items-center justify-between gap-3">
        <dt className="text-zinc-500 dark:text-zinc-400">Status</dt>
        <dd>{reading.status ? <StatusPill status={reading.status} /> : "—"}</dd>
      </div>
      <div className="flex items-center justify-between gap-3">
        <dt className="text-zinc-500 dark:text-zinc-400">Distance</dt>
        <dd className="font-medium text-zinc-950 dark:text-zinc-50">{distance || "—"}</dd>
      </div>
      <div className="flex items-center justify-between gap-3">
        <dt className="text-zinc-500 dark:text-zinc-400">Match score</dt>
        <dd className="font-medium text-zinc-950 dark:text-zinc-50">{score || "—"}</dd>
      </div>
    </dl>
  );
}

export function CameraCheckPanel({ action = "in", onClose, onSaved }) {
  const toast = useToast();
  const [result, setResult] = useState(null);
  const camera = useFaceCamera(!result);
  const [fix, setFix] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [busy, setBusy] = useState(false);
  const checkingOut = action === "out";

  useEffect(() => {
    if (!camera.blinkDetected) return undefined;
    let active = true;
    setLocating(true);
    setLocationError("");
    readPrecisePosition()
      .then((position) => {
        if (active) setFix(position);
      })
      .catch((error) => {
        if (active) setLocationError(error.message);
      })
      .finally(() => {
        if (active) setLocating(false);
      });
    return () => {
      active = false;
    };
  }, [camera.blinkDetected, attempt]);

  const step = result
    ? 5
    : fix
      ? 4
      : camera.blinkDetected
        ? 3
        : camera.faceCount === 1
          ? 2
          : camera.frameWidth
            ? 1
            : 0;
  const warning = accuracyWarning(fix?.accuracy);
  const canSubmit = Boolean(
    camera.blinkDetected &&
      camera.faceCount === 1 &&
      camera.descriptor?.length &&
      fix &&
      Number.isFinite(fix.accuracy) &&
      !camera.error &&
      !busy,
  );

  async function onSubmit() {
    if (!canSubmit) return;
    setBusy(true);
    setSubmitError("");
    const body = cameraAttendanceBody({
      descriptor: camera.descriptor,
      lat: fix.lat,
      lng: fix.lng,
      accuracy: fix.accuracy,
      faceCount: 1,
    });
    try {
      const saved = checkingOut ? await checkOut(body) : await checkIn(body);
      setResult(saved);
      const when = checkingOut ? saved?.checkOut : saved?.checkIn;
      toast.success(checkingOut ? `Checked out at ${formatTime(when)}` : `Checked in at ${formatTime(when)}`);
      onSaved?.(saved);
    } catch (error) {
      const message = attendanceActionError(error, checkingOut ? "out" : "in");
      setSubmitError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BrandMark className="h-6 w-6" />
        <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          {checkingOut ? "Check out with camera" : "Check in with camera"}
        </h3>
      </div>
      <StepList current={step} />

      {result ? (
        <div className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            The server recorded this {checkingOut ? "check-out" : "check-in"}.
          </p>
          <ResultList result={result} />
          <Button onClick={onClose}>Done</Button>
        </div>
      ) : (
        <>
          <FacePreview
            videoRef={camera.videoRef}
            faceBox={camera.faceBox}
            frameWidth={camera.frameWidth}
            frameHeight={camera.frameHeight}
            status={camera.status}
            error={camera.error}
          />
          <div className="space-y-2 text-sm">
            {locating ? <Spinner label="Finding location" /> : null}
            {fix ? (
              <p className="text-zinc-700 dark:text-zinc-200">
                Accuracy <span className="font-medium">{formatMeters(fix.accuracy)}</span>
              </p>
            ) : null}
            {warning ? <p className="text-amber-800 dark:text-amber-200">{warning}</p> : null}
            {camera.blinkDetected && !camera.descriptor ? (
              <p className="text-zinc-600 dark:text-zinc-400">Waiting for the face signature.</p>
            ) : null}
            {locationError ? <FormAlert message={locationError} /> : null}
            {locationError ? (
              <Button variant="secondary" onClick={() => setAttempt((value) => value + 1)}>
                Try location again
              </Button>
            ) : null}
          </div>
          {submitError ? <FormAlert message={submitError} /> : null}
          {submitError === "Enroll your face first" ? (
            <Link to="/employee/profile" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-200">
              Enroll on My Profile
            </Link>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="w-full sm:w-auto" loading={busy} disabled={!canSubmit} onClick={onSubmit}>
              {checkingOut ? "Check out with camera" : "Check in with camera"}
            </Button>
            <Button className="w-full sm:w-auto" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
          <Link
            to="/employee/attendance#request-correction"
            className="inline-block text-sm font-medium text-brand-700 hover:underline dark:text-brand-200"
          >
            Can&apos;t check in? Request an HR correction
          </Link>
        </>
      )}
    </div>
  );
}
