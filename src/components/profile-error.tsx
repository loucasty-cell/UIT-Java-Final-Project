// Error fallback component for profile page
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ProfileErrorFallbackProps {
  error: Error | null;
  onRetry: () => void;
}

export function ProfileErrorFallback({
  error,
  onRetry,
}: ProfileErrorFallbackProps) {
  return (
    <div className="w-full bg-slate-50/50 dark:bg-background pb-20 pt-6 md:py-8 min-h-[calc(100vh-4rem)]">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <Card className="p-8 rounded-2xl border-destructive/20 bg-destructive/5">
          <div className="flex gap-4 items-start">
            <div className="text-destructive mt-1">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground mb-2">
                Failed to Load Profile
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {error?.message ||
                  "An unexpected error occurred while loading your profile. Please try again."}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={onRetry}
                  className="gap-2"
                  variant="default"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.href = "/dashboard"}
                  variant="outline"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
