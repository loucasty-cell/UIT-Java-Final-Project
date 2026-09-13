import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  AlertTriangle,
  Ban,
  Flag,
  LoaderCircle,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { adminService, type ReportResponse } from "@/services/admin.service";
import { useAuth } from "@/context/auth-context";
import type {
  AdminDisputeResponse,
  AdminDashboardMetricsResponse,
  AdminReviewResponse,
  AdminUserResponse,
} from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { TrustedMentorBadge } from "@/components/trusted-mentor-badge";

export const Route = createFileRoute("/admin")({ component: AdminPage });
type Resolution =
  "RELEASE_TO_MENTOR" | "REFUND_LEARNER" | "CANCEL_NO_TRANSFER" | "MARK_COMPLETED" | "CANCEL_SWAP";
function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const metricsQuery = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: () => adminService.getDashboardMetrics(),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const reportsQuery = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => adminService.getReports(undefined, undefined, { page: 0, size: 100 }),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const disputesQuery = useQuery({
    queryKey: ["admin-disputes"],
    queryFn: () => adminService.getDisputes(undefined, { page: 0, size: 100 }),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminService.getUsers({ page: 0, size: 200 }),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const reviewsQuery = useQuery({
    queryKey: ["admin-reviews-needing-attention"],
    queryFn: () => adminService.getReviewsNeedingAttention({ page: 0, size: 200 }),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const loading =
    metricsQuery.isLoading ||
    reportsQuery.isLoading ||
    disputesQuery.isLoading ||
    usersQuery.isLoading ||
    reviewsQuery.isLoading;
  const error =
    metricsQuery.error ??
    reportsQuery.error ??
    disputesQuery.error ??
    usersQuery.error ??
    reviewsQuery.error;
  const metrics = metricsQuery.data ?? null;
  const reports = reportsQuery.data?.content ?? [];
  const disputes = disputesQuery.data ?? [];
  const users = usersQuery.data?.content ?? [];
  const reviews = reviewsQuery.data?.content ?? [];

  const reload = async (silent = false) => {
    if (!silent) {
      await Promise.all([
        metricsQuery.refetch(),
        reportsQuery.refetch(),
        disputesQuery.refetch(),
        usersQuery.refetch(),
        reviewsQuery.refetch(),
      ]);
    }
  };
  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    const revoke = logout();
    void navigate({ to: "/admin-login", replace: true });
    try {
      await revoke;
      toast.success("You have signed out.");
    } catch {
      toast.warning(
        "Signed out on this device. The server could not be reached to revoke the session.",
      );
    } finally {
      setLoggingOut(false);
    }
  };
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge>
            <ShieldCheck className="mr-1 h-3 w-3" />
            Admin only
          </Badge>
          <h1 className="mt-2 text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Review user patterns, investigate reports, and resolve session disputes.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Signed in as {user?.email}</p>
        </div>
        <Button variant="outline" disabled={loggingOut} onClick={() => void handleLogout()}>
          {loggingOut ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          Sign out
        </Button>
      </header>
      {loading && <p role="status">Loading admin data…</p>}
      {error && (
        <p role="alert" className="text-destructive">
          {error instanceof Error ? error.message : "Unable to load admin data."}
          <Button variant="link" onClick={() => void reload()}>
            Retry
          </Button>
        </p>
      )}
      {metrics && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={Users} label="Users" value={metrics.totalUsers} />
          <Metric icon={Flag} label="Open reports" value={metrics.openReports} />
          <Metric
            icon={AlertTriangle}
            label="Disputes"
            value={metrics.activeDisputes ?? metrics.pendingDisputes}
          />
          <Metric icon={RefreshCw} label="Active sessions" value={metrics.activeSessions} />
        </div>
      )}
      <Tabs defaultValue="users">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="reviews">Needs attention ({reviews.length})</TabsTrigger>
          <TabsTrigger value="sessions">
            Session Reports ({disputes.filter((d) => d.status === "OPEN").length})
          </TabsTrigger>
          <TabsTrigger value="content">
            Content Reports ({reports.filter((r) => r.status === "OPEN").length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-3">
          {users.map((account) => (
            <UserModerationCard
              key={account.id}
              account={account}
              reviews={reviews}
              currentAdminId={user?.id}
              reload={reload}
            />
          ))}
          {!users.length && !loading && <Empty message="No users are available." />}
        </TabsContent>
        <TabsContent value="reviews" className="space-y-3">
          {reviews.map((review) => (
            <ReviewAttentionCard key={review.id} review={review} />
          ))}
          {!reviews.length && !loading && (
            <Empty message="No low-rating patterns need attention." />
          )}
        </TabsContent>
        <TabsContent value="sessions" className="space-y-3">
          {disputes.map((d) => (
            <DisputeCard key={d.id} dispute={d} reload={reload} />
          ))}
          {!disputes.length && !loading && <Empty />}
        </TabsContent>
        <TabsContent value="content" className="space-y-3">
          {reports.map((r) => (
            <ReportCard key={r.id} report={r} reload={reload} />
          ))}
          {!reports.length && !loading && <Empty />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number | undefined;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <Icon className="h-5 w-5 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value ?? 0}</p>
        </div>
      </CardContent>
    </Card>
  );
}
function Empty({ message = "The review queue is empty." }: { message?: string }) {
  return (
    <Card>
      <CardContent className="p-8 text-center text-muted-foreground">{message}</CardContent>
    </Card>
  );
}

export function UserModerationCard({
  account,
  reviews,
  currentAdminId,
  reload,
}: {
  account: AdminUserResponse;
  reviews: AdminReviewResponse[];
  currentAdminId?: string;
  reload: () => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const isAdmin = account.roles.some((role) => role.replace("ROLE_", "") === "ADMIN");
  const isMentor = account.roles.some((role) => role.replace("ROLE_", "") === "MENTOR");
  const canModerate = !isAdmin && account.id !== currentAdminId;
  const warningReady = account.recommendedAction === "WARN";
  const suspensionReady = account.recommendedAction === "SUSPEND" && account.status !== "SUSPENDED";
  const needsReason = warningReady || suspensionReady || account.status === "SUSPENDED";
  const evidence = reviews
    .filter((review) => review.revieweeId === account.id && review.rating <= 2)
    .map((review) => review.id);

  const act = async (action: "WARN" | "SUSPEND" | "ACTIVE") => {
    if (reason.trim().length < 10) return;
    setBusy(true);
    try {
      if (action === "WARN") {
        await adminService.issueWarning(account.id, {
          reason: "POOR_REVIEWS",
          message: reason.trim(),
          reviewIds: evidence.slice(0, 3),
        });
        toast.success("Warning sent", {
          description: "The user will see a prominent account-warning banner.",
        });
      } else {
        const status = action === "SUSPEND" ? "SUSPENDED" : "ACTIVE";
        await adminService.updateStatus(
          account.id,
          status,
          reason.trim(),
          account.version,
          status === "SUSPENDED" ? evidence.slice(0, 2) : [],
        );
        toast.success(action === "SUSPEND" ? "User temporarily suspended" : "Suspension lifted");
      }
      setReason("");
      await reload();
    } catch (failure) {
      toast.error(failure instanceof Error ? failure.message : "Could not update this account.");
    } finally {
      setBusy(false);
    }
  };

  const updateTrustedMentor = async (trustedMentor: boolean) => {
    setBusy(true);
    try {
      await adminService.updateTrustedMentorBadge(account.id, trustedMentor, account.version);
      toast.success(
        trustedMentor ? "Trusted Mentor badge awarded" : "Trusted Mentor badge removed",
      );
      await reload();
    } catch (failure) {
      toast.error(failure instanceof Error ? failure.message : "Could not update the badge.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">
              {account.firstName} {account.lastName}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{account.email}</p>
          </div>
          <Badge variant={account.status === "SUSPENDED" ? "destructive" : "secondary"}>
            {account.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="outline">{account.verifiedReviewCount} reviews</Badge>
          <Badge variant={account.verifiedLowReviewCount ? "destructive" : "outline"}>
            {account.verifiedLowReviewCount} low ratings
          </Badge>
          <Badge variant="outline">{account.warningCount} warnings</Badge>
          <Badge variant="outline">
            {account.verifiedReviewCount
              ? `${account.verifiedAverageRating.toFixed(1)} average`
              : "No ratings yet"}
          </Badge>
          {account.trustedMentor && <TrustedMentorBadge />}
        </div>
        {account.suspendedUntil && (
          <p className="text-sm font-medium text-destructive">
            Suspended until {new Date(account.suspendedUntil).toLocaleString()}
          </p>
        )}
        {canModerate && (
          <div className="space-y-2 rounded-lg border p-3">
            <p className="text-sm font-medium">Moderation actions</p>
            <p className="text-xs text-muted-foreground">
              {warningReady && "Warning available: this user has at least 3 low ratings."}
              {suspensionReady &&
                "Temporary ban available: this user received 2 more low ratings after a warning."}
              {!warningReady &&
                !suspensionReady &&
                account.status !== "SUSPENDED" &&
                (account.warningCount === 0
                  ? `Warning becomes available at 3 low ratings (${account.verifiedLowReviewCount}/3).`
                  : "Temporary ban becomes available after 2 new low ratings following the warning.")}
              {account.status === "SUSPENDED" && "This account is currently temporarily banned."}
            </p>
            {needsReason && (
              <Textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={500}
                placeholder="Explain the decision to the user (at least 10 characters)"
                aria-label={`Moderation reason for ${account.firstName} ${account.lastName}`}
              />
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={!warningReady || busy || reason.trim().length < 10}
                onClick={() => void act("WARN")}
              >
                <AlertTriangle className="mr-2 h-4 w-4" /> Warn user
              </Button>
              <Button
                variant="destructive"
                disabled={!suspensionReady || busy || reason.trim().length < 10}
                onClick={() => void act("SUSPEND")}
              >
                <Ban className="mr-2 h-4 w-4" /> Temporarily ban
              </Button>
              {account.status === "SUSPENDED" && (
                <Button
                  variant="outline"
                  disabled={busy || reason.trim().length < 10}
                  onClick={() => void act("ACTIVE")}
                >
                  Lift suspension
                </Button>
              )}
            </div>
          </div>
        )}
        {canModerate && isMentor && (
          <div className="space-y-2 rounded-lg border border-sky-200 bg-sky-50/50 p-3 dark:border-sky-900 dark:bg-sky-950/30">
            <p className="text-sm font-medium">Trusted Mentor badge</p>
            <p className="text-xs text-muted-foreground">
              {account.completedSessionCount}/5 completed teaching sessions ·{" "}
              {account.verifiedReviewCount}/5 reviews ·{" "}
              {account.verifiedReviewCount
                ? `${account.verifiedAverageRating.toFixed(1)}/4.5 average`
                : "No rating yet"}
            </p>
            {account.trustedMentor && account.status !== "ACTIVE" && (
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                Awarded, but hidden while this account is {account.status.toLowerCase()}.
              </p>
            )}
            {!account.trustedMentor && !account.trustedMentorEligible && (
              <p className="text-xs text-muted-foreground">
                The award becomes available when all requirements are met and the account is active.
              </p>
            )}
            {account.trustedMentor ? (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => void updateTrustedMentor(false)}
              >
                Remove badge
              </Button>
            ) : (
              <Button
                disabled={busy || !account.trustedMentorEligible}
                onClick={() => void updateTrustedMentor(true)}
              >
                <ShieldCheck className="mr-2 h-4 w-4" /> Award Trusted Mentor
              </Button>
            )}
          </div>
        )}
        {!canModerate && (
          <p className="text-xs text-muted-foreground">
            Administrator accounts cannot be moderated here.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ReviewAttentionCard({ review }: { review: AdminReviewResponse }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">
              {review.reviewerName} reviewed {review.revieweeName}
            </CardTitle>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-current" /> {review.rating}/5 ·{" "}
              {new Date(review.createdAt).toLocaleString()}
            </p>
          </div>
          <Badge variant="destructive">Needs attention</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="whitespace-pre-wrap text-sm">{review.feedback || "No written feedback."}</p>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            {review.lowReviewCount} low rating{review.lowReviewCount === 1 ? "" : "s"} for this user
          </span>
          {review.recommendedAction !== "NONE" && (
            <Badge variant="outline">
              Recommended: {review.recommendedAction.replace("SUSPEND", "TEMPORARY BAN")}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          This review is already public. Use the Users tab only when the repeated-rating threshold
          recommends action.
        </p>
      </CardContent>
    </Card>
  );
}
export function DisputeCard({
  dispute,
  reload,
}: {
  dispute: AdminDisputeResponse;
  reload: () => Promise<void>;
}) {
  const [resolution, setResolution] = useState<Resolution>("CANCEL_NO_TRANSFER");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await adminService.resolveDispute(dispute.id, { resolution, note });
      toast.success("Session report resolved");
      await reload();
    } catch (f) {
      toast.error(f instanceof Error ? f.message : "Could not resolve report.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle className="text-base">Session {dispute.sessionId}</CardTitle>
          <Badge variant={dispute.status === "OPEN" ? "destructive" : "secondary"}>
            {dispute.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p>
          <b>Reason:</b> {dispute.reason}
        </p>
        {dispute.openedBy && <p className="text-sm">Reported by {dispute.openedBy.displayName}</p>}
        {dispute.reportedUser && (
          <p className="text-sm">Reported against {dispute.reportedUser.displayName}</p>
        )}
        {dispute.details && <p className="whitespace-pre-wrap">{dispute.details}</p>}
        {dispute.resolutionNote && <p>Resolution: {dispute.resolutionNote}</p>}
        {dispute.status === "OPEN" && (
          <>
            <Select value={resolution} onValueChange={(v) => setResolution(v as Resolution)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CANCEL_NO_TRANSFER">Cancel without transfer</SelectItem>
                <SelectItem value="REFUND_LEARNER">Refund learner</SelectItem>
                <SelectItem value="RELEASE_TO_MENTOR">Release to mentor</SelectItem>
                <SelectItem value="MARK_COMPLETED">Mark completed</SelectItem>
                <SelectItem value="CANCEL_SWAP">Cancel exchange</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Resolution note (at least 10 characters)"
            />
            <Button disabled={busy || note.trim().length < 10} onClick={() => void submit()}>
              {busy && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Resolve
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
function ReportCard({ report, reload }: { report: ReportResponse; reload: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const act = async (remove: boolean) => {
    setBusy(true);
    try {
      if (remove) await adminService.removeReportedContent(report.id, "Removed after admin review");
      else await adminService.dismissReport(report.id, "Dismissed after admin review");
      toast.success("Report reviewed");
      await reload();
    } catch (f) {
      toast.error(f instanceof Error ? f.message : "Could not review report.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle className="text-base">{report.targetType.replaceAll("_", " ")}</CardTitle>
          <Badge variant={report.status === "OPEN" ? "destructive" : "secondary"}>
            {report.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>
          <b>Reason:</b> {report.reason}
        </p>
        {report.details && <p>{report.details}</p>}
        {report.excerpt && (
          <blockquote className="border-l-2 pl-3 text-sm text-muted-foreground">
            {report.excerpt}
          </blockquote>
        )}
        {report.status === "OPEN" && (
          <div className="flex gap-2">
            <Button disabled={busy} onClick={() => void act(true)}>
              Remove content
            </Button>
            <Button disabled={busy} variant="outline" onClick={() => void act(false)}>
              Dismiss
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
