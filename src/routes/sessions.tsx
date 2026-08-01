import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Clock,
  ExternalLink,
  CheckCircle2,
  Star,
  Flag,
  Coins,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/sessions")({
  head: () => ({
    meta: [
      { title: "My Sessions — SkillBridge" },
      {
        name: "description",
        content:
          "Manage active, pending, completed, and disputed peer-mentoring sessions with escrow-backed point transfers.",
      },
      { property: "og:title", content: "My Sessions — SkillBridge" },
      {
        property: "og:description",
        content: "Escrow-protected sessions and reviews on SkillBridge.",
      },
    ],
  }),
  component: SessionsPage,
});

type Session = {
  id: string;
  counterpart: string;
  initials: string;
  role: "Mentor" | "Learner";
  date: string;
  time: string;
  mode: string;
  points: number;
  status: "SCHEDULED" | "PENDING" | "COMPLETED" | "DISPUTED";
  meetUrl?: string;
};

const ACTIVE: Session[] = [
  {
    id: "s1",
    counterpart: "Priya Nair",
    initials: "PN",
    role: "Mentor",
    date: "Jul 24, 2026",
    time: "3:00 PM",
    mode: "Skill Points",
    points: 50,
    status: "SCHEDULED",
    meetUrl: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: "s2",
    counterpart: "Marcus Lee",
    initials: "ML",
    role: "Learner",
    date: "Jul 26, 2026",
    time: "6:30 PM",
    mode: "Skill Exchange",
    points: 0,
    status: "SCHEDULED",
    meetUrl: "https://meet.google.com/xyz-1234-lmn",
  },
];

const PENDING: Session[] = [
  {
    id: "p1",
    counterpart: "Aisha Khan",
    initials: "AK",
    role: "Mentor",
    date: "Jul 29, 2026",
    time: "5:00 PM",
    mode: "Skill Points",
    points: 40,
    status: "PENDING",
  },
];

const COMPLETED: Session[] = [
  {
    id: "c1",
    counterpart: "Diego Martinez",
    initials: "DM",
    role: "Mentor",
    date: "Jul 15, 2026",
    time: "4:00 PM",
    mode: "Skill Points",
    points: 30,
    status: "COMPLETED",
  },
  {
    id: "c2",
    counterpart: "Sara Wu",
    initials: "SW",
    role: "Learner",
    date: "Jul 10, 2026",
    time: "2:00 PM",
    mode: "Volunteer",
    points: 0,
    status: "COMPLETED",
  },
];

const DISPUTED: Session[] = [
  {
    id: "d1",
    counterpart: "Jordan Blake",
    initials: "JB",
    role: "Mentor",
    date: "Jul 08, 2026",
    time: "7:00 PM",
    mode: "Skill Points",
    points: 25,
    status: "DISPUTED",
  },
];

function statusBadge(status: Session["status"]) {
  switch (status) {
    case "SCHEDULED":
      return (
        <Badge className="border-amber-500/30 bg-amber-500/15 text-amber-700 hover:bg-amber-500/15 dark:text-amber-400">
          SCHEDULED
        </Badge>
      );
    case "PENDING":
      return (
        <Badge className="border-blue-500/30 bg-blue-500/15 text-blue-700 hover:bg-blue-500/15 dark:text-blue-400">
          PENDING
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400">
          COMPLETED
        </Badge>
      );
    case "DISPUTED":
      return (
        <Badge className="border-rose-500/30 bg-rose-500/15 text-rose-700 hover:bg-rose-500/15 dark:text-rose-400">
          DISPUTED
        </Badge>
      );
  }
}

function SessionsPage() {
  const [completingId, setCompletingId] = useState<string | null>(null);
  const active = ACTIVE.find((s) => s.id === completingId);

  return (
    <div className="mx-auto w-full max-w-7xl p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Sessions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track escrow-protected sessions, reviews, and disputes.
        </p>
      </div>

      {/* Auto-complete warning banner */}
      <Alert className="mb-6 border-amber-500/40 bg-amber-500/10">
        <Clock className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 dark:text-amber-300">
          ⏳ Auto-complete pending
        </AlertTitle>
        <AlertDescription className="text-amber-800/90 dark:text-amber-200/90">
          Session on July 20 marked complete by mentor. Points will
          auto-transfer in 18 hours if no dispute is raised.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-4">
          <TabsTrigger value="active">Active Sessions</TabsTrigger>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="disputed">Disputed</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6 space-y-4">
          {ACTIVE.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              onComplete={() => setCompletingId(s.id)}
            />
          ))}
        </TabsContent>
        <TabsContent value="pending" className="mt-6 space-y-4">
          {PENDING.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </TabsContent>
        <TabsContent value="completed" className="mt-6 space-y-4">
          {COMPLETED.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </TabsContent>
        <TabsContent value="disputed" className="mt-6 space-y-4">
          {DISPUTED.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </TabsContent>
      </Tabs>

      <CompletionDialog
        session={active ?? null}
        onClose={() => setCompletingId(null)}
      />
    </div>
  );
}

function SessionCard({
  session,
  onComplete,
}: {
  session: Session;
  onComplete?: () => void;
}) {
  const isActive = session.status === "SCHEDULED";
  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11">
              <AvatarFallback>{session.initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">
                Session with {session.counterpart}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                You are the {session.role.toLowerCase()}
              </p>
            </div>
          </div>
          {statusBadge(session.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="font-medium">{session.date}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Time</p>
            <p className="font-medium">{session.time}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Mode</p>
            <p className="font-medium">
              {session.mode}
              {session.points > 0 && (
                <span className="ml-1 inline-flex items-center gap-1 text-amber-600">
                  <Coins className="h-3.5 w-3.5" />
                  {session.points} Pts Locked in Escrow
                </span>
              )}
            </p>
          </div>
        </div>

        {isActive && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <a href={session.meetUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1.5 h-4 w-4" /> Join Google Meet
              </a>
            </Button>
            <Button onClick={onComplete}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Mark Session as Completed
            </Button>
            <Button
              variant="outline"
              className="border-rose-500/40 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700"
              onClick={() => toast.error("Dispute raised — admin will review.")}
            >
              <Flag className="mr-1.5 h-4 w-4" /> Report Issue
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CompletionDialog({
  session,
  onClose,
}: {
  session: Session | null;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");

  const submit = (withReview: boolean) => {
    toast.success(
      `${session?.points ?? 0} points released to ${session?.counterpart}${
        withReview && rating > 0 ? " • review submitted" : ""
      }`,
    );
    setRating(0);
    setHover(0);
    setReview("");
    onClose();
  };

  return (
    <Dialog open={!!session} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirm session completion</DialogTitle>
          <DialogDescription>
            Confirm session completion to release {session?.points ?? 0} points to{" "}
            {session?.counterpart}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">Rate your session</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                  className="p-1"
                  aria-label={`${n} star`}
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      (hover || rating) >= n
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/40"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">
              Write a review for your mentor{" "}
              <span className="text-muted-foreground">(Optional)</span>
            </p>
            <Textarea
              placeholder="What went well? What could improve?"
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm dark:bg-emerald-950/30">
            <Gift className="h-4 w-4 text-emerald-600" />
            <span className="text-emerald-800 dark:text-emerald-300">
              Reviews help other students pick the right mentor.
            </span>
          </div>


          <div className="flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5" />
            Releasing points is final. If something went wrong, use "Report Issue"
            instead.
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => submit(false)}>
            Skip Review & Release Points
          </Button>
          <Button onClick={() => submit(true)} disabled={rating === 0}>
            Submit Review & Release Points
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
