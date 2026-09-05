import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, ExternalLink, Flag, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { useLiveRefresh } from "@/hooks/use-live-refresh";
import {
  learningRequestsService,
  type LearningRequestResponse,
} from "@/services/learning-requests.service";
import { sessionsService } from "@/services/sessions.service";
import { reviewsService } from "@/services/reviews.service";
import type { SessionResponse } from "@/types/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/sessions")({ component: SessionsPage });
type RoleTab = "learner" | "mentor";
const activeStatuses = new Set(["ACCEPTED", "SCHEDULED", "STARTED"]);

function SessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [learnerRequests, setLearnerRequests] = useState<LearningRequestResponse[]>([]);
  const [mentorRequests, setMentorRequests] = useState<LearningRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState<SessionResponse | null>(null);
  const [report, setReport] = useState<SessionResponse | null>(null);
  const load = useCallback(async () => {
    try {
      const [all, outgoing, incoming] = await Promise.all([
        sessionsService.listSessions(),
        learningRequestsService.listRequests("OUTGOING"),
        learningRequestsService.listRequests("INCOMING"),
      ]);
      setSessions(all);
      setLearnerRequests(outgoing);
      setMentorRequests(incoming);
      setError("");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to load sessions.");
    } finally {
      setLoading(false);
    }
  }, []);
  useLiveRefresh(load);
  useEffect(() => {
    void load();
  }, [load]);
  const byRole = useMemo(
    () => ({
      learner: sessions.filter(
        (s) =>
          s.learnerId === user?.id || s.requester?.id === user?.id || s.requesterId === user?.id,
      ),
      mentor: sessions.filter(
        (s) =>
          s.mentorId === user?.id || s.responder?.id === user?.id || s.responderId === user?.id,
      ),
    }),
    [sessions, user?.id],
  );
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-3xl font-bold">My Sessions</h1>
        <p className="text-sm text-muted-foreground">
          Manage your learning requests and the sessions you teach.
        </p>
      </div>
      {loading && <p role="status">Loading sessions…</p>}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}{" "}
            <Button variant="link" onClick={() => void load()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {!loading && !error && (
        <Tabs defaultValue="learner">
          <TabsList className="grid w-full grid-cols-2 sm:w-96">
            <TabsTrigger value="learner">Learner</TabsTrigger>
            <TabsTrigger value="mentor">Mentor</TabsTrigger>
          </TabsList>
          <RolePanel
            role="learner"
            sessions={byRole.learner}
            requests={learnerRequests}
            reload={load}
            onComplete={setComplete}
            onReport={setReport}
          />
          <RolePanel
            role="mentor"
            sessions={byRole.mentor}
            requests={mentorRequests}
            reload={load}
            onComplete={setComplete}
            onReport={setReport}
          />
        </Tabs>
      )}
      <CompleteDialog session={complete} close={() => setComplete(null)} reload={load} />
      <ReportDialog session={report} close={() => setReport(null)} reload={load} />
    </div>
  );
}

