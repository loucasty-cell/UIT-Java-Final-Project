import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Flag,
  LoaderCircle,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { adminService, type ReportResponse } from "@/services/admin.service";
import { useAuth } from "@/context/auth-context";
import { useLiveRefresh } from "@/hooks/use-live-refresh";
import type { AdminDisputeResponse, AdminDashboardMetricsResponse } from "@/types/api";
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

export const Route = createFileRoute("/admin")({ component: AdminPage });
type Resolution =
  "RELEASE_TO_MENTOR" | "REFUND_LEARNER" | "CANCEL_NO_TRANSFER" | "MARK_COMPLETED" | "CANCEL_SWAP";
function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<AdminDashboardMetricsResponse | null>(null);
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [disputes, setDisputes] = useState<AdminDisputeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [m, r, d] = await Promise.all([
        adminService.getDashboardMetrics(),
        adminService.getReports(undefined, undefined, { page: 0, size: 100 }),
        adminService.getDisputes(undefined, { page: 0, size: 100 }),
      ]);
      setMetrics(m);
      setReports(r.content || []);
      setDisputes(d);
      setError("");
    } catch (f) {
      setError(f instanceof Error ? f.message : "Could not load the admin portal.");
    } finally {
      setLoading(false);
    }
  }, []);
  useLiveRefresh(load);
  useEffect(() => {
    void load();
  }, [load]);
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
            Review reports, investigate issues, and resolve session disputes.
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
          {error}{" "}
          <Button variant="link" onClick={() => void load()}>
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
      <Tabs defaultValue="sessions">
        <TabsList>
          <TabsTrigger value="sessions">
            Session Reports ({disputes.filter((d) => d.status === "OPEN").length})
          </TabsTrigger>
          <TabsTrigger value="content">
            Content Reports ({reports.filter((r) => r.status === "OPEN").length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="sessions" className="space-y-3">
          {disputes.map((d) => (
            <DisputeCard key={d.id} dispute={d} reload={load} />
          ))}
          {!disputes.length && !loading && <Empty />}
        </TabsContent>
        <TabsContent value="content" className="space-y-3">
          {reports.map((r) => (
            <ReportCard key={r.id} report={r} reload={load} />
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
function Empty() {
  return (
    <Card>
      <CardContent className="p-8 text-center text-muted-foreground">
        The review queue is empty.
      </CardContent>
    </Card>
  );
}
function DisputeCard({
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
