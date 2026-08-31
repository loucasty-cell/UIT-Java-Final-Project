import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/auth-context";

interface OnboardingChecklistProps {
  hasSkills: boolean;
  hasSessions: boolean;
  onCompleteProfile: () => void;
  onAddSkill: () => void;
  onUploadAvatar: () => void;
  onBookSession: () => void;
  onShareReferral: () => void;
}

export function OnboardingChecklist({
  hasSkills,
  hasSessions,
  onCompleteProfile,
  onAddSkill,
  onUploadAvatar,
  onBookSession,
  onShareReferral,
}: OnboardingChecklistProps) {
  const { user } = useAuth();

  const checks = [
    {
      id: "profile",
      label: "Complete your profile",
      done: Boolean((user as any)?.bio && (user as any)?.major),
      points: 10,
      action: onCompleteProfile,
    },
    {
      id: "avatar",
      label: "Upload profile picture",
      done: Boolean((user as any)?.profilePictureUrl || (user as any)?.avatarUrl),
      points: 5,
      action: onUploadAvatar,
    },
    {
      id: "skill",
      label: "Add your first skill",
      done: hasSkills,
      points: 15,
      action: onAddSkill,
    },
    {
      id: "session",
      label: "Book your first session",
      done: hasSessions,
      points: 25,
      action: onBookSession,
    },
    {
      id: "referral",
      label: "Share your referral link",
      done: false, // Track via localStorage or backend
      points: 10,
      action: onShareReferral,
    },
  ];

  const completed = checks.filter((c) => c.done).length;
  const total = checks.length;
  const progress = (completed / total) * 100;

  // Hide if fully completed
  if (completed === total) return null;

  return (
    <Card className="rounded-3xl border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-base flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            Get Started with SkillBridge
          </CardTitle>
          <Badge className="bg-green-600 text-white dark:bg-green-700">
            {completed}/{total}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 bg-green-100 dark:bg-green-950 [&>div]:bg-green-600" />
      </CardHeader>
      <CardContent className="space-y-2">
        {checks.map((check) => (
          <div
            key={check.id}
            className={`flex items-center justify-between p-3 rounded-2xl transition ${
              check.done
                ? "bg-green-100 dark:bg-green-950/40 border border-green-300 dark:border-green-800"
                : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 cursor-pointer hover:shadow-xs"
            }`}
            onClick={!check.done ? check.action : undefined}
          >
            <div className="flex items-center gap-3">
              {check.done ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600 shrink-0" />
              )}
              <span
                className={`text-sm font-medium ${
                  check.done
                    ? "text-gray-500 dark:text-gray-400 line-through"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {check.label}
              </span>
            </div>
            {!check.done && (
              <Badge
                variant="outline"
                className="text-xs bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 shrink-0"
              >
                +{check.points} pts
              </Badge>
            )}
          </div>
        ))}

        {completed > 0 && completed < total && (
          <div className="mt-3 p-3 rounded-2xl bg-green-100 dark:bg-green-950/40 border border-green-300 dark:border-green-800 text-center">
            <p className="text-xs font-semibold text-green-700 dark:text-green-400">
              🎉 Great progress! {total - completed} more {total - completed === 1 ? "step" : "steps"} to go
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
