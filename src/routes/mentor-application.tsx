import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { requireAuth } from "@/lib/route-guards";
import { useAuth } from "@/context/auth-context";
import {
  useMyMentorApplicationQuery,
  useSubmitMentorApplicationMutation,
} from "@/hooks/api/use-mentor-application";
import { useCatalogSkillsQuery } from "@/hooks/api/use-skills";

export const Route = createFileRoute("/mentor-application")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Become an Instructor — SkillBridge" },
      {
        name: "description",
        content:
          "Apply to become a verified peer instructor on SkillBridge. Teach what you know and earn points.",
      },
    ],
  }),
  component: MentorApplicationPage,
});

function MentorApplicationPage() {
  const navigate = useNavigate();
  const { isInstructor } = useAuth();
  const { data: appData, isLoading: appLoading } = useMyMentorApplicationQuery();
  const { data: catalogSkills } = useCatalogSkillsQuery();
  const submitMutation = useSubmitMentorApplicationMutation();

  const [experience, setExperience] = useState("");
  const [motivation, setMotivation] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const toggleSkill = (id: string) => {
    setSelectedSkills((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!experience.trim() || !motivation.trim()) return;

    await submitMutation.mutateAsync({
      teachSkillIds: selectedSkills,
      experience: experience.trim(),
      motivation: motivation.trim(),
    });
  };

  if (isInstructor) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 mx-auto">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold">You are already an Instructor!</h1>
        <p className="text-sm text-muted-foreground">
          You have full access to create mentor offerings, set prices, and accept learner requests.
        </p>
        <Button asChild className="rounded-xl mt-2 font-semibold">
          <Link to="/instructor">Go to Instructor Dashboard</Link>
        </Button>
      </div>
    );
  }

  if (appData && appData.status === "PENDING") {
    return (
      <div className="mx-auto max-w-xl p-8 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-700 mx-auto">
          <Clock className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold">Application Under Review</h1>
        <p className="text-sm text-muted-foreground">
          Your instructor application has been submitted and is currently being reviewed by platform
          administrators. You will receive a notification once your role is approved.
        </p>
        <Button asChild variant="outline" className="rounded-xl mt-2">
          <Link to="/">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <Badge className="bg-violet-500/15 text-violet-700 border-violet-500/30 rounded-full px-3 py-1">
          <Sparkles className="mr-1 h-3 w-3" /> Instructor Onboarding
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Teach what you love. Earn skill points.
        </h1>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Apply to become a verified peer instructor on SkillBridge. Help your peers, gain
          leadership experience, and earn 10–50 points per session.
        </p>
      </div>

      <Card className="rounded-3xl border-border/70 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Instructor Application Form</CardTitle>
          <CardDescription className="text-xs">
            Tell us about your background, subjects you're confident teaching, and your teaching
            philosophy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Skills selection */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Select subjects you want to teach
              </Label>
              <div className="flex flex-wrap gap-2 pt-1">
                {(
                  catalogSkills || [
                    { id: "s-react", name: "React" },
                    { id: "s-java", name: "Java" },
                    { id: "s-sql", name: "SQL" },
                    { id: "s-python", name: "Python" },
                    { id: "s-dsa", name: "Data Structures" },
                    { id: "s-uiux", name: "UI/UX" },
                    { id: "s-calc", name: "Calculus" },
                  ]
                ).map((skill: any) => {
                  const isSelected = selectedSkills.includes(skill.id);
                  return (
                    <button
                      type="button"
                      key={skill.id}
                      onClick={() => toggleSkill(skill.id)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition border ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted border-border"
                      }`}
                    >
                      {skill.name} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Teaching / Academic Experience</Label>
              <Textarea
                placeholder="Mention courses you excelled in (e.g. A in CS201), TA experience, projects built, or previous tutoring..."
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                rows={3}
                className="rounded-xl"
                required
              />
            </div>

            {/* Motivation */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Why do you want to be a mentor?</Label>
              <Textarea
                placeholder="How do you approach explaining difficult concepts to classmates?"
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                rows={3}
                className="rounded-xl"
                required
              />
            </div>

            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-xs text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/20 dark:text-sky-200 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="h-4 w-4 text-sky-600" />
                <span>Admin Review Policy</span>
              </div>
              <p className="text-[11px] leading-relaxed text-sky-800/80 dark:text-sky-300/80">
                Applications are reviewed within 24 hours. Once approved, your account receives the
                MENTOR authority, enabling your instructor dashboard and offering creation.
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={submitMutation.isPending}
              className="w-full rounded-2xl font-bold shadow-md h-12"
            >
              {submitMutation.isPending
                ? "Submitting Application..."
                : "Submit Instructor Application"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
