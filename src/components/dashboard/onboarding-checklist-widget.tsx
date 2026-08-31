import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Circle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  ArrowRight,
  UserCheck,
  BookPlus,
  BookmarkCheck,
  CalendarCheck2,
  MessageCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface OnboardingChecklistWidgetProps {
  hasProfileComplete?: boolean;
  hasSkills?: boolean;
  hasSessions?: boolean;
  hasWatchlist?: boolean;
  onAddSkillClick?: () => void;
}

export function OnboardingChecklistWidget({
  hasProfileComplete = true,
  hasSkills = false,
  hasSessions = false,
  hasWatchlist = false,
  onAddSkillClick,
}: OnboardingChecklistWidgetProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("skillbridge_onboarding_dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("skillbridge_onboarding_dismissed", "true");
  };

  const steps = [
    {
      id: "profile",
      title: "Complete your student profile",
      description: "Ensure your major, year of study, and bio are up to date",
      completed: hasProfileComplete,
      icon: UserCheck,
      action: { label: "Profile", href: "/profile" },
    },
    {
      id: "skills",
      title: "Add your first skill to teach or learn",
      description: "List the subjects you want to master or share with peers",
      completed: hasSkills,
      icon: BookPlus,
      action: { label: "Add Skill", onClick: onAddSkillClick },
    },
    {
      id: "watchlist",
      title: "Save a mentor or skill to your Watchlist",
      description: "Bookmark peer mentors you want to book later",
      completed: hasWatchlist,
      icon: BookmarkCheck,
      action: { label: "Browse", href: "/mentors" },
    },
    {
      id: "session",
      title: "Schedule or book your first mentorship session",
      description: "Connect 1-on-1 via video classroom to exchange knowledge",
      completed: hasSessions,
      icon: CalendarCheck2,
      action: { label: "Find Mentor", href: "/mentors" },
    },
    {
      id: "forum",
      title: "Join the conversation in Community Forum",
      description: "Ask a homework question or share academic tips with peers",
      completed: false,
      icon: MessageCircle,
      action: { label: "Visit Forum", href: "/forum" },
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercentage = Math.round((completedCount / steps.length) * 100);
  const isAllComplete = completedCount === steps.length;

  if (isDismissed) return null;

  return (
    <Card className="rounded-3xl border-blue-200/80 bg-gradient-to-br from-blue-50/70 via-card to-card dark:border-blue-900/50 dark:from-blue-950/20 dark:via-card dark:to-card shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-[#1e90ff]/15 p-2 text-[#1e90ff]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
                Getting Started Checklist
                <Badge
                  variant="secondary"
                  className="bg-blue-100/80 text-[#0056D2] dark:bg-blue-900/40 dark:text-blue-300 text-[10px] font-medium"
                >
                  {completedCount} of {steps.length} Complete
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Essential steps to kickstart your peer learning and points journey
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={handleDismiss}
              title="Dismiss checklist"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Overall Progress</span>
            <span className="font-mono text-foreground font-bold">{progressPercentage}%</span>
          </div>
          <Progress
            value={progressPercentage}
            className="h-2 bg-blue-100/60 dark:bg-blue-950/60 [&>div]:bg-[#1e90ff]"
          />
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="pt-1 space-y-2.5">
          <div className="grid gap-2 sm:grid-cols-1">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`rounded-2xl border p-3 flex items-center justify-between gap-3 transition-all ${
                    step.completed
                      ? "border-emerald-500/25 bg-emerald-50/20 dark:bg-emerald-950/10 text-muted-foreground"
                      : "border-border/80 bg-card hover:border-[#1e90ff]/40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <h5
                        className={`text-xs font-semibold truncate ${
                          step.completed
                            ? "text-muted-foreground line-through opacity-80"
                            : "text-foreground"
                        }`}
                      >
                        {step.title}
                      </h5>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {!step.completed && (
                    <div className="shrink-0">
                      {step.action.href ? (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="h-7 rounded-lg text-[11px] font-medium border-border/80 hover:border-[#1e90ff]/40"
                        >
                          <Link to={step.action.href}>
                            {step.action.label} <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={step.action.onClick}
                          className="h-7 rounded-lg text-[11px] font-medium border-border/80 hover:border-[#1e90ff]/40"
                        >
                          {step.action.label} <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {isAllComplete && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 text-xs text-center font-medium">
              🎉 Congratulations! You have completed all onboarding steps. You are ready to thrive on SkillBridge.
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
