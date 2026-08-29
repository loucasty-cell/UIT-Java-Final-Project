import { useEffect, useState } from "react";
import { Clock, ShieldCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface EscrowProgressProps {
  /** ISO timestamp when the session was marked complete (start of 18h window) */
  completedAt?: string;
  /** Escrow auto-release window in hours (default: 18) */
  autoReleaseHours?: number;
  points: number;
}

export function EscrowProgress({
  completedAt,
  autoReleaseHours = 18,
  points,
}: EscrowProgressProps) {
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");
  const [percentRemaining, setPercentRemaining] = useState<number>(100);

  useEffect(() => {
    if (!completedAt) {
      setTimeLeftStr(`${autoReleaseHours}h remaining`);
      setPercentRemaining(100);
      return;
    }

    const completedTime = new Date(completedAt).getTime();
    const durationMs = autoReleaseHours * 60 * 60 * 1000;
    const releaseTime = completedTime + durationMs;

    const updateTimer = () => {
      const now = Date.now();
      const diffMs = releaseTime - now;

      if (diffMs <= 0) {
        setTimeLeftStr("Auto-released");
        setPercentRemaining(0);
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeftStr(`${hours}h ${minutes}m remaining`);
      setPercentRemaining(Math.max(0, Math.min(100, (diffMs / durationMs) * 100)));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [completedAt, autoReleaseHours]);

  return (
    <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-3 text-xs dark:border-amber-900/50 dark:bg-amber-950/20">
      <div className="flex items-center justify-between font-medium text-amber-900 dark:text-amber-200">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span>Escrow Auto-Release: {timeLeftStr}</span>
        </div>
        <span className="font-semibold">{points} Pts Held</span>
      </div>
      <Progress
        value={100 - percentRemaining}
        className="mt-2 h-1.5 bg-amber-200/60 dark:bg-amber-950"
      />
      <p className="mt-1.5 text-[11px] text-amber-800/80 dark:text-amber-300/80">
        <ShieldCheck className="mr-1 inline h-3 w-3 text-amber-600" />
        Points will automatically transfer to mentor if uncontested after 18 hours.
      </p>
    </div>
  );
}
