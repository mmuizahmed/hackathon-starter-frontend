import { useEffect } from "react";

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · HCM Lite` : "HCM Lite";
  }, [title]);
}
