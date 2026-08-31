import { BookOpen, TrendingUp, Sparkles, GraduationCap, Flame, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { SkillProgress } from "@/types/api";

interface LearningProgressWidgetProps {
  skillProgress?: SkillProgress[];
  isLoading?: boolean;
  onAddSkill?: () => void;
}

export function LearningProgressWidget({
  skillProgress,
  isLoading,
  onAddSkill,
}: LearningProgressWidgetProps) {
  // Separate TEACH vs LEARN skills
  const learnSkills = skillProgress?.filter((s) => s.direction === "LEARN") || [];
  const teachSkills = skillProgress?.filter((s) => s.direction === "TEACH") || [];

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "text-blue-600 bg-blue-50/80 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
      case "INTERMEDIATE":
        return "text-purple-600 bg-purple-50/80 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
      case "ADVANCED":
        return "text-amber-600 bg-amber-50/80 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
      default:
        return "text-muted-foreground bg-muted/60 border-border";
    }
  };

  const getProgressIndicatorClass = (progress: number) => {
    if (progress >= 75) return "[&>div]:bg-emerald-500";
    if (progress >= 50) return "[&>div]:bg-[#1e90ff]";
    if (progress >= 25) return "[&>div]:bg-amber-500";
    return "[&>div]:bg-slate-400 dark:[&>div]:bg-slate-600";
  };

  if (!skillProgress?.length && !isLoading) {
    return (
      <Card className="rounded-3xl border border-dashed border-border bg-card/60 shadow-xs">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-2xl bg-blue-50 p-3.5 text-[#1e90ff] dark:bg-blue-950/50 mb-3">
            <BookOpen className="h-8 w-8" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">No Learning Progress Yet</p>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            Add skills to your portfolio and complete mentorship sessions to unlock your learning journey and mastery tracking.
          </p>
          {onAddSkill && (
            <Button
              onClick={onAddSkill}
              size="sm"
              className="rounded-xl text-xs font-semibold bg-[#1e90ff] hover:bg-[#1873cc] text-white shadow-xs"
            >
              Add First Skill
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-border/80 bg-card shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <TrendingUp className="h-5 w-5 text-[#1e90ff]" />
              Learning Progress & Mastery
            </CardTitle>
            <CardDescription className="text-xs">
              Track skill milestones, hours invested, and session journey
            </CardDescription>
          </div>
          {onAddSkill && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddSkill}
              className="text-xs font-semibold text-[#1e90ff] hover:text-[#1873cc] hover:bg-blue-50/50 dark:hover:bg-blue-950/30"
            >
              Manage Skills
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* LEARN Skills Section */}
        {learnSkills.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-[#1e90ff]" />
                Skills You&apos;re Learning ({learnSkills.length})
              </h4>
            </div>

            <div className="grid gap-3 sm:grid-cols-1">
              {learnSkills.map((skill) => (
                <div
                  key={skill.skillId}
                  className="group rounded-2xl border border-border/70 bg-card p-4 hover:border-[#1e90ff]/50 hover:shadow-xs transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-semibold truncate text-foreground group-hover:text-[#1e90ff] transition-colors">
                          {skill.skillName}
                        </h5>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.2 font-medium ${getLevelBadgeClass(
                            skill.currentLevel,
                          )}`}
                        >
                          {skill.currentLevel}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <span>
                          {skill.sessionsCompleted} {skill.sessionsCompleted === 1 ? "session" : "sessions"}
                        </span>
                        <span>•</span>
                        <span>{skill.hoursLearned.toFixed(1)}h invested</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-mono font-bold text-foreground">
                        {skill.progressPercentage}%
                      </span>
                      <p className="text-[10px] text-muted-foreground">Mastery</p>
                    </div>
                  </div>

                  <Progress
                    value={skill.progressPercentage}
                    className={`h-2 bg-muted ${getProgressIndicatorClass(skill.progressPercentage)}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TEACH Skills Section */}
        {teachSkills.length > 0 && (
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              Skills You&apos;re Teaching ({teachSkills.length})
            </h4>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {teachSkills.map((skill) => (
                <div
                  key={skill.skillId}
                  className="rounded-2xl border border-border/70 bg-muted/20 p-3.5 flex items-center justify-between gap-2 hover:bg-muted/40 transition"
                >
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-semibold truncate text-foreground">
                      {skill.skillName}
                    </h5>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {skill.sessionsCompleted} sessions taught · {skill.hoursLearned.toFixed(1)}h
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] shrink-0 font-medium ${getLevelBadgeClass(
                      skill.currentLevel,
                    )}`}
                  >
                    {skill.currentLevel}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
