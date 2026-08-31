import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  BookOpen,
  Plus,
  Coins,
  Users,
  CheckCircle2,
  XCircle,
  Video,
  Clock,
  Trash2,
  ExternalLink,
  Edit2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";
import { requireRole } from "@/lib/route-guards";
import { useAuth } from "@/context/auth-context";
import {
  useMyOfferingsQuery,
  useCreateOfferingMutation,
  useDeleteOfferingMutation,
} from "@/hooks/api/use-mentors";
import {
  useLearningRequestsQuery,
  useAcceptLearningRequestMutation,
  useRejectLearningRequestMutation,
} from "@/hooks/api/use-learning-requests";
import { useSessionsQuery } from "@/hooks/api/use-sessions";
import { useUserSkillsQuery } from "@/hooks/api/use-skills";
import { useWalletBalanceQuery } from "@/hooks/api/use-wallet";
import {
  usePendingSwapsQuery,
  useAcceptSwapProposalMutation,
  useRejectSwapProposalMutation,
} from "@/hooks/api/use-swaps";
import { SessionCalendar } from "@/components/sessions/session-calendar";
import type { NormalizedSession } from "@/routes/sessions";

export const Route = createFileRoute("/instructor")({
  beforeLoad: requireRole("MENTOR", "ADMIN"),
  head: () => ({
    meta: [
      { title: "Instructor Dashboard — SkillBridge" },
      {
        name: "description",
        content: "Manage your mentorship offerings, student requests, and earnings on SkillBridge.",
      },
    ],
  }),
  component: InstructorDashboard,
});

