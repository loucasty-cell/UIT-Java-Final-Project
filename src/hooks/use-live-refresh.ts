import { useEffect } from "react";

/** Refresh shared data while the page is visible and when returning to it. */
export function useLiveRefresh(refresh: (silent?: boolean) => Promise<void>) {
  useEffect(() => {
    const update = () => {
      if (document.visibilityState === "visible") void refresh(true);
    };
    const timer = window.setInterval(update, 15000);
    window.addEventListener("focus", update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", update);
    };
  }, [refresh]);
}
