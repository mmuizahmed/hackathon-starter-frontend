import { useCallback, useEffect, useState } from "react";

// The guide's cancel-on-unmount pattern. `load` must change when its inputs change.
export function useAbortableRequest(load) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => {
    setVersion((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);

    load(controller.signal)
      .then((result) => {
        if (!active) return;
        setData(result);
        setError("");
      })
      .catch((requestError) => {
        if (!active || requestError?.name === "AbortError") return;
        setError(requestError.message || "Request failed");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [load, version]);

  return { data, error, loading, reload };
}
