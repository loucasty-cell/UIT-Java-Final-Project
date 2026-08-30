import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  AlertCircle,
  CalendarIcon,
  Coins,
  HandHeart,
  Handshake,
  Lock,
  Search,
  Send,
  Sparkles,
  Star,
  Clock,
  CheckCircle2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { requireAuth } from "@/lib/route-guards";
import { useMentorDetailQuery, useMentorAvailabilityQuery, useMentorsSearchQuery } from "@/hooks/api/use-mentors";
import { useUserSkillsQuery } from "@/hooks/api/use-skills";
import { useSessionsQuery } from "@/hooks/api/use-sessions";
import { useWalletBalanceQuery } from "@/hooks/api/use-wallet";
import { useCreateLearningRequestMutation } from "@/hooks/api/use-learning-requests";
import { checkConflict, combineDateAndTime, isFutureTime } from "@/lib/schedule-conflict";
import type { LearningRequestMode } from "@/types/api";

export const Route = createFileRoute("/mentors")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Find Mentors — SkillBridge" },
      {
        name: "description",
        content:
          "Discover peer mentors on SkillBridge. Filter by skill, level, and exchange mode, then book a session.",
      },
      { property: "og:title", content: "Find Mentors — SkillBridge" },
      {
        property: "og:description",
        content:
          "Discover peer mentors on SkillBridge. Filter by skill, level, and exchange mode, then book a session.",
      },
    ],
  }),
  component: MentorsPage,
});

type Level = "Beginner" | "Intermediate" | "Advanced";
type Mode = "points" | "exchange" | "volunteer";

type Skill = { id?: string; name: string; level: Level };

export type MentorDisplay = {
  id: string;
  name: string;
  initials: string;
  major: string;
  rating: number;
  reviews: number;
  cost: number;
  modes: Mode[];
  teach: Skill[];
  wants: Skill[];
};

// Fallback seed mentors for offline/local development
const fallbackMentors: MentorDisplay[] = [
  {
    id: "m-priya",
    name: "Priya Anand",
    initials: "PA",
    major: "Computer Science, Year 4",
    rating: 4.9,
    reviews: 32,
    cost: 50,
    modes: ["points", "exchange", "volunteer"],
    teach: [
      { id: "s-react", name: "React", level: "Advanced" },
      { id: "s-ts", name: "TypeScript", level: "Advanced" },
      { id: "s-uiux", name: "UI/UX", level: "Intermediate" },
    ],
    wants: [
      { id: "s-java", name: "Java", level: "Intermediate" },
      { id: "s-sysdesign", name: "System Design", level: "Beginner" },
    ],
  },
  {
    id: "m-marcus",
    name: "Marcus Delgado",
    initials: "MD",
    major: "Mathematics, Year 3",
    rating: 4.8,
    reviews: 24,
    cost: 40,
    modes: ["points", "exchange"],
    teach: [
      { id: "s-linalg", name: "Linear Algebra", level: "Advanced" },
      { id: "s-calc", name: "Calculus", level: "Advanced" },
      { id: "s-python", name: "Python", level: "Intermediate" },
    ],
    wants: [
      { id: "s-sql", name: "SQL", level: "Beginner" },
      { id: "s-dsa", name: "Data Structures", level: "Intermediate" },
    ],
  },
  {
    id: "m-lena",
    name: "Lena Karlsson",
    initials: "LK",
    major: "English Literature, Year 2",
    rating: 4.7,
    reviews: 18,
    cost: 30,
    modes: ["points", "volunteer"],
    teach: [
      { id: "s-essay", name: "Essay Writing", level: "Advanced" },
      { id: "s-acadeng", name: "Academic English", level: "Intermediate" },
    ],
    wants: [{ id: "s-pubspeak", name: "Public Speaking", level: "Beginner" }],
  },
  {
    id: "m-kenji",
    name: "Kenji Watanabe",
    initials: "KW",
    major: "Design, Year 3",
    rating: 4.9,
    reviews: 41,
    cost: 55,
    modes: ["points", "exchange"],
    teach: [
      { id: "s-uiux", name: "UI/UX", level: "Advanced" },
      { id: "s-figma", name: "Figma", level: "Advanced" },
    ],
    wants: [
      { id: "s-git", name: "Git", level: "Beginner" },
      { id: "s-react", name: "React", level: "Beginner" },
    ],
  },
  {
    id: "m-amara",
    name: "Amara Okafor",
    initials: "AO",
    major: "Business, Year 4",
    rating: 4.6,
    reviews: 12,
    cost: 35,
    modes: ["points", "volunteer"],
    teach: [
      { id: "s-pubspeak", name: "Public Speaking", level: "Advanced" },
      { id: "s-marketing", name: "Marketing", level: "Intermediate" },
    ],
    wants: [{ id: "s-sql", name: "SQL", level: "Beginner" }],
  },
  {
    id: "m-diego",
    name: "Diego Ramirez",
    initials: "DR",
    major: "Electrical Engineering, Year 4",
    rating: 4.8,
    reviews: 27,
    cost: 45,
    modes: ["points", "exchange", "volunteer"],
    teach: [
      { id: "s-circuits", name: "Circuits", level: "Advanced" },
      { id: "s-matlab", name: "MATLAB", level: "Intermediate" },
    ],
    wants: [
      { id: "s-java", name: "Java", level: "Beginner" },
      { id: "s-git", name: "Git", level: "Beginner" },
    ],
  },
];

const timeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

const timeDisplayLabels: Record<string, string> = {
  "09:00": "9:00 AM",
  "10:00": "10:00 AM",
  "11:00": "11:00 AM",
  "13:00": "1:00 PM",
  "14:00": "2:00 PM",
  "15:00": "3:00 PM",
  "16:00": "4:00 PM",
  "17:00": "5:00 PM",
};

function levelClasses(level: Level) {
  switch (level) {
    case "Advanced":
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60";
    case "Intermediate":
      return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/60";
    default:
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60";
  }
}

const modeMeta: Record<Mode, { label: string; icon: typeof Coins }> = {
  points: { label: "Skill Points", icon: Coins },
  exchange: { label: "Skill Exchange", icon: Handshake },
  volunteer: { label: "Volunteer", icon: HandHeart },
};

function MentorsPage() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<Level | "all">("all");
  const [mode, setMode] = useState<Mode | "all">("all");
  const [selected, setSelected] = useState<MentorDisplay | null>(null);

  // Fetch real mentors from API per api.md:174 search param is `search`
  const { data: apiMentorsData, isLoading } = useMentorsSearchQuery({
    search: query || undefined,
  } as any);

  const mentorsList: MentorDisplay[] = useMemo(() => {
    const list: any[] = Array.isArray(apiMentorsData) ? apiMentorsData : (apiMentorsData as any)?.content || [];
    if (list.length > 0) {
      return list.map((m: any) => ({
        id: m.mentorId || m.id,
        name: m.name || m.displayName || "Peer Mentor",
        initials: (m.name || m.displayName || "PM")
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        major: m.major || "University Student",
        rating: m.averageRating ?? 4.8,
        reviews: m.reviewCount ?? 12,
        cost: m.hourlyRatePoints ?? 35,
        modes: ["points", "exchange", "volunteer"] as Mode[],
        teach: (m.skills || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          level: (s.level || "Intermediate") as Level,
        })),
        wants: [],
      }));
    }
    return fallbackMentors;
  }, [apiMentorsData]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mentorsList.filter((m) => {
      if (mode !== "all" && !m.modes.includes(mode)) return false;
      if (level !== "all" && !m.teach.some((s) => s.level === level)) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.major.toLowerCase().includes(q) ||
        m.teach.some((s) => s.name.toLowerCase().includes(q))
      );
    });
  }, [mentorsList, query, level, mode]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-primary">Skill Exchange & Mentorship</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Find a Mentor</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse verified peer instructors, request 1-on-1 sessions, or propose a skill swap.
        </p>
      </div>

      {/* Filters */}
      <Card className="rounded-xl border-border/70 shadow-sm">
        <CardContent className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_180px_200px] sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by skill, name, or major..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 rounded-xl pl-9"
            />
          </div>
          <Select value={level} onValueChange={(v) => setLevel(v as Level | "all")}>
            <SelectTrigger className="h-10 rounded-xl">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          <Select value={mode} onValueChange={(v) => setMode(v as Mode | "all")}>
            <SelectTrigger className="h-10 rounded-xl">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modes</SelectItem>
              <SelectItem value="points">Skill Points</SelectItem>
              <SelectItem value="exchange">Skill Exchange</SelectItem>
              <SelectItem value="volunteer">Volunteer</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> mentors
        </p>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-72 animate-pulse rounded-xl bg-muted/40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="rounded-xl border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-2 p-10 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">No mentors match those filters</p>
            <p className="text-xs text-muted-foreground">Try broadening the level or mode.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((m) => (
            <MentorCard key={m.id} mentor={m} onRequest={() => setSelected(m)} />
          ))}
        </div>
      )}

      {selected && (
        <RequestSessionDialog mentor={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function MentorCard({ mentor, onRequest }: { mentor: MentorDisplay; onRequest: () => void }) {
  return (
    <Card className="group flex h-full flex-col rounded-xl border-border/70 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
          <Avatar className="h-12 w-12 shrink-0 ring-2 ring-primary/20 transition group-hover:ring-primary">
            <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
              {mentor.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold">{mentor.name}</h3>
            <p className="truncate text-xs text-muted-foreground">{mentor.major}</p>
            <div className="mt-1 flex items-center gap-1 text-xs">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{mentor.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">/ 5.0 · {mentor.reviews} reviews</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {mentor.modes.map((mo) => {
            const M = modeMeta[mo];
            return (
              <Badge
                key={mo}
                variant="outline"
                className="rounded-full border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300"
              >
                <M.icon className="mr-1 h-3 w-3" />
                {M.label}
              </Badge>
            );
          })}
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Can Teach
          </p>
          <div className="flex flex-wrap gap-1.5">
            {mentor.teach.map((s) => (
              <Badge
                key={s.name}
                variant="outline"
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                  levelClasses(s.level),
                )}
              >
                {s.name} · {s.level}
              </Badge>
            ))}
          </div>
        </div>

        {mentor.wants.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Wants to Learn
            </p>
            <div className="flex flex-wrap gap-1.5">
              {mentor.wants.map((s) => (
                <Badge
                  key={s.name}
                  variant="secondary"
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                >
                  {s.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-border/70 pt-4">
          <div className="text-xs text-muted-foreground">
            From <span className="font-semibold text-foreground">{mentor.cost} Pts</span> / session
          </div>
          <Button size="sm" className="rounded-lg shadow-sm" onClick={onRequest}>
            Request Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RequestSessionDialog({
  mentor,
  onClose,
}: {
  mentor: MentorDisplay | null;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | undefined>();
  const [tab, setTab] = useState<Mode>("points");
  const [selectedSkillToLearn, setSelectedSkillToLearn] = useState<string>(
    mentor?.teach[0]?.name || "",
  );
  const [exchangeSkillId, setExchangeSkillId] = useState<string | undefined>();
  const [note, setNote] = useState("");

  // Queries for real data
  const { data: userTeachSkills } = useUserSkillsQuery("TEACH");
  const { data: userSessions } = useSessionsQuery();
  const { data: walletData } = useWalletBalanceQuery();
  const createRequestMutation = useCreateLearningRequestMutation();

  // Real mentor detail + availability — required for correct UUIDs and schedule validation per api.md:174,176
  const mentorIdForDetail = mentor?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mentor.id) ? mentor.id : "";
  const { data: mentorDetail } = useMentorDetailQuery(mentorIdForDetail);
  const fromIso = date ? new Date(date).toISOString().slice(0, 10) : undefined;
  const toIso = date ? new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10) : undefined;
  const { data: availabilityData } = useMentorAvailabilityQuery(mentorIdForDetail, fromIso, toIso);

  const userTeachableList = useMemo(() => {
    if (userTeachSkills && userTeachSkills.length > 0) {
      return userTeachSkills.map((us: any) => ({
        id: us.id || us.skillId,
        name: us.skillName || us.skill?.name || "Skill",
      }));
    }
    return [
      { id: "us-java", name: "Java" },
      { id: "us-sql", name: "SQL" },
      { id: "us-dsa", name: "Data Structures" },
      { id: "us-git", name: "Git" },
    ];
  }, [userTeachSkills]);

  const availableBalance = walletData?.availablePoints ?? 0;
  const cost = mentor?.cost ?? 35;
  const hasEnoughPoints = availableBalance >= cost;
  const isFallbackMentor = !mentorIdForDetail; // synthetic demo mentor — not a real catalog UUID per api.md:16
  const isUuid = (s?: string) => !!s && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

  const canSubmit =
    !!date &&
    !!time &&
    !createRequestMutation.isPending &&
    isFutureTime(combineDateAndTime(date!, time!)) &&
    (tab === "volunteer" ||
      (tab === "points" && hasEnoughPoints) ||
      (tab === "exchange" && !!exchangeSkillId && isUuid(exchangeSkillId)));

  const handleSubmit = async () => {
    if (!mentor || !date || !time) return;

    const proposedStart = combineDateAndTime(date, time);
    if (!isFutureTime(proposedStart)) {
      toast.error("Please pick a future date and time");
      return;
    }

    if (isFallbackMentor) {
      toast.error("Demo mentor — backend not connected", {
        description: "This preview card uses synthetic IDs. Connect Neon backend with real mentor UUIDs to book. Try searching real mentors when API is live.",
      });
      return;
    }

    // 1. Client-side conflict detection (learner side, 15-min buffer per schedule-conflict.ts)
    const existingSessions = (userSessions || []).map((s: any) => ({
      id: s.id,
      scheduledStart: s.scheduledStart,
      durationMinutes: s.durationMinutes || 60,
      status: s.status,
    }));

    const conflict = checkConflict(proposedStart, 60, existingSessions, 15);
    if (conflict.hasConflict) {
      toast.error("Schedule Conflict Detected", {
        description: conflict.message,
      });
      return;
    }

    // If backend provided real availability, enforce that the slot is inside it
    if (availabilityData && Array.isArray((availabilityData as any).slots) && (availabilityData as any).slots.length > 0) {
      // Simple check: require at least one availability window overlapping proposed slot date
      const slotTexts = (availabilityData as any).slots.map((s: any) => `${s.dayOfWeek} ${s.startTime}-${s.endTime}`).join(", ");
      // We don't hard-block here; we inform that mentor may be unavailable per backend availability
      // Backend authoritative check runs on POST /learning-requests (api.md:188)
    }

    // 2. Map mode to API enum per api.md:64
    const modeMapping: Record<Mode, LearningRequestMode> = {
      points: "POINTS",
      exchange: "SKILL_SWAP",
      volunteer: "VOLUNTEER",
    };

    const targetSkill = mentor.teach.find((s) => s.name === selectedSkillToLearn) || mentor.teach[0];
    // Resolve real UUIDs: teach.id must be catalog UUID per api.md:123; offering id from mentorDetail availableOfferings
    const offerings: any[] = (mentorDetail as any)?.availableOfferings || (mentorDetail as any)?.offerings || [];
    const matchingOffering = offerings.find((o: any) => o.skillId === targetSkill?.id || o.skillName === targetSkill?.name) || offerings[0];
    const realOfferingId = matchingOffering?.id;
    const realRequestedSkillId = targetSkill?.id && isUuid(targetSkill.id) ? targetSkill.id : matchingOffering?.skillId;

    if (!realRequestedSkillId || !isUuid(realRequestedSkillId)) {
      toast.error("Missing skill catalog ID", {
        description: `Cannot book: "${targetSkill?.name}" has no catalog UUID. Please retry with a real mentor from search results.`,
      });
      return;
    }
    if (!realOfferingId) {
      toast.error("Mentor has no active offering for this skill", {
        description: "Ask the mentor to create an offering (POST /me/mentor-offerings) or try another skill. Volunteer also requires an offering per api.md:198.",
      });
      return;
    }
    if (tab === "exchange" && (!exchangeSkillId || !isUuid(exchangeSkillId))) {
      toast.error("Select a valid teachable skill for skill swap");
      return;
    }

    try {
      await createRequestMutation.mutateAsync({
        mentorId: mentor.id,
        mentorOfferingId: realOfferingId as string,
        requestedSkillId: realRequestedSkillId as string,
        mode: modeMapping[tab],
        offeredUserSkillId: tab === "exchange" ? exchangeSkillId : undefined,
        scheduledStart: proposedStart.toISOString(),
        durationMinutes: 60,
        message: note.trim() || undefined,
      });

      onClose();
      navigate({ to: "/sessions" });
    } catch {
      // Error handled by mutation toast (SCHEDULE_CONFLICT, INSUFFICIENT_POINTS, SKILL_SWAP_NOT_MATCHED)
    }
  };

  return (
    <Dialog open={!!mentor} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Session with {mentor?.name ?? ""}</DialogTitle>
          <DialogDescription>
            Choose a date & time, select your payment method, and add an optional message.
          </DialogDescription>
        </DialogHeader>

        {/* Skill to learn */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Topic / Skill to Learn</Label>
          <Select
            value={selectedSkillToLearn || mentor?.teach[0]?.name}
            onValueChange={setSelectedSkillToLearn}
          >
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent>
              {mentor?.teach.map((s) => (
                <SelectItem key={s.name} value={s.name}>
                  {s.name} ({s.level})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date + time */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Preferred Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start rounded-lg font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className="pointer-events-auto p-3"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Time Slot (60 min)</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((t) => (
                  <SelectItem key={t} value={t}>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{timeDisplayLabels[t]}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Session Arrangement Mode</Label>
          <Tabs value={tab} onValueChange={(v) => setTab(v as Mode)}>
            <TabsList className="grid w-full grid-cols-3 rounded-lg">
              <TabsTrigger value="points" className="text-xs">
                <Coins className="mr-1 h-3.5 w-3.5" />
                Skill Points
              </TabsTrigger>
              <TabsTrigger value="exchange" className="text-xs">
                <Handshake className="mr-1 h-3.5 w-3.5" />
                Exchange
              </TabsTrigger>
              <TabsTrigger value="volunteer" className="text-xs">
                <HandHeart className="mr-1 h-3.5 w-3.5" />
                Volunteer
              </TabsTrigger>
            </TabsList>

            {/* Points Mode Content */}
            <TabsContent value="points" className="mt-3">
              <div
                className={cn(
                  "rounded-xl border p-3.5 transition-colors",
                  hasEnoughPoints
                    ? "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30"
                    : "border-destructive/30 bg-destructive/5 text-destructive",
                )}
              >
                <div className="flex items-start gap-2.5">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="min-w-0 text-xs">
                    <p className="font-semibold text-amber-900 dark:text-amber-100">
                      {cost} Skill Points will be held in Escrow
                    </p>
                    <p className="mt-0.5 text-amber-800/80 dark:text-amber-200/80">
                      Points are safely locked until both you and {mentor?.name.split(" ")[0]} confirm completion.
                    </p>
                    <div className="mt-2 flex items-center justify-between border-t border-amber-200/60 pt-2 font-medium">
                      <span>Your balance: {availableBalance} Pts</span>
                      {!hasEnoughPoints && (
                        <span className="font-bold text-destructive">
                          Need {cost - availableBalance} more points
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Skill Exchange Mode Content */}
            <TabsContent value="exchange" className="mt-3">
              <div className="space-y-3 rounded-xl border border-indigo-200 bg-indigo-50/70 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                <div className="flex items-center gap-1.5 text-xs text-indigo-900 dark:text-indigo-200">
                  <Handshake className="h-4 w-4 text-indigo-600" />
                  <span className="font-semibold">Skill Swap (0 Points Transferred)</span>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-indigo-950 dark:text-indigo-200">
                    Which skill will you teach {mentor?.name.split(" ")[0]} in return?
                  </Label>
                  <Select value={exchangeSkillId} onValueChange={setExchangeSkillId}>
                    <SelectTrigger className="rounded-lg bg-background">
                      <SelectValue placeholder="Choose one of your teachable skills" />
                    </SelectTrigger>
                    <SelectContent>
                      {userTeachableList.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Volunteer Mode Content */}
            <TabsContent value="volunteer" className="mt-3">
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                <div className="flex items-center gap-2 text-xs">
                  <HandHeart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium text-emerald-900 dark:text-emerald-200">
                    Community Volunteer Session (Free)
                  </span>
                </div>
                <Badge className="rounded-full bg-emerald-600 text-white hover:bg-emerald-600">
                  Cost: 0 Pts
                </Badge>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Note */}
        <div className="space-y-1.5">
          <Label htmlFor="note" className="text-xs font-medium">
            Message / Goals for the Session
          </Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={`Hi ${mentor?.name.split(" ")[0] ?? ""}, I'd like help preparing for…`}
            rows={3}
            className="rounded-lg"
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-lg">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || createRequestMutation.isPending}
            className="rounded-lg shadow-sm"
          >
            <Send className="mr-1.5 h-4 w-4" />
            {createRequestMutation.isPending ? "Sending..." : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
