import { useEffect, useRef } from "react";

// Menus close on an outside click and on Escape.
// The ref holds the latest callback so the listener is not torn down every render.
export function useDismissable(open, onClose) {
  const ref = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event) {
      if (!ref.current?.contains(event.target)) onCloseRef.current();
    }

    function onKeyDown(event) {
      if (event.key === "Escape") onCloseRef.current();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return ref;
}
