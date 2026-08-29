import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Star, Plus, Check, Play, BookOpen, Users, Compass, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { requireAuth } from "@/lib/route-guards";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useSkillDetailQuery } from "@/hooks/api/use-skills";
import { useMentorsSearchQuery } from "@/hooks/api/use-mentors";

export const Route = createFileRoute("/skill/$skillId")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Skill Details — SkillBridge" },
      {
        name: "description",
        content: "Explore skill details, verified peer mentors, and community learning resources.",
      },
    ],
  }),
  component: SkillDetailPage,
});

function SkillDetailPage() {
  const { skillId } = Route.useParams();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const { data: skillData, isLoading } = useSkillDetailQuery(skillId);
  const { data: mentorsData } = useMentorsSearchQuery();

  const title =
    skillData?.name ||
    skillId
      .replace(/^skill-/, "")
      .replace(/-/g, " ")
      .toUpperCase();
  const description =
    skillData?.description ||
    `Master ${title} with verified peer mentors. Learn fundamentals, best practices, real-world project applications, and exam preparation with senior students.`;
  const category = skillData?.category?.name || "Computer Science & Engineering";

  const inWatchlist = isInWatchlist(skillId);

  const handleToggle = () => {
    toggleWatchlist({
      type: "SKILL",
      targetId: skillId,
      title,
      subtitle: category,
      rating: 4.9,
    });
  };

  const relatedMentors = useMemo(() => {
    if (mentorsData && mentorsData.length > 0) {
      return mentorsData.slice(0, 3);
    }
    return [
      {
        id: "m-priya",
        name: "Priya Anand",
        major: "Computer Science, Year 4",
        initials: "PA",
        averageRating: 4.9,
        reviewCount: 32,
        hourlyRatePoints: 50,
      },
      {
        id: "m-marcus",
        name: "Marcus Delgado",
        major: "Mathematics, Year 3",
        initials: "MD",
        averageRating: 4.8,
        reviewCount: 24,
        hourlyRatePoints: 40,
      },
    ];
  }, [mentorsData]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Breadcrumbs & Back */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/browse" className="hover:underline flex items-center gap-1">
          <Compass className="h-3.5 w-3.5" /> Browse Skills
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{title}</span>
      </div>

      {/* Hero Header (Netflix Title Page Style) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-10 text-white shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-sky-500 text-white border-0">{category}</Badge>
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-400">
              <Star className="h-4 w-4 fill-amber-400" />
              <span>4.9 / 5.0 Rating</span>
            </div>
            <span className="text-xs text-slate-300">• 12 Verified Instructors</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{title}</h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{description}</p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="rounded-2xl font-bold bg-white text-slate-950 hover:bg-slate-100 shadow-md"
            >
              <Link to="/mentors">
                <Play className="mr-2 h-4 w-4 fill-current" /> Book a Mentor Session
              </Link>
            </Button>
            <Button
              onClick={handleToggle}
              variant="outline"
              size="lg"
              className="rounded-2xl border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              {inWatchlist ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-emerald-400" /> In My List
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Add to My List
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mentors Teaching This Skill */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Mentors Teaching {title}</h2>
          <p className="text-xs text-muted-foreground">
            Connect for 1-on-1 sessions, code walkthroughs, and exam prep.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {relatedMentors.map((m: any) => (
            <Card
              key={m.id}
              className="rounded-2xl border-border/70 shadow-sm hover:shadow-md transition"
            >
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-11 w-11 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                      {m.initials || "PM"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-base">{m.name || m.displayName}</h3>
                    <p className="text-xs text-muted-foreground">
                      {m.major || "University Student"}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-medium mt-0.5">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span>{m.averageRating ?? 4.9}</span>
                      <span className="text-muted-foreground">({m.reviewCount ?? 18} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    From <strong className="text-foreground">{m.hourlyRatePoints ?? 40} Pts</strong>{" "}
                    / session
                  </span>
                  <Button asChild size="sm" className="rounded-xl text-xs">
                    <Link to="/mentors">Request Session</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
