import { useEffect, useState } from "react";
import { listAnnouncements } from "./api";
import { AnnouncementList } from "./AnnouncementList";

// Dashboard card for Admin and HR. Shows the newest active posts for the signed-in role.
export function LatestAnnouncements({ limit = 4 }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    listAnnouncements({ limit }, { signal: controller.signal })
      .then((page) => {
        setItems(page?.items || []);
        setError("");
      })
      .catch((requestError) => {
        if (requestError.name === "AbortError") return;
        setItems([]);
        setError(requestError.message || "Could not load announcements.");
      });
    return () => controller.abort();
  }, [limit, reloadKey]);

  return <AnnouncementList items={items} error={error} onRetry={() => setReloadKey((value) => value + 1)} />;
}
