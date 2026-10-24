import { LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Card, FormAlert, StatusPill } from "../../../components/ui";
import { useToast } from "../../../context/ToastContext";
import { checkIn, checkOut } from "../../../features/attendance/api";
import { attendanceActionError } from "../../../features/attendance/messages";
import { formatTime } from "../../../lib/format";

export function CheckInWidget({ today, status, onChanged }) {
  const toast = useToast();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [stamp, setStamp] = useState(null);

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
    <Card title="Today">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">The server records the time. A time on this device is ignored.</p>
          <div className="mt-3">{pill ? <StatusPill status={pill} /> : <p className="text-sm text-zinc-500">No status yet</p>}</div>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex gap-3">
              <dt className="w-20 text-zinc-500 dark:text-zinc-400">Check in</dt>
              <dd className="font-medium text-zinc-950 dark:text-zinc-50">{formatTime(row?.checkIn)}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-20 text-zinc-500 dark:text-zinc-400">Check out</dt>
              <dd className="font-medium text-zinc-950 dark:text-zinc-50">{formatTime(row?.checkOut)}</dd>
            </div>
          </dl>
        </div>
        <div className="sm:shrink-0">
          {!checkedIn ? (
            <Button className="h-12 w-full px-5 text-base sm:w-auto" loading={busy === "in"} onClick={() => run("in")}>
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Check in
            </Button>
          ) : null}
          {checkedIn && !checkedOut ? (
            <Button className="h-12 w-full px-5 text-base sm:w-auto" variant="secondary" loading={busy === "out"} onClick={() => run("out")}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Check out
            </Button>
          ) : null}
          {checkedIn && checkedOut ? <p className="text-sm text-zinc-600 dark:text-zinc-300">You are checked out for today.</p> : null}
        </div>
      </div>
      {error ? (
        <div className="mt-4">
          <FormAlert message={error} />
        </div>
      ) : null}
    </Card>
  );
}
