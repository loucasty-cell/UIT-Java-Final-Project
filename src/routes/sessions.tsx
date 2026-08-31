import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  AlertTriangle,
  Clock,
  ExternalLink,
  CheckCircle2,
  Star,
  Flag,
  Coins,
  Gift,
  Send,
  XCircle,
  Video,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { requireAuth } from "@/lib/route-guards";
import { useAuth } from "@/context/auth-context";
import {
  useSessionsQuery,
  useCompleteSessionMutation,
  useDisputeSessionMutation,
} from "@/hooks/api/use-sessions";
import {
  useLearningRequestsQuery,
  useAcceptLearningRequestMutation,
  useRejectLearningRequestMutation,
  useCancelLearningRequestMutation,
} from "@/hooks/api/use-learning-requests";
import { useSubmitReviewMutation } from "@/hooks/api/use-reviews";
import { EscrowProgress } from "@/components/sessions/escrow-progress";
import { SessionCalendar } from "@/components/sessions/session-calendar";
import type { SessionResponse, LearningRequestResponse } from "@/types/api";

export const Route = createFileRoute("/sessions")({
  beforeLoad: requireAuth,
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

type NormalizedSession = {
  id: string;
  counterpart: string;
  initials: string;
  role: "Mentor" | "Learner";
  date: string;
  time: string;
  mode: string;
  points: number;
  status: "SCHEDULED" | "STARTED" | "COMPLETED" | "DISPUTED" | "CANCELLED" | "ACCEPTED";
  meetingUrl?: string;
  completedAt?: string;
  skillName?: string;
  scheduledStart?: string; // PHASE 4: For calendar
  duration?: number; // PHASE 4: For calendar
  mentorName?: string; // PHASE 4: For calendar
  raw?: SessionResponse;
};

// PHASE 0: Removed fallback sessions - use real API only
// No mock data allowed on sessions page

function statusBadge(status: NormalizedSession["status"]) {
  switch (status) {
    case "SCHEDULED":
      return (
        <Badge className="border-amber-500/30 bg-amber-500/15 text-amber-700 hover:bg-amber-500/15 dark:text-amber-400">
          SCHEDULED
        </Badge>
      );
    case "STARTED":
      return (
        <Badge className="border-blue-500/30 bg-blue-500/15 text-blue-700 hover:bg-blue-500/15 dark:text-blue-400">
          STARTED
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
    case "ACCEPTED":
      return (
        <Badge className="border-sky-500/30 bg-sky-500/15 text-sky-700 hover:bg-sky-500/15 dark:text-sky-400">
          ACCEPTED
        </Badge>
      );
    case "CANCELLED":
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground">
          {status || "UNKNOWN"}
        </Badge>
      );
  }
}

function SessionsPage() {
  const { user } = useAuth();
  const [completingSession, setCompletingSession] = useState<NormalizedSession | null>(null);
  const [disputingSession, setDisputingSession] = useState<NormalizedSession | null>(null);

  // Real Queries
  const { data: apiSessionsData, isLoading: sessionsLoading } = useSessionsQuery();
  const { data: outgoingRequestsData } = useLearningRequestsQuery("OUTGOING");
  const { data: incomingRequestsData } = useLearningRequestsQuery("INCOMING");

  // Format real sessions
  const allSessions: NormalizedSession[] = useMemo(() => {
    if (apiSessionsData && apiSessionsData.length > 0) {
      return apiSessionsData.map((s: any) => {
        const isMentor =
          s.mentorId === user?.id ||
          s.responderId === user?.id ||
          s.responder?.id === user?.id ||
          s.role === "Mentor";
        let counterpartName = "Peer Partner";
        if (isMentor) {
          counterpartName =
            s.learnerName ||
            s.counterpartName ||
            s.requester?.displayName ||
            s.requester?.name ||
            (s.requester?.firstName
              ? `${s.requester.firstName} ${s.requester.lastName || ""}`.trim()
              : "Learner");
        } else {
          counterpartName =
            s.mentorName ||
            s.counterpartName ||
            s.responder?.displayName ||
            s.responder?.name ||
            (s.responder?.firstName
              ? `${s.responder.firstName} ${s.responder.lastName || ""}`.trim()
              : "Mentor");
        }
        const rawDateStr = s.scheduledStart || s.scheduledAt || s.createdAt;
        const startDate = rawDateStr ? new Date(rawDateStr) : new Date();
        const isValidDate = !isNaN(startDate.getTime());
        const finalDate = isValidDate ? startDate : new Date();

        return {
          id: s.id,
          counterpart: counterpartName,
          initials:
            counterpartName
              .split(" ")
              .filter(Boolean)
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "SB",
          role: isMentor ? ("Mentor" as const) : ("Learner" as const),
          date: format(finalDate, "MMM dd, yyyy"),
          time: format(finalDate, "hh:mm a"),
          mode:
            s.mode === "POINTS"
              ? "Skill Points"
              : s.mode === "SKILL_SWAP"
                ? "Skill Exchange"
                : s.mode === "VOLUNTEER"
                  ? "Volunteer"
                  : (s.mode || "Skill Points"),
          points: s.pointCostSnapshot ?? s.pointCost ?? s.points ?? 0,
          status: s.status as any,
          meetingUrl: s.meetingUrl || `https://meet.google.com/sb-${String(s.id).slice(0, 8)}`,
          completedAt: s.completedAt,
          skillName:
            s.skillName ||
            s.requestedSkill?.name ||
            s.offeredSkill?.name ||
            s.title ||
            "Skill Session",
          scheduledStart: isValidDate ? finalDate.toISOString() : undefined,
          scheduledAt: isValidDate ? finalDate.toISOString() : undefined,
          duration: s.durationMinutes || s.duration || 60,
          mentorName: isMentor ? undefined : counterpartName,
          learnerName: isMentor ? counterpartName : undefined,
          counterpartAvatar: isMentor ? s.requester?.avatarUrl : s.responder?.avatarUrl,
          raw: s,
        };
      });
    }
    return [];
  }, [apiSessionsData, user]);

  const activeSessions = allSessions.filter(
    (s) =>
      s.status === "SCHEDULED" ||
      s.status === "ACCEPTED" ||
      s.status === "STARTED" ||
      (s.status as string) === "AWAITING_CONFIRMATION" ||
      (s as any).status === "IN_PROGRESS",
  );
  const completedSessions = allSessions.filter((s) => s.status === "COMPLETED");
  const disputedSessions = allSessions.filter((s) => s.status === "DISPUTED");

  // Pending requests combine outgoing and incoming learning requests
  const pendingRequests = useMemo(() => {
    const list: (LearningRequestResponse & { direction: "INCOMING" | "OUTGOING" })[] = [];
    if (outgoingRequestsData && outgoingRequestsData.length > 0) {
      outgoingRequestsData
        .filter((r) => r.status === "PENDING")
        .forEach((r) => list.push({ ...r, direction: "OUTGOING" }));
    }
    if (incomingRequestsData && incomingRequestsData.length > 0) {
      incomingRequestsData
        .filter((r) => r.status === "PENDING")
        .forEach((r) => list.push({ ...r, direction: "INCOMING" }));
    }
    return list;
  }, [outgoingRequestsData, incomingRequestsData]);

  return (
    <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Sessions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track escrow-protected sessions, Google Meet links, reviews, and pending requests.
        </p>
      </div>

      {/* Auto-complete warning banner */}
      <Alert className="mb-6 border-amber-500/40 bg-amber-500/10">
        <Clock className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 dark:text-amber-300">
          Escrow Protection & 18-Hour Auto Release
        </AlertTitle>
        <AlertDescription className="text-amber-800/90 dark:text-amber-200/90">
          Points for completed sessions are automatically released to the mentor after both parties
          confirm, or within 18 hours if uncontested.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-5">
          <TabsTrigger value="active" className="gap-1.5">
            <span>Active Sessions</span>
            {activeSessions.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {activeSessions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-1.5">
            <span>Calendar</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-1.5">
            <span>Pending Requests</span>
            {pendingRequests.length > 0 && (
              <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedSessions.length})</TabsTrigger>
          <TabsTrigger value="disputed">Disputed ({disputedSessions.length})</TabsTrigger>
        </TabsList>

        {/* Active Sessions Tab */}
        <TabsContent value="active" className="mt-6 space-y-4">
          {sessionsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Card key={i} className="h-40 animate-pulse bg-muted/40" />
              ))}
            </div>
          ) : activeSessions.length === 0 ? (
            <Card className="rounded-xl border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-2 p-10 text-center">
                <Video className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">No active sessions scheduled</p>
                <p className="text-xs text-muted-foreground">
                  Browse the Find Mentors page to schedule a learning session.
                </p>
              </CardContent>
            </Card>
          ) : (
            activeSessions.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                onComplete={() => setCompletingSession(s)}
                onDispute={() => setDisputingSession(s)}
              />
            ))
          )}
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="mt-6">
          <SessionCalendar sessions={allSessions} userRoleTitle="Peer Sessions Schedule" />
        </TabsContent>

        {/* Pending Requests Tab */}
        <TabsContent value="pending" className="mt-6 space-y-4">
          {pendingRequests.length === 0 ? (
            <Card className="rounded-xl border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-2 p-10 text-center">
                <Send className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">No pending requests</p>
                <p className="text-xs text-muted-foreground">
                  Requests sent by you or received from learners will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((req) => (
              <PendingRequestCard key={req.id} request={req} />
            ))
          )}
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed" className="mt-6 space-y-4">
          {completedSessions.length === 0 ? (
            <Card className="rounded-xl border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-2 p-10 text-center">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">No completed sessions yet</p>
              </CardContent>
            </Card>
          ) : (
            completedSessions.map((s) => <SessionCard key={s.id} session={s} />)
          )}
        </TabsContent>

        {/* Disputed Tab */}
        <TabsContent value="disputed" className="mt-6 space-y-4">
          {disputedSessions.length === 0 ? (
            <Card className="rounded-xl border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-2 p-10 text-center">
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">No active disputes</p>
                <p className="text-xs text-muted-foreground">
                  All your sessions are progressing smoothly.
                </p>
              </CardContent>
            </Card>
          ) : (
            disputedSessions.map((s) => <SessionCard key={s.id} session={s} />)
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CompletionDialog
        session={completingSession}
        onClose={() => setCompletingSession(null)}
      />

      <DisputeDialog
        session={disputingSession}
        onClose={() => setDisputingSession(null)}
      />
    </div>
  );
}

