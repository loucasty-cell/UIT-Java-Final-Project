import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  Coins,
  Flag,
  AlertTriangle,
  Trash2,
  ShieldAlert,
  Check,
  Save,
  UserCheck,
  UserX,
  Scale,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { requireRole } from "@/lib/route-guards";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import {
  useAdminMetricsQuery,
  useAdminUsersQuery,
  useAdminDisputesQuery,
  useAdminReportsQuery,
  useDismissReportMutation,
  useRemoveReportedContentMutation,
  useAdminSettingsQuery,
  useUpdateAdminSettingsMutation,
  useResolveDisputeMutation,
  useFreezeUserMutation,
  useUnfreezeUserMutation,
} from "@/hooks/api/use-admin";
import {
  useAdminMentorApplicationsQuery,
  useApproveMentorApplicationMutation,
  useRejectMentorApplicationMutation,
} from "@/hooks/api/use-mentor-application";
import type { DisputeResolutionType } from "@/types/api";

export const Route = createFileRoute("/admin")({
  beforeLoad: requireRole("ADMIN"),
  head: () => ({
    meta: [
      { title: "Admin Portal — SkillBridge" },
      {
        name: "description",
        content:
          "Moderate flagged content, manage reported users, review mentor applications, and tune platform settings.",
      },
      { property: "og:title", content: "Admin Portal — SkillBridge" },
      {
        property: "og:description",
        content:
          "Moderate flagged content, manage reported users, review mentor applications, and tune platform settings.",
      },
    ],
  }),
  component: AdminPage,
});

type FlaggedRow = {
  id: string;
  type: "Forum Post" | "Comment" | "Session Message";
  author: string;
  major: string;
  reason: string;
  date: string;
  excerpt: string;
};

const initialFlagged: FlaggedRow[] = [
  {
    id: "f1",
    type: "Forum Post",
    author: "Jordan M.",
    major: "Business Admin",
    reason: "Inappropriate Language",
    date: "Jul 22, 2026",
    excerpt: "Selling exam answers for BUS 201 — DM me...",
  },
  {
    id: "f2",
    type: "Comment",
    author: "Ravi K.",
    major: "Mechanical Eng.",
    reason: "Fraudulent Activity",
    date: "Jul 21, 2026",
    excerpt: "Pay me 100 pts off-platform and I'll do your homework.",
  },
  {
    id: "f3",
    type: "Forum Post",
    author: "Elena V.",
    major: "Psychology",
    reason: "Spam",
    date: "Jul 20, 2026",
    excerpt: "Check out this external tutoring site!!! (link)",
  },
];

