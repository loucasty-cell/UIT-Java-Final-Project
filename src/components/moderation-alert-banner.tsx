import { useCallback, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { notificationsService } from "@/services/notifications.service";
import { useLiveRefresh } from "@/hooks/use-live-refresh";
import type { NotificationResponse } from "@/types/api";

export function ModerationAlertBanner() {
  const [warning, setWarning] = useState<NotificationResponse | null>(null);
  const load = useCallback(async () => {
    try {
      const notifications = await notificationsService.getNotifications();
      setWarning(
        notifications.find(
          (notification) => notification.type === "ACCOUNT_WARNING" && !notification.read,
        ) || null,
      );
    } catch {
      // The notification bell already reports connectivity problems. Avoid
      // obscuring the rest of the application with a duplicate error.
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  useLiveRefresh(load);

  if (!warning) return null;
  return (
    <section
      role="alert"
      aria-live="assertive"
      className="border-y border-red-300 bg-red-50 px-4 py-4 text-red-950 dark:border-red-900 dark:bg-red-950/60 dark:text-red-100 sm:px-8"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-3">
        <div className="flex max-w-4xl gap-3">
          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold">{warning.title}</p>
            <p className="mt-1 text-sm">{warning.message || warning.detail}</p>
            <p className="mt-1 text-xs">This warning remains visible until you acknowledge it.</p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={() =>
            void notificationsService
              .markAsRead(warning.id)
              .then(() => setWarning(null))
              .catch(() => toast.error("Could not acknowledge the warning."))
          }
        >
          I understand
        </Button>
      </div>
    </section>
  );
}
