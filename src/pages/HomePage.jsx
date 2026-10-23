import { useCallback, useEffect, useRef, useState } from "react";
import { getHealth } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ErrorState } from "../components/ui/ErrorState";
import { Spinner } from "../components/ui/Spinner";

export function HomePage() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const requestId = useRef(0);

  const check = useCallback(async () => {
    const id = requestId.current + 1;
    requestId.current = id;
    setStatus("loading");
    setMessage("");

    try {
      const result = await getHealth();
      if (requestId.current !== id) return;

      if (result?.success !== true) {
        setStatus("error");
        setMessage("Health check did not return { success: true }.");
        return;
      }

      const serverStatus = result?.data?.status;
      setStatus("ok");
      setMessage(
        serverStatus && String(serverStatus).toLowerCase() !== "ok"
          ? String(serverStatus)
          : "",
      );
    } catch (error) {
      if (requestId.current !== id) return;

      // No response, or a 5xx with no message: the API is not usable.
      // A JSON error `{ success: false, message }` is shown as-is.
      const serverMessage = error.payload?.message;
      if (error.code === "unreachable" || (error.status >= 500 && !serverMessage)) {
        setStatus("unreachable");
        setMessage("");
        return;
      }

      setStatus("error");
      setMessage(serverMessage || error.message || "Request failed");
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
          Hackathon starter
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
          A small React app you can extend tonight. The card below calls{" "}
          <code className="rounded bg-stone-200 px-1 py-0.5 text-stone-800">
            GET /api/health
          </code>{" "}
          on the API server.
        </p>
      </div>

      <Card
        title="Backend"
        actions={
          status === "ok" ? (
            <Button variant="secondary" onClick={check}>
              Check again
            </Button>
          ) : null
        }
      >
        {status === "loading" ? <Spinner label="Checking backend..." /> : null}

        {status === "ok" ? (
          <p className="text-sm text-stone-700">
            Status: <span className="font-semibold text-teal-800">ok</span>
            {message ? (
              <span className="mt-1 block text-stone-500">
                Server says: {message}
              </span>
            ) : null}
          </p>
        ) : null}

        {status === "unreachable" ? (
          <ErrorState
            title="Backend unreachable"
            message="Status: unreachable. Nothing healthy answered GET /api/health. Start the backend on port 5000 and try again."
            onRetry={check}
          />
        ) : null}

        {status === "error" ? (
          <ErrorState title="Backend error" message={message} onRetry={check} />
        ) : null}
      </Card>
    </div>
  );
}
