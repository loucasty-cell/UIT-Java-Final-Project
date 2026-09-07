import { useEffect } from "react";

interface UseLiveRefreshOptions {
  /** Polling interval in milliseconds. Default: 60000 (60 seconds) */
  intervalMs?: number;
  /** Refetch when window gains focus. Default: true */
  refetchOnFocus?: boolean;
  /** Refetch when document becomes visible. Default: true */
  refetchOnVisibility?: boolean;
}

/**
 * Refresh shared data while the page is visible and when returning to it.
 * Optimized: configurable polling interval to reduce unnecessary requests.
 */
export function useLiveRefresh(
  refresh: (silent?: boolean) => Promise<void>,
  options: UseLiveRefreshOptions = {}
) {
  const {
    intervalMs = 60000,
    refetchOnFocus = true,
    refetchOnVisibility = true,
  } = options;

  useEffect(() => {
    const update = () => {
      if (document.visibilityState === "visible") void refresh(true);
    };

    const timer = window.setInterval(update, intervalMs);
    if (refetchOnFocus) window.addEventListener("focus", update);
    if (refetchOnVisibility) document.addEventListener("visibilitychange", update);

    return () => {
      window.clearInterval(timer);
      if (refetchOnFocus) window.removeEventListener("focus", update);
      if (refetchOnVisibility) document.removeEventListener("visibilitychange", update);
    };
  }, [refresh, intervalMs, refetchOnFocus, refetchOnVisibility]);
}