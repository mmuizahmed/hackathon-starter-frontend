import { useEffect, useState } from "react";
import { Badge, Button, Card, ErrorState, FormAlert, Spinner } from "../../components/ui";
import { useToast } from "../../context/ToastContext";
import { formatDateTime } from "../../lib/format";
import { enrollFace, getMyFace } from "./api";
import { FacePreview } from "./FacePreview";
import { SAMPLE_GOAL, SAMPLE_MIN } from "./frame";
import { averageDescriptors } from "./payload";
import { useFaceCamera } from "./useFaceCamera";

function EnrollCapture({ onEnrolled, onCancel }) {
  const toast = useToast();
  const camera = useFaceCamera(true, { sampleGoal: SAMPLE_GOAL });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const ready = camera.samples.length >= SAMPLE_MIN;

  async function onSave() {
    if (!ready || saving) return;
    const descriptor = averageDescriptors(camera.samples);
    if (!descriptor) {
      setError("The face signature could not be read. Hold still and blink again.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const saved = await enrollFace(descriptor);
      toast.success("Face signature saved.");
      onEnrolled(saved);
    } catch (requestError) {
      setError(requestError.message);
      toast.error(requestError.message);
      if (requestError.status === 409) onEnrolled(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <FacePreview
        videoRef={camera.videoRef}
        faceBox={camera.faceBox}
        frameWidth={camera.frameWidth}
        frameHeight={camera.frameHeight}
        status={camera.status}
        error={camera.error}
      />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Samples {Math.min(camera.samples.length, SAMPLE_GOAL)} of {SAMPLE_GOAL}. One face, then a blink.{" "}
        {SAMPLE_MIN} to {SAMPLE_GOAL} signatures are averaged.
      </p>
      {error ? <FormAlert message={error} /> : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button className="w-full sm:w-auto" loading={saving} disabled={!ready} onClick={onSave}>
          Save face signature
        </Button>
        <Button className="w-full sm:w-auto" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function FaceEnrollCard() {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    getMyFace({ signal: controller.signal })
      .then((result) => {
        if (!active) return;
        setRecord(result);
        setError("");
      })
      .catch((requestError) => {
        if (!active || requestError.name === "AbortError") return;
        setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadKey]);

  const enrolled = record?.enrolled === true;

  return (
    <Card title="Face check-in">
      <div className="space-y-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">We store a face signature (numbers), not your photo.</p>
        {loading ? <Spinner label="Loading face enrollment" /> : null}
        {error ? (
          <ErrorState title="Could not load face enrollment" message={error} onRetry={() => setReloadKey((value) => value + 1)} />
        ) : null}
        {record && enrolled ? (
          <div className="space-y-2">
            <Badge tone="green">Face enrolled</Badge>
            {record.enrolledAt ? (
              <p className="text-sm text-zinc-700 dark:text-zinc-200">Enrolled {formatDateTime(record.enrolledAt)}</p>
            ) : null}
            {record.model ? <p className="text-sm text-zinc-500 dark:text-zinc-400">Model {record.model}</p> : null}
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Ask HR to reset it before enrolling again.</p>
          </div>
        ) : null}
        {record && !enrolled && !capturing ? (
          <Button onClick={() => setCapturing(true)}>Enroll face</Button>
        ) : null}
        {record && !enrolled && capturing ? (
          <EnrollCapture
            onCancel={() => setCapturing(false)}
            onEnrolled={(saved) => {
              setCapturing(false);
              if (saved && typeof saved.enrolled === "boolean") setRecord(saved);
              else setReloadKey((value) => value + 1);
            }}
          />
        ) : null}
      </div>
    </Card>
  );
}