function SessionCard({
  session,
  onComplete,
  onDispute,
}: {
  session: NormalizedSession;
  onComplete?: () => void;
  onDispute?: () => void;
}) {
  const isActive = session.status === "SCHEDULED";

  return (
    <Card className="rounded-xl border-border/70 shadow-sm transition hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
                {session.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base font-semibold">
                {session.skillName} with {session.counterpart}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Your role: <span className="font-medium text-foreground">{session.role}</span>
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
            <p className="text-xs text-muted-foreground">Mode & Payment</p>
            <p className="font-medium">
              {session.mode}
              {session.points > 0 && (
                <span className="ml-1.5 inline-flex items-center gap-1 text-amber-600 font-semibold">
                  <Coins className="h-3.5 w-3.5" />
                  {session.points} Pts in Escrow
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Escrow Progress Bar */}
        {session.points > 0 && (isActive || session.status === "COMPLETED") && (
          <EscrowProgress
            completedAt={session.completedAt}
            autoReleaseHours={18}
            points={session.points}
          />
        )}

        {/* Actions */}
        {isActive && (
          <div className="flex flex-wrap gap-2 pt-1 border-t border-border/60">
            {session.meetingUrl && (
              <Button size="sm" variant="outline" className="rounded-lg shadow-sm" asChild>
                <a href={session.meetingUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-1.5 h-4 w-4 text-sky-600" /> Join Google Meet
                </a>
              </Button>
            )}
            <Button size="sm" onClick={onComplete} className="rounded-lg shadow-sm">
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Mark as Completed
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-lg border-rose-500/30 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700"
              onClick={onDispute}
            >
              <Flag className="mr-1.5 h-4 w-4" /> Report Issue
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PendingRequestCard({
  request,
}: {
  request: LearningRequestResponse & { direction: "INCOMING" | "OUTGOING" };
}) {
  const [meetUrlInput, setMeetUrlInput] = useState("");
  const acceptMutation = useAcceptLearningRequestMutation();
  const rejectMutation = useRejectLearningRequestMutation();
  const cancelMutation = useCancelLearningRequestMutation();

  const isIncoming = request.direction === "INCOMING";
  const startDate = request.scheduledStart ? new Date(request.scheduledStart) : new Date();

  const handleAccept = () => {
    acceptMutation.mutate({
      id: request.id,
      data: { meetingUrl: meetUrlInput.trim() || undefined },
    });
  };

  const handleReject = () => {
    rejectMutation.mutate({ id: request.id });
  };

  const handleCancel = () => {
    cancelMutation.mutate(request.id);
  };

  return (
    <Card className="rounded-xl border-border/70 shadow-sm">
      <CardContent className="p-5 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-base">
                {request.requestedSkillName || "Skill Session"}
              </h4>
              <Badge variant="outline" className="text-xs">
                {request.mode === "POINTS"
                  ? `${request.pointCostSnapshot || 35} Pts`
                  : request.mode === "SKILL_SWAP"
                    ? "Skill Swap"
                    : "Volunteer"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isIncoming
                ? `Learner: ${request.learnerName || "Student"}`
                : `Mentor: ${request.mentorName || "Instructor"}`}{" "}
              · {format(startDate, "PPP 'at' p")}
            </p>
          </div>
          <Badge className="bg-blue-500/15 text-blue-700 border-blue-500/30">
            {isIncoming ? "INCOMING REQUEST" : "AWAITING MENTOR"}
          </Badge>
        </div>

        {request.message && (
          <p className="text-xs bg-muted/50 p-2.5 rounded-lg text-muted-foreground italic">
            "{request.message}"
          </p>
        )}

        {/* Incoming Actions (Mentor view) */}
        {isIncoming ? (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Google Meet URL (optional)"
                value={meetUrlInput}
                onChange={(e) => setMeetUrlInput(e.target.value)}
                className="h-9 text-xs rounded-lg flex-1"
              />
              <Button
                size="sm"
                onClick={handleAccept}
                disabled={acceptMutation.isPending}
                className="rounded-lg shadow-sm"
              >
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                {acceptMutation.isPending ? "Accepting..." : "Accept"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReject}
                disabled={rejectMutation.isPending}
                className="rounded-lg text-destructive"
              >
                <XCircle className="mr-1 h-3.5 w-3.5" />
                Reject
              </Button>
            </div>
          </div>
        ) : (
          /* Outgoing Actions (Learner view) */
          <div className="pt-2 border-t flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
              className="rounded-lg text-xs"
            >
              Cancel Request
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
  session: NormalizedSession | null;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const completeMutation = useCompleteSessionMutation();
  const reviewMutation = useSubmitReviewMutation();

  const handleConfirm = async (withReview: boolean) => {
    if (!session) return;

    const isValidReview = withReview && rating >= 1 && rating <= 5;
    try {
      // Single call per api.md:239 completion-confirmations — backend awards +3 if rating present and handles escrow
      const result: any = await completeMutation.mutateAsync({
        id: session.id,
        rating: isValidReview ? rating : undefined,
        review: isValidReview && review.trim() ? review.trim() : undefined,
      });
      const payload = result?.data || result || {};
      const pointsReleased = payload.pointsReleased;
      const awaiting = payload.status === "AWAITING_CONFIRMATION" || pointsReleased === false;

      if (isValidReview) {
        // Backend awards +3 REVIEW_REWARD per api.md:244; we toast optimistically but note it's server-owned
        if (awaiting) {
          toast.success("Confirmed! Awaiting other party — review recorded (+3 pts) 🎉", {
            description: payload.autoReleaseAt
              ? `Auto-release at ${new Date(payload.autoReleaseAt).toLocaleString()}`
              : "Counterparty must also confirm",
          });
        } else {
          toast.success("Review submitted! You earned +3 review points + session completed 🎉");
        }
      } else {
        if (awaiting) {
          toast.success("Confirmed! Awaiting other party confirmation", {
            description: payload.autoReleaseAt
              ? `Points auto-release at ${new Date(payload.autoReleaseAt).toLocaleString()} if uncontested`
              : undefined,
          });
        } else if (pointsReleased === true) {
          toast.success("Session completed — points released!");
        } else {
          toast.success("Session marked complete!");
        }
      }

      setRating(0);
      setHover(0);
      setReview("");
      onClose();
    } catch (err: any) {
      const msg = err?.message || "Failed to confirm completion";
      if (String(err?.error || msg).includes("INVALID_STATE_TRANSITION") || String(err?.status) === "409") {
        toast.error("Cannot complete in current state", { description: msg });
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <Dialog open={!!session} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg rounded-xl">
        <DialogHeader>
          <DialogTitle>Confirm Session Completion</DialogTitle>
          <DialogDescription>
            Confirm that your session with {session?.counterpart} has concluded.
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
            <Label className="mb-2 block text-sm font-medium">
              Write a Review <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Textarea
              placeholder="What did you learn? What was great about your mentor?"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
              className="rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs dark:bg-emerald-950/30">
            <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="text-emerald-800 dark:text-emerald-300 font-medium">
              Submitting a review awards you <span className="font-bold">+3 points</span>!
            </span>
          </div>

          <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-2.5 text-xs text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Releasing escrow is final. If you encountered problems, use "Report Issue" to open a dispute.
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => handleConfirm(false)} className="rounded-lg">
            Skip Review & Complete
          </Button>
          <Button
            onClick={() => handleConfirm(true)}
            disabled={rating === 0 || completeMutation.isPending}
            className="rounded-lg shadow-sm"
          >
            <Gift className="mr-1.5 h-4 w-4" />
            Submit Review (+3 Pts) & Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DisputeDialog({
  session,
  onClose,
}: {
  session: NormalizedSession | null;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const disputeMutation = useDisputeSessionMutation();

  const handleDispute = async () => {
    if (!session || !reason.trim()) return;

    try {
      await disputeMutation.mutateAsync({
        id: session.id,
        data: { reason: `${reason}: ${details}`.trim() },
      });
      toast.error("Dispute raised. Admin arbitration initiated.");
      setReason("");
      setDetails("");
      onClose();
    } catch {
      // Error handled
    }
  };

  return (
    <Dialog open={!!session} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-rose-600 flex items-center gap-2">
            <Flag className="h-5 w-5" /> Report Issue / Open Dispute
          </DialogTitle>
          <DialogDescription>
            Flag this session for admin arbitration. Escrow points will be frozen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Issue Category</Label>
            <Input
              placeholder="e.g. Mentor did not attend, Incomplete material"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-lg"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Explanation Details</Label>
            <Textarea
              placeholder="Describe what occurred during the scheduled session..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className="rounded-lg"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-lg">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDispute}
            disabled={!reason.trim() || disputeMutation.isPending}
            className="rounded-lg"
          >
            {disputeMutation.isPending ? "Submitting..." : "Submit Dispute"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
