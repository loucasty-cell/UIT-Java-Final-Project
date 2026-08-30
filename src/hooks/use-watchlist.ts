import { useState, useEffect, useCallback } from "react";
import type { WatchlistItem } from "@/types/api";
import { toast } from "sonner";

const WATCHLIST_STORAGE_KEY = "skillbridge_watchlist_items";

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Keep in sync with local storage
  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore quota errors
    }
  }, [items]);

  const isInWatchlist = useCallback(
    (targetId: string) => items.some((item) => item.targetId === targetId),
    [items],
  );

  const addToWatchlist = useCallback((item: Omit<WatchlistItem, "id" | "addedAt">) => {
    setItems((prev) => {
      if (prev.some((i) => i.targetId === item.targetId)) return prev;
      const newItem: WatchlistItem = {
        ...item,
        id: `wl-${Date.now()}`,
        addedAt: new Date().toISOString(),
      };
      toast.success(`Added "${item.title}" to My List ❤️`);
      return [newItem, ...prev];
    });
  }, []);

  const removeFromWatchlist = useCallback((targetId: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.targetId === targetId);
      if (target) {
        toast.info(`Removed "${target.title}" from My List`);
      }
      return prev.filter((item) => item.targetId !== targetId);
    });
  }, []);

  const toggleWatchlist = useCallback(
    (item: Omit<WatchlistItem, "id" | "addedAt">) => {
      if (isInWatchlist(item.targetId)) {
        removeFromWatchlist(item.targetId);
      } else {
        addToWatchlist(item);
      }
    },
    [isInWatchlist, addToWatchlist, removeFromWatchlist],
  );

  return {
    items,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
  };
}