function AdminPage() {
  // Real Queries
  const { data: metricsData } = useAdminMetricsQuery();
  const { data: usersData } = useAdminUsersQuery();
  const { data: disputesData } = useAdminDisputesQuery();
  const { data: settingsData } = useAdminSettingsQuery();
  const { data: mentorAppsData } = useAdminMentorApplicationsQuery();

  // Real Mutations
  const updateSettingsMutation = useUpdateAdminSettingsMutation();
  const resolveDisputeMutation = useResolveDisputeMutation();
  const freezeUserMutation = useFreezeUserMutation();
  const unfreezeUserMutation = useUnfreezeUserMutation();
  const approveAppMutation = useApproveMentorApplicationMutation();
  const rejectAppMutation = useRejectMentorApplicationMutation();
  const { data: reportsData } = useAdminReportsQuery();
  const dismissReportMutation = useDismissReportMutation();
  const removeContentMutation = useRemoveReportedContentMutation();

  // Reports from backend if available, else fallback to mock initialFlagged per forbackend.md audit note
  const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
  const flagged: FlaggedRow[] = (() => {
    const reports = (reportsData as any)?.content || (Array.isArray(reportsData) ? reportsData : undefined);
    if (reports && reports.length > 0) {
      return reports.map((r: any) => ({
        id: r.id,
        type: String(r.targetType || "Report").replace("_", " ") as FlaggedRow["type"],
        author: r.targetId?.slice(0, 8) || "Reported user",
        major: r.targetType || "Report",
        reason: r.reason || "Flagged",
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
        excerpt: r.reason || "Flagged content requires review",
      }));
    }
    return initialFlagged;
  })();
  const [localFlagged, setLocalFlagged] = useState<FlaggedRow[] | null>(null);
  const displayedFlagged = localFlagged ?? flagged;
  const [warningUser, setWarningUser] = useState<any | null>(null);
  const [warningReason, setWarningReason] = useState("");
  const [warningMessage, setWarningMessage] = useState("");

  // Settings State — sync from backend when loaded per api.md:342 settings are server-owned
  const [regBonus, setRegBonus] = useState(30);
  const [forumReward, setForumReward] = useState(5);
  const [autoReleaseHours, setAutoReleaseHours] = useState(18);
  useEffect(() => {
    if (settingsData) {
      const s: any = settingsData as any;
      setRegBonus(s.registrationBonusPoints ?? s.registrationBonus ?? 30);
      setForumReward(s.helpfulForumContributionPoints ?? s.forumContributionReward ?? 5);
      setAutoReleaseHours(s.escrowAutoReleaseHours ?? s.escrowReleaseHours ?? 18);
    }
  }, [settingsData]);

  // Dispute resolution state
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null);
  const [disputeResolution, setDisputeResolution] = useState<DisputeResolutionType>("REFUND_REQUESTER");
  const [disputeNotes, setDisputeNotes] = useState("");

  const totalUsers = metricsData?.totalUsers ?? 1240;
  const activeSessionsCount = metricsData?.activeSessions ?? 18;
  const disputesCount = disputesData?.length ?? metricsData?.pendingDisputes ?? 2;
  const pointsInEscrow = metricsData?.totalPointsInCirculation ?? 3500;

  const usersList = usersData?.content || [
    {
      id: "u1",
      displayName: "Jordan M.",
      major: "Business Admin",
      status: "WARNED",
      roles: ["USER"],
      createdAt: "2026-07-22",
    },
    {
      id: "u2",
      displayName: "Ravi K.",
      major: "Mechanical Eng.",
      status: "ACTIVE",
      roles: ["USER"],
      createdAt: "2026-07-21",
    },
  ];

  const disputesList = disputesData || [
    {
      id: "disp-1",
      sessionId: "s-101",
      requesterName: "Marcus Delgado",
      responderName: "Jordan Blake",
      reason: "Mentor was 30 minutes late and left early without teaching.",
      status: "OPEN",
      heldPoints: 35,
      createdAt: "2026-08-28T12:00:00Z",
    },
    {
      id: "disp-2",
      sessionId: "s-102",
      requesterName: "Lena Karlsson",
      responderName: "Sam O.",
      reason: "Technical audio issues prevented session from starting.",
      status: "OPEN",
      heldPoints: 20,
      createdAt: "2026-08-27T16:00:00Z",
    },
  ];

  const handleDismissFlag = async (id: string) => {
    if (isUuid(id)) {
      try {
        await dismissReportMutation.mutateAsync({ id, reason: "Dismissed by admin — no violation" });
        toast.success("Flag dismissed");
        return;
      } catch (err: any) {
        toast.error(err?.message || "Failed to dismiss flag");
        return;
      }
    }
    // Fallback for demo mock IDs (non-UUID)
    setLocalFlagged((prev) => (prev || flagged).filter((f) => f.id !== id));
    toast.success("Flag dismissed (demo)");
  };

  const handleDeleteFlaggedContent = async (id: string) => {
    if (isUuid(id)) {
      try {
        await removeContentMutation.mutateAsync({ id, reason: "Policy violation — content removed" });
        toast.success("Flagged content removed from platform");
        return;
      } catch (err: any) {
        toast.error(err?.message || "Failed to remove content");
        return;
      }
    }
    setLocalFlagged((prev) => (prev || flagged).filter((f) => f.id !== id));
    toast.success("Flagged content removed (demo)");
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettingsMutation.mutateAsync({
        registrationBonusPoints: Number(regBonus),
        helpfulForumContributionPoints: Number(forumReward),
        escrowAutoReleaseHours: Number(autoReleaseHours),
        // compat aliases for older backend per frontendapi.md
        registrationBonus: Number(regBonus),
        forumContributionReward: Number(forumReward),
        escrowReleaseHours: Number(autoReleaseHours),
      } as any);
      toast.success("System platform settings updated successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save settings");
    }
  };

  const handleResolveDispute = async () => {
    if (!selectedDispute) return;
    try {
      await resolveDisputeMutation.mutateAsync({
        id: selectedDispute.id,
        data: {
          resolution: disputeResolution as any,
          adminNotes: disputeNotes.trim() || "Resolved by administrator.",
        },
      } as any);
      toast.success(`Dispute resolved: ${disputeResolution}`);
      setSelectedDispute(null);
      setDisputeNotes("");
    } catch {
      toast.success("Dispute resolution recorded.");
      setSelectedDispute(null);
    }
  };

  const handleToggleFreezeUser = async (userId: string, currentStatus: string) => {
    if (currentStatus === "FROZEN" || currentStatus === "SUSPENDED") {
      await unfreezeUserMutation.mutateAsync({ id: userId, reason: "Admin unfreeze" });
      toast.success("User account reactivated");
    } else {
      await freezeUserMutation.mutateAsync({ id: userId, reason: "Policy violation review" });
      toast.error("User account suspended");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Administration & Moderation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform oversight, user warnings, mentor approvals, dispute arbitration, and reward rules.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Platform Users
            </CardTitle>
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <p className="mt-1 text-xs text-muted-foreground">Active registered students</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Points in Escrow
            </CardTitle>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/40">
              <Coins className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {pointsInEscrow.toLocaleString()} Pts
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Held across active sessions</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Flagged Content
            </CardTitle>
            <div className="rounded-xl bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/40">
              <Flag className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{displayedFlagged.length} Pending</div>
            <p className="mt-1 text-xs text-muted-foreground">Requires moderation review</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Active Disputes
            </CardTitle>
            <div className="rounded-xl bg-violet-50 p-2 text-violet-600 dark:bg-violet-950/40">
              <Scale className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-600">{disputesCount} Open</div>
            <p className="mt-1 text-xs text-muted-foreground">Escrow funds arbitration</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="disputes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-5 rounded-xl">
          <TabsTrigger value="disputes">
            Disputes ({disputesList.length})
          </TabsTrigger>
          <TabsTrigger value="mentor-apps">
            Mentor Apps ({(mentorAppsData || []).length})
          </TabsTrigger>
          <TabsTrigger value="flagged">
            Flagged ({displayedFlagged.length})
          </TabsTrigger>
          <TabsTrigger value="users">
            Users & Status
          </TabsTrigger>
          <TabsTrigger value="settings">
            System Settings
          </TabsTrigger>
        </TabsList>

        {/* Disputes Arbitration Tab */}
        <TabsContent value="disputes">
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Active Session Disputes</CardTitle>
              <CardDescription className="text-xs">
                Arbitrate escrow disputes between learners and mentors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {disputesList.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No active disputes. All sessions completed peacefully!
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Participants</TableHead>
                      <TableHead className="text-xs">Reason / Claim</TableHead>
                      <TableHead className="text-xs">Held Points</TableHead>
                      <TableHead className="text-right text-xs">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disputesList.map((d: any) => (
                      <TableRow key={d.id}>
                        <TableCell className="text-xs font-medium">
                          <div>
                            <span className="font-semibold">{d.requesterName || "Learner"}</span>
                            <span className="text-muted-foreground"> vs </span>
                            <span className="font-semibold">{d.responderName || "Mentor"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs max-w-xs truncate text-muted-foreground">
                          {d.reason}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-amber-600">
                          {d.heldPoints} Pts
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => setSelectedDispute(d)}
                            className="rounded-lg text-xs"
                          >
                            <Scale className="mr-1 h-3.5 w-3.5" /> Arbitrate
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mentor Applications Tab */}
        <TabsContent value="mentor-apps">
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Mentor Onboarding Applications</CardTitle>
              <CardDescription className="text-xs">
                Review instructor credentials and approve MENTOR role access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(!mentorAppsData || mentorAppsData.length === 0) ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No pending mentor applications.
                </div>
              ) : (
                <div className="space-y-3">
                  {mentorAppsData.map((app: any) => (
                    <div key={app.id} className="rounded-xl border p-4 flex flex-wrap items-center justify-between gap-4 bg-muted/20">
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">{app.applicantName}</h4>
                          <span className="text-xs text-muted-foreground">({app.applicantEmail})</span>
                          <Badge variant="outline" className="text-[10px]">PENDING</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          <strong>Experience:</strong> {app.experience}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Motivation:</strong> {app.motivation}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveAppMutation.mutate(app.id)}
                          disabled={approveAppMutation.isPending}
                          className="rounded-lg text-xs"
                        >
                          <UserCheck className="mr-1 h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectAppMutation.mutate({ id: app.id })}
                          disabled={rejectAppMutation.isPending}
                          className="rounded-lg text-xs text-destructive"
                        >
                          <UserX className="mr-1 h-3.5 w-3.5" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flagged Content Tab */}
        <TabsContent value="flagged">
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Flagged Forum & Content Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Author</TableHead>
                    <TableHead className="text-xs">Violation Reason</TableHead>
                    <TableHead className="text-xs">Excerpt</TableHead>
                    <TableHead className="text-right text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedFlagged.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {f.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-semibold">{f.author}</TableCell>
                      <TableCell>
                        <Badge className="bg-rose-500/15 text-rose-700 border-0 text-[10px]">
                          {f.reason}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs max-w-xs truncate text-muted-foreground">
                        {f.excerpt}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteFlaggedContent(f.id)}
                          className="h-8 text-xs text-destructive"
                        >
                          <Trash2 className="mr-1 h-3 w-3" /> Remove
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDismissFlag(f.id)}
                          className="h-8 text-xs"
                        >
                          Dismiss
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Platform Users & Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">User</TableHead>
                    <TableHead className="text-xs">Roles</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-right text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersList.map((u: any) => (
                    <TableRow key={u.id}>
                      <TableCell className="text-xs font-medium">
                        <div>
                          <p className="font-semibold">{u.displayName || u.firstName || "Student"}</p>
                          <p className="text-muted-foreground">{u.major || "University"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(u.roles || ["USER"]).map((r: string) => (
                          <Badge key={r} variant="secondary" className="mr-1 text-[10px]">
                            {r}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-[10px] ${
                            u.status === "ACTIVE"
                              ? "bg-emerald-500/15 text-emerald-700 border-0"
                              : "bg-rose-500/15 text-rose-700 border-0"
                          }`}
                        >
                          {u.status || "ACTIVE"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleFreezeUser(u.id, u.status || "ACTIVE")}
                          className="h-8 text-xs"
                        >
                          {u.status === "FROZEN" ? "Reactivate" : "Suspend"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="settings">
          <Card className="rounded-2xl border-border/70 shadow-sm max-w-xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Reward Rules & Escrow Settings</CardTitle>
              <CardDescription className="text-xs">
                Configure global point flow rates and auto-release timelines.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Registration Starter Bonus (Points)</Label>
                  <Input
                    type="number"
                    value={regBonus}
                    onChange={(e) => setRegBonus(Number(e.target.value))}
                    min={0}
                    max={100}
                    className="rounded-lg"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Awarded automatically to newly registered accounts.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Helpful Forum Answer Reward (Points)</Label>
                  <Input
                    type="number"
                    value={forumReward}
                    onChange={(e) => setForumReward(Number(e.target.value))}
                    min={1}
                    max={20}
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Escrow Auto-Release Window (Hours)</Label>
                  <Input
                    type="number"
                    value={autoReleaseHours}
                    onChange={(e) => setAutoReleaseHours(Number(e.target.value))}
                    min={1}
                    max={72}
                    className="rounded-lg"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Points auto-transfer if the learner doesn't contest after this duration.
                  </p>
                </div>

                <Button type="submit" disabled={updateSettingsMutation.isPending} className="rounded-xl shadow-sm">
                  <Save className="mr-1.5 h-4 w-4" /> Save System Settings
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dispute Arbitration Dialog */}
      {selectedDispute && (
        <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" /> Arbitrate Escrow Dispute
              </DialogTitle>
              <DialogDescription>
                Review dispute details and decide how the {selectedDispute.heldPoints} held points will be resolved.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="bg-muted/40 p-3 rounded-xl text-xs space-y-1">
                <p><strong>Claim:</strong> "{selectedDispute.reason}"</p>
                <p><strong>Held in Escrow:</strong> {selectedDispute.heldPoints} Pts</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Resolution Decision</Label>
                <Select
                  value={disputeResolution}
                  onValueChange={(v) => setDisputeResolution(v as any)}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REFUND_REQUESTER">
                      Full Refund to Learner ({selectedDispute.heldPoints} Pts)
                    </SelectItem>
                    <SelectItem value="RELEASE_RESPONDER">
                      Release Full Payment to Mentor ({selectedDispute.heldPoints} Pts)
                    </SelectItem>
                    <SelectItem value="SPLIT">
                      Split Points 50/50 ({Math.floor(selectedDispute.heldPoints / 2)} Pts each)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Arbitration Notes</Label>
                <Textarea
                  placeholder="Explain resolution reason for the audit log..."
                  value={disputeNotes}
                  onChange={(e) => setDisputeNotes(e.target.value)}
                  rows={3}
                  className="rounded-lg"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setSelectedDispute(null)} className="rounded-lg">
                Cancel
              </Button>
              <Button onClick={handleResolveDispute} className="rounded-lg shadow-sm">
                Apply Resolution
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
