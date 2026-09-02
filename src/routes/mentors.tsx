import { createFileRoute } from "@tanstack/react-router";
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

export const Route = createFileRoute("/mentors")({
  head: () => ({
    meta: [
      { title: "SkillBridge" },
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

type Skill = { name: string; level: Level };

type Mentor = {
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

// The logged-in user's teachable skills — used to compute exchange matches.
const mySkills: Skill[] = [
  { name: "Java", level: "Advanced" },
  { name: "SQL", level: "Intermediate" },
  { name: "Data Structures", level: "Advanced" },
  { name: "Git", level: "Intermediate" },
];

const mentors: Mentor[] = [
  {
    id: "priya",
    name: "Priya Anand",
    initials: "PA",
    major: "Computer Science, Year 4",
    rating: 4.9,
    reviews: 32,
    cost: 50,
    modes: ["points", "exchange", "volunteer"],
    teach: [
      { name: "React", level: "Advanced" },
      { name: "TypeScript", level: "Advanced" },
      { name: "UI/UX", level: "Intermediate" },
    ],
    wants: [
      { name: "Java", level: "Intermediate" },
      { name: "System Design", level: "Beginner" },
    ],
  },
  {
    id: "marcus",
    name: "Marcus Delgado",
    initials: "MD",
    major: "Mathematics, Year 3",
    rating: 4.8,
    reviews: 24,
    cost: 40,
    modes: ["points", "exchange"],
    teach: [
      { name: "Linear Algebra", level: "Advanced" },
      { name: "Calculus", level: "Advanced" },
      { name: "Python", level: "Intermediate" },
    ],
    wants: [
      { name: "SQL", level: "Beginner" },
      { name: "Data Structures", level: "Intermediate" },
    ],
  },
  {
    id: "lena",
    name: "Lena Karlsson",
    initials: "LK",
    major: "English Literature, Year 2",
    rating: 4.7,
    reviews: 18,
    cost: 30,
    modes: ["points", "volunteer"],
    teach: [
      { name: "Essay Writing", level: "Advanced" },
      { name: "Academic English", level: "Intermediate" },
    ],
    wants: [{ name: "Public Speaking", level: "Beginner" }],
  },
  {
    id: "kenji",
    name: "Kenji Watanabe",
    initials: "KW",
    major: "Design, Year 3",
    rating: 4.9,
    reviews: 41,
    cost: 55,
    modes: ["points", "exchange"],
    teach: [
      { name: "UI/UX", level: "Advanced" },
      { name: "Figma", level: "Advanced" },
    ],
    wants: [
      { name: "Git", level: "Beginner" },
      { name: "React", level: "Beginner" },
    ],
  },
  {
    id: "amara",
    name: "Amara Okafor",
    initials: "AO",
    major: "Business, Year 4",
    rating: 4.6,
    reviews: 12,
    cost: 35,
    modes: ["points", "volunteer"],
    teach: [
      { name: "Public Speaking", level: "Advanced" },
      { name: "Marketing", level: "Intermediate" },
    ],
    wants: [{ name: "SQL", level: "Beginner" }],
  },
  {
    id: "diego",
    name: "Diego Ramirez",
    initials: "DR",
    major: "Electrical Engineering, Year 4",
    rating: 4.8,
    reviews: 27,
    cost: 45,
    modes: ["points", "exchange", "volunteer"],
    teach: [
      { name: "Circuits", level: "Advanced" },
      { name: "MATLAB", level: "Intermediate" },
    ],
    wants: [
      { name: "Java", level: "Beginner" },
      { name: "Git", level: "Beginner" },
    ],
  },
];

const times = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

function levelClasses(level: Level) {
  switch (level) {
    case "Advanced":
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60";
    case "Intermediate":
      return "border-brand-bright/30 bg-accent text-primary dark:border-brand-bright/50 dark:bg-accent dark:text-accent-foreground";
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
  const [selected, setSelected] = useState<Mentor | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mentors.filter((m) => {
      if (mode !== "all" && !m.modes.includes(mode)) return false;
      if (level !== "all" && !m.teach.some((s) => s.level === level)) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.major.toLowerCase().includes(q) ||
        m.teach.some((s) => s.name.toLowerCase().includes(q))
      );
    });
  }, [query, level, mode]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-primary">Skill Exchange</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Find a mentor</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse peers by skill and book a session with points, an exchange, or as a volunteer.
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
      {filtered.length === 0 ? (
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

      <RequestSessionDialog mentor={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function MentorCard({ mentor, onRequest }: { mentor: Mentor; onRequest: () => void }) {
  return (
    <Card className="flex h-full flex-col rounded-xl border-border/70 shadow-sm transition hover:shadow-md">
      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
          <Avatar className="h-12 w-12 shrink-0 ring-2 ring-accent">
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
                className="rounded-full border-brand-bright/30 bg-accent px-2 py-0.5 text-[11px] font-medium text-primary dark:border-brand-bright/50 dark:bg-accent dark:text-accent-foreground"
              >
                <M.icon className="mr-1 h-3 w-3" />
                {M.label}
              </Badge>
            );
          })}
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Can teach
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

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Wants to learn
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

        <div className="mt-auto flex items-center justify-between border-t border-border/70 pt-4">
          <div className="text-xs text-muted-foreground">
            From <span className="font-semibold text-foreground">{mentor.cost} Pts</span> / session
          </div>
          <Button size="sm" className="rounded-lg" onClick={onRequest}>
            Request Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RequestSessionDialog({ mentor, onClose }: { mentor: Mentor | null; onClose: () => void }) {
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | undefined>();
  const [tab, setTab] = useState<Mode>("points");
  const [exchangeSkill, setExchangeSkill] = useState<string | undefined>();
  const [note, setNote] = useState("");

  const open = !!mentor;

  // Reset local state when the mentor changes.
  const key = mentor?.id ?? "none";

  const matchingSkills = useMemo(() => {
    if (!mentor) return [] as string[];
    const wantNames = new Set(mentor.wants.map((w) => w.name.toLowerCase()));
    return mySkills.filter((s) => wantNames.has(s.name.toLowerCase())).map((s) => s.name);
  }, [mentor]);

  const canSubmit =
    !!date &&
    !!time &&
    (tab === "points" || tab === "volunteer" || (tab === "exchange" && !!exchangeSkill));

  const handleSubmit = () => {
    if (!mentor || !canSubmit) return;
    const modeLabel =
      tab === "points"
        ? `${mentor.cost} pts (escrow)`
        : tab === "exchange"
          ? `Exchange: ${exchangeSkill}`
          : "Volunteer (free)";
    toast.success(`Request sent to ${mentor.name}`, {
      description: `${format(date!, "PPP")} at ${time} · ${modeLabel}`,
    });
    // Reset
    setDate(undefined);
    setTime(undefined);
    setTab("points");
    setExchangeSkill(undefined);
    setNote("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent key={key} className="max-h-[90vh] overflow-y-auto rounded-xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Session with {mentor?.name ?? ""}</DialogTitle>
          <DialogDescription>
            Choose a time, pick a payment mode, and add a note for your mentor.
          </DialogDescription>
        </DialogHeader>

        {/* Date + time */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Preferred date</Label>
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
            <Label className="text-xs font-medium">Time slot</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                {times.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Request mode</Label>
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

            <TabsContent value="points" className="mt-3">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
                <div className="flex items-start gap-2">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="min-w-0 text-xs">
                    <p className="font-semibold text-amber-800 dark:text-amber-200">
                      {mentor?.cost ?? 0} points will be locked in Escrow
                    </p>
                    <p className="mt-0.5 text-amber-700/90 dark:text-amber-300/90">
                      Points transfer to {mentor?.name.split(" ")[0]} only after the session is
                      marked complete by both of you.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="exchange" className="mt-3">
              {matchingSkills.length > 0 ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Select a skill you possess that {mentor?.name.split(" ")[0]} wants to learn
                  </Label>
                  <Select value={exchangeSkill} onValueChange={setExchangeSkill}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Choose a skill to offer" />
                    </SelectTrigger>
                    <SelectContent>
                      {matchingSkills.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <Alert
                  variant="default"
                  className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
                >
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertTitle>No matching skill exchange found</AlertTitle>
                  <AlertDescription className="text-amber-800/90 dark:text-amber-300/90">
                    Please use Skill Points or Volunteer mode.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="volunteer" className="mt-3">
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                <div className="flex items-center gap-2 text-xs">
                  <HandHeart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium text-emerald-800 dark:text-emerald-200">
                    Volunteer mode — no points exchanged
                  </span>
                </div>
                <Badge className="rounded-full bg-emerald-600 text-white hover:bg-emerald-600">
                  Cost: FREE (0 Pts)
                </Badge>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Note */}
        <div className="space-y-1.5">
          <Label htmlFor="note" className="text-xs font-medium">
            Message to mentor
          </Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={`Hi ${mentor?.name.split(" ")[0] ?? ""}, I'd love your help with…`}
            rows={3}
            className="rounded-lg"
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-lg">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit} className="rounded-lg">
            <Send className="mr-1.5 h-4 w-4" />
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
