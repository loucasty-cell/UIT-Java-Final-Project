// Skeleton component for profile loading state
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="w-full bg-slate-50/50 dark:bg-background pb-20 pt-6 md:py-8 min-h-[calc(100vh-4rem)]">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Card Skeleton */}
            <Card className="overflow-hidden rounded-2xl">
              <div className="h-28 bg-muted animate-pulse" />
              <div className="px-5 pb-6 pt-4">
                <Skeleton className="h-20 w-20 rounded-full mb-3" />
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-3" />
                <Skeleton className="h-3 w-40" />
              </div>
            </Card>

            {/* About Skeleton */}
            <Card className="rounded-2xl p-5">
              <Skeleton className="h-5 w-24 mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>

            {/* Skills Skeleton */}
            <Card className="rounded-2xl p-5">
              <Skeleton className="h-5 w-24 mb-3" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-7 w-24 rounded-full" />
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-9 space-y-6">
            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-6 w-8 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </Card>
              ))}
            </div>

            {/* Learning Journey Skeleton */}
            <Card className="rounded-2xl p-5">
              <Skeleton className="h-5 w-48 mb-4" />
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
