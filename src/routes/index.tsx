import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarCheck, Coins, Pencil, Users } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { sessionsService } from "@/services/sessions.service";
import { skillsService } from "@/services/skills.service";
import { walletService } from "@/services/wallet.service";
import type { UserSkillResponse } from "@/types/api";
import { userDisplayName, userInitials } from "@/lib/auth-validation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardExtras } from "@/components/dashboard-extras";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Profile · SkillBridge" }] }),
  component: Profile,
});
export function Profile() {
  const { user } = useAuth();
  const wallet = useQuery({
    queryKey: ["wallet"],
    queryFn: walletService.getBalance,
    staleTime: 30000,
  });
  const skills = useQuery({
    queryKey: ["skills"],
    queryFn: () => skillsService.getUserSkills(),
    staleTime: 60000,
  });
  const sessions = useQuery({
    queryKey: ["sessions"],
    queryFn: () => sessionsService.listSessions(),
    staleTime: 30000,
  });
  const loading = wallet.isLoading || skills.isLoading || sessions.isLoading;
  const error = wallet.error ?? skills.error ?? sessions.error;
  const s = sessions.data ?? [];
  const active = s.filter((x) => ["ACCEPTED", "SCHEDULED", "STARTED"].includes(x.status)).length;
  const completed = s.filter((x) => x.status === "COMPLETED").length;
  const displayName = userDisplayName(user);
  const bio = user && "bio" in user ? user.bio : undefined;
  const major = user && "major" in user ? user.major : undefined;
  const yearOfStudy = user && "yearOfStudy" in user ? user.yearOfStudy : undefined;
  const avatarUrl = user && "avatarUrl" in user ? user.avatarUrl : undefined;
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-8">
      <h1 className="sr-only">Profile</h1>
      {loading && <p role="status">Loading profile…</p>}
      {error && (
        <p role="alert" className="text-destructive">
          {error instanceof Error ? error.message : "Could not load your profile."}
          <Button
            variant="link"
            onClick={() => {
              wallet.refetch();
              skills.refetch();
              sessions.refetch();
            }}
          >
            Retry
          </Button>
        </p>
      )}
      {!loading && !error && (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,2fr)] xl:grid-cols-[minmax(300px,0.75fr)_minmax(0,2.25fr)]">
          <aside aria-label="Profile details" className="space-y-6">
            <Card className="overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-primary via-brand-bright to-accent" />
              <CardContent className="relative px-6 pb-6">
                <div className="-mt-12 flex items-end justify-between gap-3">
                  <Avatar className="h-24 w-24 border-4 border-card shadow-sm">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                      {userInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <Button asChild size="sm" variant="outline" className="mb-1 shrink-0">
                    <Link to="/settings">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit profile
                    </Link>
                  </Button>
                </div>
                <div className="mt-4 min-w-0">
                  <h2 className="truncate text-2xl font-bold">{displayName}</h2>
                  <p className="text-sm text-muted-foreground">
                    {[major, yearOfStudy ? `Year ${yearOfStudy}` : null]
                      .filter(Boolean)
                      .join(" · ") || "SkillBridge member"}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {bio?.trim() || "Add an introduction from Settings."}
                </p>
              </CardContent>
            </Card>
            <SkillCard
              title="Skills I can teach"
              icon={Users}
              skills={(skills.data ?? []).filter((s) => s.direction === "TEACH")}
            />
            <SkillCard
              title="Skills I want to learn"
              icon={BookOpen}
              skills={(skills.data ?? []).filter((s) => s.direction === "LEARN")}
            />
          </aside>
          <section aria-label="Account overview" className="min-w-0 space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric
                icon={Coins}
                label="Available points"
                value={wallet.data?.availablePoints ?? 0}
              />
              <Metric icon={Coins} label="Points held" value={wallet.data?.heldPoints ?? 0} />
              <Metric icon={CalendarCheck} label="Active sessions" value={active} />
              <Metric icon={CalendarCheck} label="Completed sessions" value={completed} />
            </div>
            <DashboardExtras skills={skills.data ?? []} />
          </section>
        </div>
      )}
    </div>
  );
}
function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Coins;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <Icon className="h-6 w-6 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
function SkillCard({
  title,
  icon: Icon,
  skills,
}: {
  title: string;
  icon: typeof Users;
  skills: UserSkillResponse[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <Badge key={s.id} variant="secondary" className="py-1">
            {s.skill.name} · {s.level.toLowerCase()}
          </Badge>
        ))}
        {!skills.length && <p className="text-sm text-muted-foreground">No skills added yet.</p>}
      </CardContent>
    </Card>
  );
}
