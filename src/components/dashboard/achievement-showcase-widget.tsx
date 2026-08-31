import { useState, useMemo } from "react";
import { Award, CheckCircle2, Lock, Sparkles, Trophy, ChevronRight, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { MilestoneResponse } from "@/types/api";

interface AchievementShowcaseWidgetProps {
  milestones?: MilestoneResponse[];
  isLoading?: boolean;
}

export function AchievementShowcaseWidget({
  milestones = [],
  isLoading,
}: AchievementShowcaseWidgetProps) {
  const [isAllModalOpen, setIsAllModalOpen] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "UNLOCKED" | "IN_PROGRESS">("ALL");

  const unlockedCount = useMemo(
    () => milestones.filter((m) => m.achieved).length,
    [milestones],
  );

  const totalRewardsEarned = useMemo(
    () =>
      milestones
        .filter((m) => m.achieved)
        .reduce((sum, m) => sum + (m.pointsReward || 0), 0),
    [milestones],
  );

  const filteredMilestones = useMemo(() => {
    if (filter === "UNLOCKED") return milestones.filter((m) => m.achieved);
    if (filter === "IN_PROGRESS") return milestones.filter((m) => !m.achieved);
    return milestones;
  }, [milestones, filter]);

  // Highlight top 3 milestones for the compact card view
  const previewMilestones = useMemo(() => {
    // Show in-progress first, then recently unlocked
    const sorted = [...milestones].sort((a, b) => {
      if (a.achieved === b.achieved) return 0;
      return a.achieved ? 1 : -1;
    });
    return sorted.slice(0, 3);
  }, [milestones]);

  const completionPercent = milestones.length > 0
    ? Math.round((unlockedCount / milestones.length) * 100)
    : 0;

  return (
    <>
      <Card className="rounded-3xl border-border/80 bg-card shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
                <Trophy className="h-5 w-5 text-amber-500" />
                Achievements & Milestones
              </CardTitle>
              <CardDescription className="text-xs">
                Unlock peer reputation and bonus reward points
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAllModalOpen(true)}
              className="text-xs font-semibold text-[#1e90ff] hover:text-[#1873cc] hover:bg-blue-50/50 dark:hover:bg-blue-950/30"
            >
              View All ({milestones.length})
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Header Summary Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-amber-500/20 p-2 text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <span>{unlockedCount} of {milestones.length} Badges Unlocked</span>
                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] py-0 px-1.5">
                      +{totalRewardsEarned} Pts
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {completionPercent}% total platform milestone completion
                  </p>
                </div>
              </div>
              <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                {completionPercent}%
              </span>
            </div>
            <Progress value={completionPercent} className="h-1.5 mt-2.5 [&>div]:bg-amber-500" />
          </div>

          {/* Compact Milestones List */}
          <div className="space-y-2.5">
            {previewMilestones.map((m) => {
              const currentProgress = m.progress ?? (m.achieved ? m.conditionValue : 0);
              const maxProgress = m.conditionValue || 1;
              const progressPct = Math.min(
                100,
                Math.round((currentProgress / maxProgress) * 100),
              );

              return (
                <div
                  key={m.id || m.code}
                  className={`rounded-2xl border p-3 transition-all duration-200 ${
                    m.achieved
                      ? "border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20 hover:border-emerald-500/50"
                      : "border-border/70 bg-card hover:border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className={`text-lg p-1.5 rounded-xl shrink-0 ${
                          m.achieved
                            ? "bg-emerald-500/15 text-emerald-600"
                            : "bg-muted text-muted-foreground opacity-80"
                        }`}
                      >
                        {m.icon || "🏆"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-semibold text-foreground truncate">
                            {m.title}
                          </h5>
                          {m.achieved ? (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0 text-[10px] py-0 px-1.5">
                              Earned
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-muted-foreground">
                              +{m.pointsReward} Pts
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {m.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {m.achieved ? (
                        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>+{m.pointsReward} Pts</span>
                        </div>
                      ) : (
                        <div className="text-[11px] font-mono text-muted-foreground">
                          {currentProgress}/{maxProgress}
                        </div>
                      )}
                    </div>
                  </div>

                  {!m.achieved && (
                    <div className="mt-2 pt-1">
                      <Progress
                        value={progressPct}
                        className="h-1.5 [&>div]:bg-[#1e90ff]"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Button
            onClick={() => setIsAllModalOpen(true)}
            variant="outline"
            size="sm"
            className="w-full rounded-xl text-xs font-medium border-border/80 hover:bg-muted/50"
          >
            Explore All Achievements <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </CardContent>
      </Card>

      {/* View All Achievements Modal */}
      <Dialog open={isAllModalOpen} onOpenChange={setIsAllModalOpen}>
        <DialogContent className="max-w-2xl rounded-3xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <DialogTitle className="text-lg font-bold">SkillBridge Achievements & Badges</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Earn peer recognition, unlock badges, and accumulate bonus points as you participate.
            </DialogDescription>
          </DialogHeader>

          {/* Filter Pills */}
          <div className="flex gap-2 pt-2 pb-1">
            <Button
              variant={filter === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("ALL")}
              className="rounded-xl text-xs h-8"
            >
              All ({milestones.length})
            </Button>
            <Button
              variant={filter === "UNLOCKED" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("UNLOCKED")}
              className="rounded-xl text-xs h-8"
            >
              Unlocked ({unlockedCount})
            </Button>
            <Button
              variant={filter === "IN_PROGRESS" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("IN_PROGRESS")}
              className="rounded-xl text-xs h-8"
            >
              In Progress ({milestones.length - unlockedCount})
            </Button>
          </div>

          {/* Scrollable Badges Grid */}
          <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
            {filteredMilestones.map((m) => {
              const currentProgress = m.progress ?? (m.achieved ? m.conditionValue : 0);
              const maxProgress = m.conditionValue || 1;
              const progressPct = Math.min(
                100,
                Math.round((currentProgress / maxProgress) * 100),
              );

              return (
                <div
                  key={m.id || m.code}
                  className={`rounded-2xl border p-4 transition ${
                    m.achieved
                      ? "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="text-2xl p-2 rounded-2xl bg-muted shrink-0">
                        {m.icon || "🏆"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-foreground">{m.title}</h4>
                          {m.achieved ? (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0 text-[10px]">
                              Unlocked
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">
                              Locked
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400"
                      >
                        +{m.pointsReward} Pts
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {m.achieved
                        ? "Completed!"
                        : `Progress: ${currentProgress} / ${maxProgress} ${m.conditionType ? m.conditionType.toLowerCase().replace(/_/g, " ") : "steps"}`}
                    </span>
                    <span className="font-mono font-medium">{progressPct}%</span>
                  </div>
                  <Progress
                    value={progressPct}
                    className={`h-1.5 mt-1.5 ${m.achieved ? "[&>div]:bg-emerald-500" : "[&>div]:bg-[#1e90ff]"}`}
                  />
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
