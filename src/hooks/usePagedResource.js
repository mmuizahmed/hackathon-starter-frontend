import { useCallback, useState } from "react";
import { useAbortableRequest } from "./useAbortableRequest";

// `load(page, signal)` returns `{ items, total, page, limit }`.
// Cancellation and reload live in useAbortableRequest. This hook only tracks the page.
export function usePagedResource(load) {
  const [page, setPage] = useState(1);
  const request = useCallback((signal) => load(page, signal), [load, page]);
  const { data, error, loading, reload } = useAbortableRequest(request);

  return {
    page,
    setPage,
    items: data?.items ?? [],
    total: data?.total ?? 0,
    limit: data?.limit ?? 20,
    loading,
    error,
    refresh: reload,
  };
}
