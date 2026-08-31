import { Award, Trophy, Target, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { MilestoneResponse } from "@/types/api";

interface AchievementsWidgetProps {
  milestones?: MilestoneResponse[];
  isLoading?: boolean;
}

export function AchievementsWidget({ milestones, isLoading }: AchievementsWidgetProps) {
  const achieved = milestones?.filter((m) => m.achieved) || [];
  const inProgress = milestones?.filter((m) => !m.achieved && (m.progress || 0) > 0) || [];
  const locked = milestones?.filter((m) => !m.achieved && !(m.progress || 0)) || [];

  const getIconForMilestone = (code?: string) => {
    if (!code) return "🏆";
    if (code.includes("FIRST")) return "🎯";
    if (code.includes("STREAK")) return "🔥";
    if (code.includes("MASTER")) return "👑";
    if (code.includes("POINTS")) return "💰";
    if (code.includes("SESSION")) return "📚";
    return "🏆";
  };

  if (!milestones?.length && !isLoading) {
    return (
      <Card className="rounded-3xl border border-dashed border-border bg-secondary/20">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-sm font-semibold text-foreground mb-1">No Achievements Yet</p>
          <p className="text-xs text-muted-foreground">
            Complete sessions and activities to unlock milestones
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 font-semibold">
            <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Achievements & Milestones
          </CardTitle>
          <Badge className="bg-amber-600 text-white dark:bg-amber-700">
            {achieved.length} / {milestones?.length || 0}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recently Unlocked Badges */}
        {achieved.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-3">
              Unlocked
            </h4>
            <div className="grid grid-cols-4 gap-3">
              {achieved.slice(0, 8).map((milestone) => (
                <div key={milestone.id || milestone.code} className="text-center">
                  <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-700 flex items-center justify-center text-2xl mb-1.5 mx-auto shadow-xs">
                    {milestone.icon || getIconForMilestone(milestone.code)}
                  </div>
                  <p className="text-[10px] font-semibold text-foreground leading-tight line-clamp-2">
                    {milestone.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Milestone Progress */}
        {inProgress.length > 0 && (
          <div className="border-t border-amber-200 dark:border-amber-800 pt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2">
              Next Milestone
            </h4>
            {inProgress.slice(0, 2).map((milestone) => (
              <div
                key={milestone.id || milestone.code}
                className="p-3 rounded-2xl bg-white dark:bg-gray-900/50 border border-amber-200 dark:border-amber-800 mb-2"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {milestone.icon || getIconForMilestone(milestone.code)}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {milestone.title}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-foreground">
                    {milestone.progress || 0}%
                  </span>
                </div>
                <Progress
                  value={milestone.progress || 0}
                  className="h-2 bg-amber-100 dark:bg-amber-950 [&>div]:bg-amber-500"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">{milestone.description}</p>
                  <Badge
                    variant="outline"
                    className="text-xs bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 shrink-0 ml-2"
                  >
                    +{milestone.pointsReward} pts
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Locked Milestones Preview */}
        {locked.length > 0 && achieved.length === 0 && (
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground">
              {locked.length} more {locked.length === 1 ? "achievement" : "achievements"} to unlock!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