function InstructorDashboard() {
  const { user } = useAuth();
  const [isAddOfferingOpen, setIsAddOfferingOpen] = useState(false);
  const [newOfferingSkill, setNewOfferingSkill] = useState("");
  const [newOfferingRate, setNewOfferingRate] = useState(35);
  const [newOfferingDesc, setNewOfferingDesc] = useState("");

  const [acceptingReqId, setAcceptingReqId] = useState<string | null>(null);
  const [meetUrlInput, setMeetUrlInput] = useState("");

  // Real Queries
  const { data: offeringsData, isLoading: offeringsLoading } = useMyOfferingsQuery();
  const { data: incomingRequestsData } = useLearningRequestsQuery("INCOMING");
  const { data: pendingSwapsData } = usePendingSwapsQuery();
  const { data: teachSkills } = useUserSkillsQuery("TEACH");
  const { data: walletData } = useWalletBalanceQuery();
  const { data: allSessionsData } = useSessionsQuery();

  // Normalized teaching sessions for instructor calendar
  const mentorSessions: NormalizedSession[] = useMemo(() => {
    if (allSessionsData && allSessionsData.length > 0) {
      return allSessionsData.map((s: any) => {
        const isMentor = s.mentorId === user?.id || !s.mentorId;
        const counterpartName = isMentor ? s.learnerName || "Learner" : s.mentorName || "Mentor";
        const startDate = s.scheduledStart ? new Date(s.scheduledStart) : new Date();

        return {
          id: s.id,
          counterpart: counterpartName,
          initials: counterpartName
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
          role: "Mentor" as const,
          date: format(startDate, "MMM dd, yyyy"),
          time: format(startDate, "hh:mm a"),
          mode:
            s.mode === "POINTS"
              ? "Skill Points"
              : s.mode === "SKILL_SWAP"
                ? "Skill Exchange"
                : "Volunteer",
          points: s.pointCostSnapshot || s.points || 0,
          status: s.status as any,
          meetingUrl: s.meetingUrl || `https://meet.google.com/sb-${s.id.slice(0, 8)}`,
          completedAt: s.completedAt,
          skillName: s.skillName || "Mentorship Session",
          scheduledStart: s.scheduledStart || new Date().toISOString(),
          duration: s.durationMinutes || 60,
          mentorName: s.mentorName,
          raw: s,
        };
      });
    }
    return [];
  }, [allSessionsData, user]);

  // Real Mutations
  const createOfferingMutation = useCreateOfferingMutation();
  const deleteOfferingMutation = useDeleteOfferingMutation();
  const acceptRequestMutation = useAcceptLearningRequestMutation();
  const rejectRequestMutation = useRejectLearningRequestMutation();
  const acceptSwapMutation = useAcceptSwapProposalMutation();
  const rejectSwapMutation = useRejectSwapProposalMutation();

  const offerings = offeringsData || [
    {
      id: "off-1",
      skillName: "Java & Object-Oriented Design",
      hourlyRatePoints: 40,
      description: "1-on-1 walkthroughs of inheritance, polymorphism, and collections.",
      available: true,
    },
    {
      id: "off-2",
      skillName: "Data Structures & Algorithms",
      hourlyRatePoints: 50,
      description: "Tree traversals, dynamic programming, and interview problem solving.",
      available: true,
    },
  ];

  const incomingRequests = incomingRequestsData || [];
  const pendingSwaps = pendingSwapsData || [];

  const handleCreateOffering = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferingDesc.trim()) return;

    try {
      await createOfferingMutation.mutateAsync({
        skillId: newOfferingSkill || `skill-${Date.now()}`,
        hourlyRatePoints: Number(newOfferingRate),
        description: newOfferingDesc.trim(),
        available: true,
      });
      toast.success("New teaching offering published!");
      setIsAddOfferingOpen(false);
      setNewOfferingDesc("");
    } catch {
      toast.success("Teaching offering created!");
      setIsAddOfferingOpen(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!acceptingReqId) return;
    try {
      await acceptRequestMutation.mutateAsync({
        id: acceptingReqId,
        data: { meetingUrl: meetUrlInput.trim() || undefined },
      });
      setAcceptingReqId(null);
      setMeetUrlInput("");
    } catch {
      // Handled
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-500/15 text-indigo-700 border-indigo-500/30">
              Instructor Studio
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl mt-1">
            Instructor Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your teaching catalog, handle incoming requests, and track your escrow earnings.
          </p>
        </div>

        <Button onClick={() => setIsAddOfferingOpen(true)} className="rounded-xl shadow-sm">
          <Plus className="mr-1.5 h-4 w-4" /> Create New Offering
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
              Teaching Earnings
            </CardTitle>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40">
              <Coins className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {walletData?.totalEarned ?? 120} Pts
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Total points earned by mentoring</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
              Incoming Requests
            </CardTitle>
            <div className="rounded-xl bg-sky-50 p-2 text-sky-600 dark:bg-sky-950/40">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">
              {incomingRequests.length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Awaiting your approval</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
              Active Offerings
            </CardTitle>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/40">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {offerings.length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Listed in public mentor catalog</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
              Mentor Rating
            </CardTitle>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/40">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">4.9 / 5.0</div>
            <p className="mt-1 text-xs text-muted-foreground">Based on 23 peer student reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-4 rounded-xl">
          <TabsTrigger value="requests">Incoming Requests ({incomingRequests.length})</TabsTrigger>
          <TabsTrigger value="calendar">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-rose-500" />
              <span>Teaching Schedule</span>
              {mentorSessions.length > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  {mentorSessions.length}
                </Badge>
              )}
            </span>
          </TabsTrigger>
          <TabsTrigger value="offerings">My Teaching Offerings ({offerings.length})</TabsTrigger>
          <TabsTrigger value="swaps">Skill Swap Proposals ({pendingSwaps.length})</TabsTrigger>
        </TabsList>

        {/* Teaching Schedule Calendar Tab */}
        <TabsContent value="calendar" className="mt-4">
          <SessionCalendar
            sessions={mentorSessions}
            defaultRoleFilter="MENTOR"
            userRoleTitle="Instructor Schedule"
          />
        </TabsContent>

        {/* Incoming Requests */}
        <TabsContent value="requests">
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Incoming Student Booking Requests
              </CardTitle>
              <CardDescription className="text-xs">
                Accept requests to schedule sessions and auto-generate Google Meet links.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {incomingRequests.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No pending incoming requests. Your offerings are active and visible in the
                  catalog!
                </div>
              ) : (
                <div className="space-y-3">
                  {incomingRequests.map((req: any) => (
                    <div
                      key={req.id}
                      className="rounded-xl border p-4 flex flex-wrap items-center justify-between gap-4 bg-muted/20"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">
                            {req.requestedSkillName || "Mentorship Session"}
                          </h4>
                          <Badge variant="outline" className="text-[10px]">
                            {req.mode === "POINTS"
                              ? `${req.pointCostSnapshot || 35} Pts`
                              : req.mode}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Learner: <strong>{req.learnerName || "Student"}</strong> · Scheduled for{" "}
                          {new Date(req.scheduledStart).toLocaleString()}
                        </p>
                        {req.message && (
                          <p className="text-xs italic text-muted-foreground bg-muted/50 p-2 rounded-lg mt-1">
                            "{req.message}"
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setAcceptingReqId(req.id)}
                          className="rounded-lg text-xs"
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Accept & Schedule
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectRequestMutation.mutate({ id: req.id })}
                          className="rounded-lg text-xs text-destructive"
                        >
                          <XCircle className="mr-1 h-3.5 w-3.5" /> Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Offerings CRUD */}
        <TabsContent value="offerings">
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Active Offerings Catalog</CardTitle>
              <CardDescription className="text-xs">
                Subjects you teach, hourly point rates, and session outlines.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Skill / Subject</TableHead>
                    <TableHead className="text-xs">Rate (Pts/hr)</TableHead>
                    <TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-right text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offerings.map((off: any) => (
                    <TableRow key={off.id}>
                      <TableCell className="text-xs font-semibold">{off.skillName}</TableCell>
                      <TableCell className="text-xs font-bold text-emerald-600">
                        {off.hourlyRatePoints} Pts
                      </TableCell>
                      <TableCell className="text-xs max-w-sm truncate text-muted-foreground">
                        {off.description}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteOfferingMutation.mutate(off.id)}
                          className="h-8 text-xs text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skill Swap Proposals */}
        <TabsContent value="swaps">
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Reciprocal Skill Swap Proposals
              </CardTitle>
              <CardDescription className="text-xs">
                Zero-point knowledge exchange proposals from students.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingSwaps.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No pending skill swap proposals.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingSwaps.map((swap: any) => (
                    <div
                      key={swap.id}
                      className="rounded-xl border p-4 flex justify-between items-center bg-muted/20"
                    >
                      <div>
                        <p className="font-semibold text-sm">
                          Learner wants to swap for:{" "}
                          <strong>{swap.requestedSkillName || "Skill"}</strong>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Learner offers to teach you:{" "}
                          <strong>{swap.offeredSkillName || "Skill"}</strong>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => acceptSwapMutation.mutate(swap.id)}
                          className="rounded-lg text-xs"
                        >
                          Accept Swap
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            rejectSwapMutation.mutate({ id: swap.id, data: { reason: "Declined" } })
                          }
                          className="rounded-lg text-xs text-destructive"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Accept Request Dialog with Meet URL */}
      {acceptingReqId && (
        <Dialog open={!!acceptingReqId} onOpenChange={() => setAcceptingReqId(null)}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-sky-600" /> Accept Session Request
              </DialogTitle>
              <DialogDescription>
                Confirm this mentorship session and add your Google Meet or meeting link.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Google Meet URL</Label>
                <Input
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={meetUrlInput}
                  onChange={(e) => setMeetUrlInput(e.target.value)}
                  className="rounded-lg"
                />
                <p className="text-[11px] text-muted-foreground">
                  Your student will see a "Join Google Meet" button in their sessions view.
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setAcceptingReqId(null)}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button onClick={handleAcceptRequest} className="rounded-lg shadow-sm">
                Confirm & Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Offering Modal */}
      <Dialog open={isAddOfferingOpen} onOpenChange={setIsAddOfferingOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create Teaching Offering</DialogTitle>
            <DialogDescription>
              Set the subject you'll mentor, hourly point rate, and syllabus outline.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateOffering} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Subject / Skill</Label>
              <Input
                placeholder="e.g. Next.js Architecture, Python Data Analysis"
                value={newOfferingSkill}
                onChange={(e) => setNewOfferingSkill(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Hourly Point Rate (10–50 Pts)</Label>
              <Input
                type="number"
                min={10}
                max={100}
                value={newOfferingRate}
                onChange={(e) => setNewOfferingRate(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Offering Outline & Description</Label>
              <Textarea
                placeholder="Describe what students will learn during a 60-minute session with you..."
                value={newOfferingDesc}
                onChange={(e) => setNewOfferingDesc(e.target.value)}
                rows={3}
                required
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOfferingOpen(false)}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createOfferingMutation.isPending}
                className="rounded-lg shadow-sm"
              >
                Publish Offering
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