function RolePanel({
  role,
  sessions,
  requests,
  reload,
  onComplete,
  onReport,
}: {
  role: RoleTab;
  sessions: SessionResponse[];
  requests: LearningRequestResponse[];
  reload: () => Promise<void>;
  onComplete: (s: SessionResponse) => void;
  onReport: (s: SessionResponse) => void;
}) {
  const [section, setSection] = useState("active");
  const active = sessions.filter((s) => activeStatuses.has(s.status));
  const completed = sessions.filter((s) => s.status === "COMPLETED");
  const disputed = sessions.filter((s) => s.status === "DISPUTED");
  const awaiting = sessions.filter((s) => s.status === "AWAITING_CONFIRMATION");
  const pending = requests.filter((r) => r.status === "PENDING");
  useEffect(() => {
    if (section === "active" && !active.length && pending.length) setSection("pending");
  }, [active.length, pending.length, section]);
  return (
    <TabsContent value={role} className="mt-5">
      <Tabs value={section} onValueChange={setSection}>
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="pending">
            {role === "learner" ? "Offers & requests" : "Requests"} ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          <TabsTrigger value="awaiting">Awaiting confirmation ({awaiting.length})</TabsTrigger>
          <TabsTrigger value="disputed">Reported ({disputed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-3">
          {active.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              role={role}
              complete={() => onComplete(s)}
              report={() => onReport(s)}
            />
          ))}
          <Empty show={!active.length} text="No active sessions." />
        </TabsContent>
        <TabsContent value="pending" className="space-y-3">
          {pending.map((r) => (
            <RequestCard key={r.id} request={r} role={role} reload={reload} />
          ))}
          <Empty
            show={!pending.length}
            text={role === "learner" ? "No pending offers or requests." : "No pending requests."}
          />
        </TabsContent>
        <TabsContent value="completed" className="space-y-3">
          {completed.map((s) => (
            <SessionCard key={s.id} session={s} role={role} />
          ))}
          <Empty show={!completed.length} text="No completed sessions." />
        </TabsContent>
        <TabsContent value="awaiting" className="space-y-3">
          {awaiting.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              role={role}
              complete={() => onComplete(session)}
              report={() => onReport(session)}
            />
          ))}
          <Empty show={!awaiting.length} text="No sessions awaiting confirmation." />
        </TabsContent>
        <TabsContent value="disputed" className="space-y-3">
          {disputed.map((s) => (
            <SessionCard key={s.id} session={s} role={role} />
          ))}
          <Empty show={!disputed.length} text="No reported sessions." />
        </TabsContent>
      </Tabs>
    </TabsContent>
  );
}
function Empty({ show, text }: { show: boolean; text: string }) {
  return show ? (
    <Card>
      <CardContent className="p-8 text-center text-muted-foreground">{text}</CardContent>
    </Card>
  ) : null;
}
function person(session: SessionResponse, role: RoleTab) {
  return role === "learner"
    ? session.responder?.displayName || session.mentorName || "Mentor"
    : session.requester?.displayName || session.learnerName || "Learner";
}
function SessionCard({
  session,
  role,
  complete,
  report,
}: {
  session: SessionResponse;
  role: RoleTab;
  complete?: () => void;
  report?: () => void;
}) {
  const when = session.scheduledStart || session.createdAt;
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between gap-3">
          <CardTitle className="text-base">Session with {person(session, role)}</CardTitle>
          <Badge>{session.status.replaceAll("_", " ")}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 text-sm sm:grid-cols-3">
          <span>
            <b>Skill:</b> {session.requestedSkill?.name || session.skillName || "General mentoring"}
          </span>
          <span>
            <b>Mode:</b> {session.mode?.replace("SKILL_SWAP", "Skill exchange") || "Session"}
          </span>
          <span>
            <b>When:</b> {when ? new Date(when).toLocaleString() : "To be arranged"}
          </span>
        </div>
        {session.status === "COMPLETED" && <SessionReview session={session} role={role} />}
        {(activeStatuses.has(session.status) || session.status === "AWAITING_CONFIRMATION") && (
          <div className="flex flex-wrap gap-2">
            {session.meetingUrl && (
              <Button variant="outline" asChild>
                <a href={session.meetingUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Join meeting
                </a>
              </Button>
            )}
            <Button onClick={complete}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Complete Session
            </Button>
            {report && (
              <Button variant="outline" onClick={report}>
                <Flag className="mr-2 h-4 w-4" />
                Report Issue
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
function SessionReview({ session, role }: { session: SessionResponse; role: RoleTab }) {
  const [rating, setRating] = useState("5");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await reviewsService.submitReview(session.id, {
        revieweeId:
          role === "learner"
            ? session.responder?.id || session.mentorId
            : session.requester?.id || session.learnerId,
        skillId: session.requestedSkill?.id,
        rating: Number(rating),
        feedback: feedback.trim(),
      });
      setSaved(true);
      toast.success("Review submitted");
    } catch (failure) {
      toast.error(failure instanceof Error ? failure.message : "Could not submit review.");
    } finally {
      setBusy(false);
    }
  };
  if (saved) return <p className="text-sm text-muted-foreground">Thank you for your review.</p>;
  return (
    <details className="space-y-3">
      <summary className="cursor-pointer text-sm text-primary">Leave a review</summary>
      <Label htmlFor={`rating-${session.id}`}>Rating</Label>
      <select
        id={`rating-${session.id}`}
        value={rating}
        onChange={(event) => setRating(event.target.value)}
        className="h-10 rounded-md border bg-background px-3"
      >
        {[5, 4, 3, 2, 1].map((value) => (
          <option key={value} value={value}>
            {value} stars
          </option>
        ))}
      </select>
      <Label htmlFor={`feedback-${session.id}`}>Feedback</Label>
      <Textarea
        id={`feedback-${session.id}`}
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
        maxLength={1000}
      />
      <Button disabled={busy} onClick={() => void submit()}>
        Submit review
      </Button>
    </details>
  );
}
function RequestCard({
  request,
  role,
  reload,
}: {
  request: LearningRequestResponse;
  role: RoleTab;
  reload: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [acceptError, setAcceptError] = useState("");
  const act = async (action: "accept" | "reject" | "cancel") => {
    setBusy(true);
    try {
      if (action === "reject")
        await learningRequestsService.rejectRequest(request.id, { reason: "Declined by mentor" });
      else await learningRequestsService.cancelRequest(request.id);
      toast.success(`Request ${action}ed`);
      await reload();
    } catch (f) {
      toast.error(f instanceof Error ? f.message : "Request could not be updated.");
    } finally {
      setBusy(false);
    }
  };
  const accept = async () => {
    const value = meetingUrl.trim();
    if (!/^https:\/\/meet\.google\.com\/\S+$/i.test(value)) {
      setAcceptError("Paste a valid Google Meet link starting with https://meet.google.com/.");
      return;
    }
    setBusy(true);
    setAcceptError("");
    try {
      await learningRequestsService.acceptRequest(request.id, { meetingUrl: value });
      toast.success("Request accepted and Google Meet link sent");
      setMeetingUrl("");
      setAcceptOpen(false);
      await reload();
    } catch (failure) {
      setAcceptError(failure instanceof Error ? failure.message : "Request could not be accepted.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex justify-between">
          <div>
            <h3 className="font-semibold">
              {request.requestedSkill?.name || request.requestedSkillName || "Learning session"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {request.learningNeedOfferId
                ? role === "learner"
                  ? `Teaching offer from ${request.mentorName || "mentor"}`
                  : `You offered to teach ${request.learnerName || "learner"}`
                : role === "learner"
                  ? `Requested from ${request.mentorName || "mentor"}`
                  : `Requested by ${request.learnerName || "learner"}`}{" "}
              · {request.mode.replace("SKILL_SWAP", "Skill exchange")}
            </p>
          </div>
          <Badge variant="outline">PENDING</Badge>
        </div>
        <p className="text-sm">
          <Clock className="mr-1 inline h-4 w-4" />
          {new Date(request.scheduledStart).toLocaleString()}
        </p>
        <div className="flex gap-2">
          {role === "mentor" ? (
            <>
              <Button disabled={busy} onClick={() => setAcceptOpen(true)}>
                Accept
              </Button>
              <Button disabled={busy} variant="outline" onClick={() => void act("reject")}>
                Decline
              </Button>
            </>
          ) : (
            <Button disabled={busy} variant="outline" onClick={() => void act("cancel")}>
              {request.learningNeedOfferId ? "Decline offer" : "Cancel request"}
            </Button>
          )}
        </div>
      </CardContent>
      <Dialog open={acceptOpen} onOpenChange={(open) => !open && setAcceptOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept request and send Google Meet link</DialogTitle>
            <DialogDescription>
              The learner will find this link under My Sessions after you accept their {request.mode.toLowerCase()} request.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor={`meeting-link-${request.id}`}>Google Meet link</Label>
            <Input
              id={`meeting-link-${request.id}`}
              type="url"
              value={meetingUrl}
              onChange={(event) => setMeetingUrl(event.target.value)}
              placeholder="https://meet.google.com/abc-defg-hij"
              autoFocus
            />
          </div>
          {acceptError && <p role="alert" className="text-sm text-destructive">{acceptError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptOpen(false)}>Cancel</Button>
            <Button disabled={busy || !meetingUrl.trim()} onClick={() => void accept()}>
              {busy && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              Accept and send link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function CompleteDialog({
  session,
  close,
  reload,
}: {
  session: SessionResponse | null;
  close: () => void;
  reload: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!session) return;
    setBusy(true);
    try {
      await sessionsService.completeSession(session.id);
      toast.success("Completion recorded. The session left Active Sessions.");
      close();
      await reload();
    } catch (f) {
      toast.error(f instanceof Error ? f.message : "Could not complete session.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={!!session} onOpenChange={(v) => !v && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete session?</DialogTitle>
          <DialogDescription>
            This records your confirmation. The other participant may still need to confirm before
            points are released.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button disabled={busy} onClick={() => void submit()}>
            {busy && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Confirm completion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
const reasons = [
  "Mentor or learner did not attend",
  "Inappropriate behavior",
  "Session was not as described",
  "Payment or points problem",
  "Technical problem",
  "Other",
];
function ReportDialog({
  session,
  close,
  reload,
}: {
  session: SessionResponse | null;
  close: () => void;
  reload: () => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!session || !reason) return;
    setBusy(true);
    try {
      await sessionsService.disputeSession(session.id, {
        reason,
        details: details.trim() || undefined,
      });
      toast.success("Report submitted to the admin review queue.");
      close();
      setReason("");
      setDetails("");
      await reload();
    } catch (f) {
      toast.error(f instanceof Error ? f.message : "Could not submit report.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={!!session} onOpenChange={(v) => !v && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report a session issue</DialogTitle>
          <DialogDescription>
            Select why you are reporting this session. Admins will receive the report directly.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label>Reason</Label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a reason" />
            </SelectTrigger>
            <SelectContent>
              {reasons.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="report-details">Details</Label>
          <Textarea
            id="report-details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            maxLength={2000}
            placeholder="Explain what happened"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button disabled={busy || !reason} onClick={() => void submit()}>
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
