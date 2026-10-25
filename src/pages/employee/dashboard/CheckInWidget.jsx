import { Camera, LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Card, FormAlert, StatusPill } from "../../../components/ui";
import { useToast } from "../../../context/ToastContext";
import { checkIn, checkOut } from "../../../features/attendance/api";
import { attendanceActionError } from "../../../features/attendance/messages";
import { CameraCheckPanel } from "../../../features/camera/CameraCheckPanel";
import { formatMatchScore, formatMeters } from "../../../features/camera/payload";
import { formatDate, formatTime, todayInKarachi } from "../../../lib/format";

function Figure({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-zinc-950 dark:text-zinc-50">{value}</dd>
    </div>
  );
}

export function CheckInWidget({ today, status, onChanged }) {
  const toast = useToast();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [stamp, setStamp] = useState(null);
  const [cameraAction, setCameraAction] = useState(null);

  useEffect(() => {
    setStamp(null);
  }, [today]);

  const row = stamp || today;
  const checkedIn = Boolean(row?.checkIn);
  const checkedOut = Boolean(row?.checkOut);
  const pill = row?.status || status;

  async function run(action) {
    if (busy) return;
    setBusy(action);
    setError("");
    try {
      const saved = action === "in" ? await checkIn({ source: "web" }) : await checkOut();
      setStamp(saved);
      const when = action === "in" ? saved?.checkIn : saved?.checkOut;
      toast.success(action === "in" ? `Checked in at ${formatTime(when)}` : `Checked out at ${formatTime(when)}`);
      onChanged();
    } catch (requestError) {
      const message = attendanceActionError(requestError, action);
      setError(message);
      toast.error(message);
    } finally {
      setBusy("");
    }
  }

  return (
    <Card
      title={`Today · ${formatDate(todayInKarachi())}`}
      actions={pill ? <StatusPill status={pill} /> : <span className="text-xs text-zinc-500 dark:text-zinc-400">No status yet</span>}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <dl className="grid grid-cols-2 gap-6 sm:flex sm:gap-10">
            <Figure label="Check in" value={formatTime(row?.checkIn)} />
            <Figure label="Check out" value={formatTime(row?.checkOut)} />
            {typeof row?.location?.distanceMeters === "number" ? (
              <Figure label="Distance" value={formatMeters(row.location.distanceMeters)} />
            ) : null}
            {typeof row?.faceMatchScore === "number" ? (
              <Figure label="Match" value={formatMatchScore(row.faceMatchScore)} />
            ) : null}
          </dl>
          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">The server records the time. A time on this device is ignored.</p>
        </div>
        {cameraAction ? null : (
          <div className="flex flex-col gap-2 sm:w-56 sm:shrink-0">
            {!checkedIn ? (
              <Button className="h-11 w-full px-5" loading={busy === "in"} onClick={() => run("in")}>
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Check in
              </Button>
            ) : null}
            {!checkedIn ? (
              <Button className="h-11 w-full px-5" variant="secondary" onClick={() => setCameraAction("in")}>
                <Camera className="h-4 w-4" aria-hidden="true" />
                Check in with camera
              </Button>
            ) : null}
            {checkedIn && !checkedOut ? (
              <Button className="h-11 w-full px-5" variant="secondary" loading={busy === "out"} onClick={() => run("out")}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Check out
              </Button>
            ) : null}
            {checkedIn && !checkedOut ? (
              <Button className="h-11 w-full px-5" variant="secondary" onClick={() => setCameraAction("out")}>
                <Camera className="h-4 w-4" aria-hidden="true" />
                Check out with camera
              </Button>
            ) : null}
            {checkedIn && checkedOut ? <p className="text-sm text-zinc-600 dark:text-zinc-300 sm:text-right">You are checked out for today.</p> : null}
          </div>
        )}
      </div>
      {cameraAction ? (
        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <CameraCheckPanel
            action={cameraAction}
            onClose={() => setCameraAction(null)}
            onSaved={(saved) => {
              setStamp(saved);
              setError("");
              onChanged();
            }}
          />
        </div>
      ) : null}
      {error ? (
        <div className="mt-4">
          <FormAlert message={error} />
        </div>
      ) : null}
    </Card>
  );
}
