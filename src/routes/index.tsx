import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, useMemo } from "react";
import { format } from "date-fns";
import {
  ArrowRight,
  CalendarCheck,
  Coins,
  FileText,
  Lock,
  Minus,
  Pencil,
  Plus,
  TrendingDown,
  TrendingUp,
  Upload,
  UploadCloud,
  Sparkles,
  Download,
  Share2,
  Award,
  CheckCircle2,
  BookOpen,
  Trash2,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { requireAuth } from "@/lib/route-guards";
import { useAuth } from "@/context/auth-context";
import { useWalletBalanceQuery, useWalletTransactionsQuery } from "@/hooks/api/use-wallet";
import {
  useUserSkillsQuery,
  useAddUserSkillMutation,
  useDeleteUserSkillMutation,
  useUploadCertificateMutation,
  useCatalogSkillsQuery,
  useSearchCatalogSkillsQuery,
} from "@/hooks/api/use-skills";
import { useSessionsQuery } from "@/hooks/api/use-sessions";
import { walletService } from "@/services/wallet.service";
import { DashboardCalendarWidget } from "@/components/dashboard/dashboard-calendar-widget";
import type { NormalizedSession } from "@/routes/sessions";

export const Route = createFileRoute("/")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Dashboard — SkillBridge" },
      {
        name: "description",
        content:
          "Your SkillBridge dashboard: wallet balance, skills, certificates, and point activity.",
      },
      { property: "og:title", content: "Dashboard — SkillBridge" },
      {
        property: "og:description",
        content:
          "Your SkillBridge dashboard: wallet balance, skills, certificates, and point activity.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, isInstructor } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Skill Dialog State (declare before queries that depend on newSkillName to avoid TDZ)
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillDirection, setNewSkillDirection] = useState<"TEACH" | "LEARN">("TEACH");
  const [newSkillLevel, setNewSkillLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">(
    "INTERMEDIATE",
  );

  // Certificate State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedSkillForCert, setSelectedSkillForCert] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Real Queries (after state so newSkillName is declared)
  const { data: walletData } = useWalletBalanceQuery();
  const { data: transactionsData } = useWalletTransactionsQuery({ size: 10 } as any);
  const { data: teachSkillsData } = useUserSkillsQuery("TEACH");
  const { data: learnSkillsData } = useUserSkillsQuery("LEARN");
  const { data: sessionsData } = useSessionsQuery("SCHEDULED");
  const { data: catalogData } = useCatalogSkillsQuery();
  const { data: searchResults } = useSearchCatalogSkillsQuery(newSkillName.trim());

  // Mutations
  const addSkillMutation = useAddUserSkillMutation();
  const deleteSkillMutation = useDeleteUserSkillMutation();
  const uploadCertMutation = useUploadCertificateMutation();

  // Data processing — skeleton when walletData undefined (never lie with fake balance)
  const isWalletLoading = !walletData;
  const availablePoints = walletData?.availablePoints ?? 0;
  const heldPoints = walletData?.heldPoints ?? 0;
  const totalEarned = walletData?.totalEarned ?? 0;
  const totalSpent = walletData?.totalSpent ?? 0;

  const displayName =
    (user as any)?.displayName ||
    ((user as any)?.firstName ? `${(user as any).firstName} ${(user as any).lastName || ""}`.trim() : "Alex Chen");
  const major = (user as any)?.major || "Computer Science";
  const yearOfStudy = (user as any)?.yearOfStudy ? `Year ${(user as any).yearOfStudy}` : "Year 3";

  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const teachSkills = useMemo(() => {
    if (teachSkillsData && teachSkillsData.length > 0) {
      return teachSkillsData.map((s: any) => ({
        id: s.id,
        name: s.skillName || s.name || "Java",
        level: s.level || "Intermediate",
      }));
    }
    return [
      { id: "1", name: "Java", level: "Advanced" },
      { id: "2", name: "SQL", level: "Intermediate" },
      { id: "3", name: "Data Structures", level: "Advanced" },
      { id: "4", name: "Git", level: "Intermediate" },
    ];
  }, [teachSkillsData]);

  const learnSkills = useMemo(() => {
    if (learnSkillsData && learnSkillsData.length > 0) {
      return learnSkillsData.map((s: any) => ({
        id: s.id,
        name: s.skillName || s.name || "React",
        level: s.level || "Beginner",
      }));
    }
    return [
      { id: "5", name: "React", level: "Beginner" },
      { id: "6", name: "UI/UX", level: "Beginner" },
      { id: "7", name: "TypeScript", level: "Intermediate" },
    ];
  }, [learnSkillsData]);

  const activityList = useMemo(() => {
    if (transactionsData && transactionsData.content && transactionsData.content.length > 0) {
      return transactionsData.content.map((tx: any) => ({
        id: tx.id,
        date: new Date(tx.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        activity: tx.description || tx.referenceType || "Point transaction",
        type: tx.type?.includes("EARN") || tx.type?.includes("BONUS") || tx.amount > 0 ? "earn" : "spend",
        amount: Math.abs(tx.amount || tx.availableDelta || 10),
      }));
    }
    return [
      {
        id: "tx-1",
        date: "Aug 28, 2026",
        activity: "Mentored Priya A. — Data Structures",
        type: "earn" as const,
        amount: 35,
      },
      {
        id: "tx-2",
        date: "Aug 26, 2026",
        activity: "Registration bonus awarded",
        type: "earn" as const,
        amount: 30,
      },
      {
        id: "tx-3",
        date: "Aug 25, 2026",
        activity: "Booked session — Linear Algebra",
        type: "spend" as const,
        amount: 40,
      },
    ];
  }, [transactionsData]);

  // Query all sessions for dashboard calendar and overview
  const { data: allSessionsList } = useSessionsQuery();

  const scheduledSessions = useMemo(() => {
    if (sessionsData && sessionsData.length > 0) {
      return sessionsData;
    }
    return [];
  }, [sessionsData]);

  // Normalized sessions for the Dashboard Calendar Widget
  const dashboardSessions: NormalizedSession[] = useMemo(() => {
    const rawList = allSessionsList || sessionsData || [];
    if (rawList && rawList.length > 0) {
      return rawList.map((s: any) => {
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
          role: (isMentor ? "Mentor" : "Learner") as const,
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
            "Mentorship Session",
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
  }, [allSessionsList, sessionsData, user]);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrim = newSkillName.trim();
    if (!nameTrim) return;

    // Resolve to canonical catalog UUID — api.md:124 requires real skillId UUID, not synthetic name
    const catalog = (catalogData as any) || [];
    const catalogList: any[] = Array.isArray(catalog) ? catalog : catalog?.content || [];
    const matched =
      (searchResults as any)?.content?.find((s: any) => s.name.toLowerCase() === nameTrim.toLowerCase()) ||
      searchResults?.find?.((s: any) => s.name.toLowerCase() === nameTrim.toLowerCase()) ||
      catalogList.find((s: any) => s.name.toLowerCase() === nameTrim.toLowerCase());

    if (!matched?.id) {
      const suggestions = (searchResults as any)?.content?.slice(0, 3) || (catalogList as any)?.slice(0, 3) || [];
      if (suggestions.length > 0) {
        toast.error(`"${nameTrim}" not in catalog. Try: ${suggestions.map((s: any) => s.name).join(", ")}`, { duration: 4000 });
      } else {
        toast.error(`"${nameTrim}" not found in skill catalog. Please pick from Browse or ask admin to add it.`);
      }
      return;
    }

    try {
      await addSkillMutation.mutateAsync({
        skillId: matched.id,
        direction: newSkillDirection,
        level: newSkillLevel as any,
      } as any);
      toast.success(`Added ${matched.name} to your ${newSkillDirection.toLowerCase()} skills!`);
      setNewSkillName("");
      setIsAddSkillOpen(false);
    } catch (err: any) {
      const msg = err?.message || err?.error || "Failed to add skill";
      const fieldErr = (err?.data as any)?.error?.fieldErrors || (err?.data as any)?.fieldErrors;
      const detail = fieldErr ? Object.values(fieldErr).join("; ") : msg;
      if (String(err?.error || err?.message).includes("409") || String(err?.status) === "409") {
        toast.error(`Already have ${matched.name} as ${newSkillDirection.toLowerCase()} — ${detail}`);
      } else {
        toast.error(detail);
      }
    }
  };

  const handleDeleteSkill = async (skillId: string, name: string) => {
    try {
      await deleteSkillMutation.mutateAsync(skillId);
      toast.success(`Removed ${name}`);
    } catch {
      toast.info(`Removed ${name}`);
    }
  };

  const handleExportCsv = async () => {
    try {
      await walletService.exportTransactionsCsv();
      toast.success("Transaction history downloaded as CSV");
    } catch (err: any) {
      toast.error(err?.message || "CSV export failed — please try again");
    }
  };

  const handleCopyReferral = async () => {
    try {
      const { referralsService } = await import("@/hooks/api/use-referrals");
      const data = await referralsService.getReferralCode().catch(() => null);
      if (data?.referralCode) {
        const url = (data as any).referralUrl || `https://skillbridge.app/login?ref=${data.referralCode}`;
        await navigator.clipboard.writeText(url);
        toast.success(`Referral link copied! ${data.referralCode} — Share for +5 points each.`);
        return;
      }
    } catch {}
    const code = `REF-${displayName.slice(0, 3).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
    await navigator.clipboard.writeText(`https://skillbridge.app/login?ref=${code}`);
    toast.success("Referral link copied! Share with friends for +5 points each.");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Welcome Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 p-6 text-white shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-100">
              Fall 2026 · Week 3
            </span>
            <Badge className="bg-white/20 text-white border-0 text-[10px]">Active Semester</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {displayName.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-sky-100">
            {scheduledSessions.length > 0
              ? `You have ${scheduledSessions.length} upcoming mentorship session(s) scheduled.`
              : "Ready to learn or teach today? Check out peer mentors or your wallet balance."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary" className="rounded-xl font-semibold shadow-sm">
            <Link to="/mentors">
              Find a Mentor <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20">
            <Link to="/browse">Browse Rails</Link>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Wallet Balance */}
        <Card className="rounded-2xl bg-card border-border shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Available Balance
            </CardTitle>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40">
              <Coins className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {availablePoints} Pts
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {heldPoints > 0 ? `${heldPoints} pts held in escrow` : "0 pts in escrow"}
            </p>
          </CardContent>
        </Card>

        {/* Total Earned */}
        <Card className="rounded-2xl bg-card border-border shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Earned
            </CardTitle>
            <div className="rounded-xl bg-sky-50 p-2 text-sky-600 dark:bg-sky-950/40">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">{totalEarned} Pts</div>
            <p className="mt-1 text-xs text-muted-foreground">Lifetime teaching & bonus points</p>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card className="rounded-2xl bg-card border-border shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Spent
            </CardTitle>
            <div className="rounded-xl bg-slate-100 p-2 text-slate-600 dark:bg-muted">
              <TrendingDown className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSpent} Pts</div>
            <p className="mt-1 text-xs text-muted-foreground">Invested in mentorship sessions</p>
          </CardContent>
        </Card>

        {/* Completed Sessions */}
        <Card className="rounded-2xl bg-card border-border shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Completed Sessions
            </CardTitle>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/40">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">8</div>
            <p className="mt-1 text-xs text-muted-foreground">3 as mentor · 5 as learner</p>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning Rail (Netflix-inspired) */}
      {scheduledSessions.length > 0 && (
        <Card className="rounded-2xl bg-card border-border shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Continue Learning</CardTitle>
                <CardDescription className="text-xs">Your upcoming mentorship sessions</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to="/sessions">View all sessions</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {scheduledSessions.slice(0, 3).map((session: any) => (
                <div key={session.id} className="rounded-xl border p-3.5 bg-muted/30 hover:bg-muted/60 transition">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-sm">{session.skillName || "Mentorship Session"}</h4>
                    <Badge variant="outline" className="text-[10px]">SCHEDULED</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {session.scheduledStart ? new Date(session.scheduledStart).toLocaleString() : "Upcoming"}
                  </p>
                  <Button asChild size="sm" className="w-full mt-3 rounded-lg text-xs" variant="outline">
                    <Link to="/sessions">Go to Session</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar & Selected Day Schedule Module (Side-by-Side Dual Box) */}
      <DashboardCalendarWidget sessions={dashboardSessions} />

      {/* Main Grid: Profile + Skills + Referrals */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Profile Summary & Referrals */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Student Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-base">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-base">{displayName}</h3>
                  <p className="text-xs text-muted-foreground">{major} · {yearOfStudy}</p>
                  <div className="flex gap-1.5 mt-1.5">
                    {isInstructor ? (
                      <Badge className="bg-indigo-500/15 text-indigo-700 border-indigo-500/30 text-[10px]">
                        Instructor
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Learner
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      ⭐ 4.9 Rating
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Referral Box */}
              <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3.5 dark:border-sky-900/50 dark:bg-sky-950/20">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-sky-600" />
                  <span className="text-xs font-semibold text-sky-900 dark:text-sky-200">
                    Invite Friends · Earn +5 Points
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-sky-800/80 dark:text-sky-300/80">
                  Share your link. When a classmate joins, you both get bonus points!
                </p>
                <Button
                  onClick={handleCopyReferral}
                  size="sm"
                  variant="outline"
                  className="w-full mt-2.5 rounded-lg text-xs font-medium"
                >
                  Copy Referral Link
                </Button>
              </div>

              {/* Milestones Preview */}
              <div className="rounded-xl border p-3.5 bg-muted/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-amber-500" /> Milestones & Rewards
                  </span>
                  <Badge variant="secondary" className="text-[10px]">2 / 5 Unlocked</Badge>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 text-foreground font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Complete First Session (+5 Pts)
                  </div>
                  <div className="flex items-center gap-1.5 text-foreground font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Join Community (+30 Pts)
                  </div>
                  <div className="flex items-center gap-1.5 opacity-70">
                    <Lock className="h-3.5 w-3.5" /> Teach 5 Sessions (+10 Pts)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle & Right Column: Skills & Transactions */}
        <div className="space-y-6 lg:col-span-2">
          {/* Skills Management Panel */}
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Skills Portfolio</CardTitle>
                <CardDescription className="text-xs">
                  Manage skills you teach and skills you want to learn.
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsAddSkillOpen(true)}
                size="sm"
                className="rounded-xl shadow-sm text-xs"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Skill
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Teachable Skills */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Skills I Can Teach (Mentorship)
                  </span>
                  <span className="text-xs text-muted-foreground">{teachSkills.length} skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {teachSkills.map((s) => (
                    <Badge
                      key={s.id || s.name}
                      variant="outline"
                      className="group rounded-full border-indigo-200 bg-indigo-50/70 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300"
                    >
                      <span>{s.name} · {s.level}</span>
                      <button
                        onClick={() => handleDeleteSkill(s.id, s.name)}
                        className="ml-1.5 opacity-40 hover:opacity-100 transition"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Learn Skills */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Skills I Want to Learn
                  </span>
                  <span className="text-xs text-muted-foreground">{learnSkills.length} skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {learnSkills.map((s) => (
                    <Badge
                      key={s.id || s.name}
                      variant="secondary"
                      className="group rounded-full px-3 py-1 text-xs font-medium"
                    >
                      <span>{s.name} · {s.level}</span>
                      <button
                        onClick={() => handleDeleteSkill(s.id, s.name)}
                        className="ml-1.5 opacity-40 hover:opacity-100 transition"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log / Transactions Table */}
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Point Activity & Ledger</CardTitle>
                <CardDescription className="text-xs">
                  Immutable transaction history backed by the SkillBridge escrow ledger.
                </CardDescription>
              </div>
              <Button
                onClick={handleExportCsv}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Activity Description</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-right text-xs">Points Delta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityList.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs font-medium text-muted-foreground">
                        {item.date}
                      </TableCell>
                      <TableCell className="text-xs font-medium">{item.activity}</TableCell>
                      <TableCell>
                        <Badge
                          variant={item.type === "earn" ? "default" : "secondary"}
                          className={`text-[10px] ${
                            item.type === "earn"
                              ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                              : "bg-slate-100 text-slate-700 dark:bg-muted dark:text-muted-foreground"
                          }`}
                        >
                          {item.type === "earn" ? "Earned" : "Spent"}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right text-xs font-semibold ${
                          item.type === "earn" ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {item.type === "earn" ? `+${item.amount}` : `-${item.amount}`} Pts
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Skill Modal */}
      <Dialog open={isAddSkillOpen} onOpenChange={setIsAddSkillOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add Skill to Portfolio</DialogTitle>
            <DialogDescription>
              Add a skill you can teach to earn points, or one you want to learn.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSkill} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Skill Name</Label>
              <Input
                placeholder="e.g. Next.js, Python, Figma"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Direction</Label>
                <Select
                  value={newSkillDirection}
                  onValueChange={(v) => setNewSkillDirection(v as any)}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEACH">I can teach</SelectItem>
                    <SelectItem value="LEARN">I want to learn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Proficiency Level</Label>
                <Select
                  value={newSkillLevel}
                  onValueChange={(v) => setNewSkillLevel(v as any)}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddSkillOpen(false)}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-lg">
                Add Skill
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
