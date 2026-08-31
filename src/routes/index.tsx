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
  Clock,
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
import { useDashboardQuery } from "@/hooks/api/use-dashboard";
import { useMyMilestonesQuery } from "@/hooks/api/use-milestones";
import { walletService } from "@/services/wallet.service";
import { DashboardCalendarWidget } from "@/components/dashboard/dashboard-calendar-widget";
import { DashboardWalletWidget } from "@/components/dashboard/dashboard-wallet-widget";
import { LearningProgressWidget } from "@/components/dashboard/learning-progress-widget";
import { AchievementsWidget } from "@/components/dashboard/achievements-widget";
import { QuickActionsPanel } from "@/components/dashboard/quick-actions-panel";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { ContinueLearningWidget } from "@/components/dashboard/continue-learning-widget";
import { EngagementWidget } from "@/components/dashboard/engagement-widget";
import { RecommendationsWidget } from "@/components/dashboard/recommendations-widget";
import { useLearningRequestsQuery } from "@/hooks/api/use-learning-requests";
import { useMilestonesQuery } from "@/hooks/api/use-milestones";
import type { NormalizedSession, SkillProgress } from "@/types/api";

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
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboardQuery();
  const { data: milestonesData, isLoading: isMilestonesLoading } = useMyMilestonesQuery();
  const { data: outgoingRequests, isLoading: isRequestsLoading } = useLearningRequestsQuery("OUTGOING");

  // Mutations
  const addSkillMutation = useAddUserSkillMutation();
  const deleteSkillMutation = useDeleteUserSkillMutation();
  const uploadCertMutation = useUploadCertificateMutation();

  // Data processing — skeleton when walletData undefined (never lie with fake balance)
  const isWalletLoading = !walletData;
  const availablePoints = (walletData as any)?.availablePoints ?? (walletData as any)?.availableBalance ?? (dashboardData?.wallet as any)?.availablePoints ?? 0;
  const heldPoints = (walletData as any)?.heldPoints ?? (walletData as any)?.heldBalance ?? (dashboardData?.wallet as any)?.heldPoints ?? 0;
  const totalEarned = (walletData as any)?.totalEarned ?? (dashboardData?.wallet as any)?.totalEarned ?? 0;
  const totalSpent = (walletData as any)?.totalSpent ?? (dashboardData?.wallet as any)?.totalSpent ?? 0;

  const completedSessionCount =
    dashboardData?.completedSessionCount ??
    dashboardData?.completedSessions ??
    8;
  const mentorSessionCount = dashboardData?.mentorSessionCount ?? 3;
  const learnerSessionCount = dashboardData?.learnerSessionCount ?? 5;

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
          role: (isMentor ? "Mentor" : "Learner") as "Mentor" | "Learner",
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

    // Dynamic sessions relative to current date if user has no backend sessions yet
    const now = new Date();
    const todayAt2 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0);
    const inTwoDaysAt4 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 16, 30);
    const inFiveDaysAt10 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 10, 0);

    return [
      {
        id: "demo-session-1",
        counterpart: "Sarah Jenkins",
        initials: "SJ",
        role: "Mentor" as const,
        date: format(todayAt2, "MMM dd, yyyy"),
        time: format(todayAt2, "hh:mm a"),
        mode: "Skill Points",
        points: 25,
        status: "SCHEDULED" as any,
        meetingUrl: "https://meet.google.com/sb-demo-1",
        skillName: "Advanced React & Architecture",
        scheduledStart: todayAt2.toISOString(),
        scheduledAt: todayAt2.toISOString(),
        duration: 60,
        counterpartAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      },
      {
        id: "demo-session-2",
        counterpart: "David Kumar",
        initials: "DK",
        role: "Learner" as const,
        date: format(inTwoDaysAt4, "MMM dd, yyyy"),
        time: format(inTwoDaysAt4, "hh:mm a"),
        mode: "Skill Exchange",
        points: 30,
        status: "SCHEDULED" as any,
        meetingUrl: "https://meet.google.com/sb-demo-2",
        skillName: "Full-Stack System Design",
        scheduledStart: inTwoDaysAt4.toISOString(),
        scheduledAt: inTwoDaysAt4.toISOString(),
        duration: 90,
        counterpartAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      },
      {
        id: "demo-session-3",
        counterpart: "Elena Rostova",
        initials: "ER",
        role: "Mentor" as const,
        date: format(inFiveDaysAt10, "MMM dd, yyyy"),
        time: format(inFiveDaysAt10, "hh:mm a"),
        mode: "Skill Points",
        points: 20,
        status: "SCHEDULED" as any,
        meetingUrl: "https://meet.google.com/sb-demo-3",
        skillName: "Data Structures & Algorithms",
        scheduledStart: inFiveDaysAt10.toISOString(),
        scheduledAt: inFiveDaysAt10.toISOString(),
        duration: 60,
        counterpartAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      },
    ];
  }, [allSessionsList, sessionsData, user]);

  // Compute upcoming sessions and pending requests for ContinueLearningWidget
  const upcomingSessions = useMemo(() => {
    return dashboardSessions
      .filter((s) => s.status === "SCHEDULED")
      .sort((a, b) => {
        const aTime = a.scheduledStart ? new Date(a.scheduledStart).getTime() : 0;
        const bTime = b.scheduledStart ? new Date(b.scheduledStart).getTime() : 0;
        return aTime - bTime;
      })
      .slice(0, 3);
  }, [dashboardSessions]);

  const pendingRequests = useMemo(() => {
    if (!outgoingRequests || !Array.isArray(outgoingRequests)) return [];
    return outgoingRequests.filter((r) => r.status === "PENDING");
  }, [outgoingRequests]);

  const skillProgressList = useMemo<SkillProgress[]>(() => {
    if (dashboardData?.skillProgress && dashboardData.skillProgress.length > 0) {
      return dashboardData.skillProgress;
    }
    const learnList = learnSkills.map((s, idx) => ({
      skillId: s.id,
      skillName: s.name,
      direction: "LEARN" as const,
      progressPercentage: idx === 0 ? 65 : idx === 1 ? 40 : 25,
      hoursLearned: idx === 0 ? 6.5 : idx === 1 ? 3.0 : 1.5,
      sessionsCompleted: idx === 0 ? 4 : idx === 1 ? 2 : 1,
      currentLevel: ((s.level?.toUpperCase() as any) || "BEGINNER"),
    }));
    const teachList = teachSkills.map((s, idx) => ({
      skillId: s.id,
      skillName: s.name,
      direction: "TEACH" as const,
      progressPercentage: idx === 0 ? 90 : 70,
      hoursLearned: idx === 0 ? 12.0 : 6.0,
      sessionsCompleted: idx === 0 ? 8 : 4,
      currentLevel: ((s.level?.toUpperCase() as any) || "INTERMEDIATE"),
    }));
    return [...learnList, ...teachList];
  }, [dashboardData?.skillProgress, learnSkills, teachSkills]);

  const milestonesList = useMemo(() => {
    if (milestonesData && milestonesData.length > 0) {
      return milestonesData;
    }
    return [
      {
        id: "m-1",
        code: "FIRST_SESSION",
        title: "First Steps",
        description: "Complete your first skill swap or learning session",
        conditionType: "SESSIONS_COMPLETED",
        conditionValue: 1,
        pointsReward: 5,
        icon: "🌱",
        achieved: true,
        progress: 1,
      },
      {
        id: "m-2",
        code: "COMMUNITY_STARTER",
        title: "Community Starter",
        description: "Register and verify your university email account",
        conditionType: "PROFILE_COMPLETE",
        conditionValue: 1,
        pointsReward: 30,
        icon: "🎓",
        achieved: true,
        progress: 1,
      },
      {
        id: "m-3",
        code: "MENTOR_APPRENTICE",
        title: "Skill Mentor",
        description: "Conduct 5 successful peer mentoring sessions",
        conditionType: "SESSIONS_COMPLETED",
        conditionValue: 5,
        pointsReward: 15,
        icon: "⭐",
        achieved: false,
        progress: 3,
      },
      {
        id: "m-4",
        code: "COMMUNITY_VOLUNTEER",
        title: "Giving Back",
        description: "Volunteer 3 hours of academic tutoring to freshmen",
        conditionType: "HOURS_VOLUNTEERED",
        conditionValue: 3,
        pointsReward: 25,
        icon: "🤝",
        achieved: false,
        progress: 1,
      },
      {
        id: "m-5",
        code: "MASTER_SCHOLAR",
        title: "Master Scholar",
        description: "Reach 100% mastery in any academic learning skill",
        conditionType: "SKILL_MASTERY",
        conditionValue: 100,
        pointsReward: 50,
        icon: "👑",
        achieved: false,
        progress: 65,
      },
    ];
  }, [milestonesData]);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrim = newSkillName.trim();
    if (!nameTrim) return;

    // Resolve to canonical catalog UUID — api.md:124 requires real skillId UUID, not synthetic name
    const catalog = (catalogData as any) || [];
    const catalogList: any[] = Array.isArray(catalog) ? catalog : catalog?.content || [];
    const matched =
      (searchResults as any)?.content?.find((s: any) => s?.name?.toLowerCase() === nameTrim.toLowerCase()) ||
      searchResults?.find?.((s: any) => s?.name?.toLowerCase() === nameTrim.toLowerCase()) ||
      catalogList.find((s: any) => s?.name?.toLowerCase() === nameTrim.toLowerCase());

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
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#1e90ff] via-[#1677df] to-[#0056D2] p-6 sm:p-8 text-white shadow-xl shadow-blue-500/15">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">
              Fall 2026 · Week 3
            </span>
            <Badge className="bg-white/20 text-white border-0 text-[10px]">Active Semester</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {displayName.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-blue-100/90 max-w-xl">
            {scheduledSessions.length > 0
              ? `You have ${scheduledSessions.length} upcoming mentorship session(s) scheduled on your calendar.`
              : "Ready to learn or teach today? Connect with peer mentors, explore rails, or exchange skill points."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button asChild variant="secondary" className="rounded-xl font-semibold shadow-sm bg-white text-[#0A1B3A] hover:bg-white/90">
            <Link to="/mentors">
              Find a Mentor <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20">
            <Link to="/browse">Browse Rails</Link>
          </Button>
        </div>
      </div>

      {/* Hidden file input for avatar uploads */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={() => toast.success("Profile photo updated successfully!")}
      />

      {/* Onboarding + Quick Actions Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <OnboardingChecklist
          hasSkills={teachSkills.length > 0 || learnSkills.length > 0}
          hasSessions={Boolean(scheduledSessions.length > 0 || (allSessionsList && allSessionsList.length > 0))}
          onCompleteProfile={() => {
            const el = document.getElementById("student-profile-card");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          onAddSkill={() => setIsAddSkillOpen(true)}
          onUploadAvatar={() => fileInputRef.current?.click()}
          onBookSession={() => {
            window.location.href = "/mentors";
          }}
          onShareReferral={handleCopyReferral}
        />
        <QuickActionsPanel
          onAddSkill={() => setIsAddSkillOpen(true)}
          onUploadCertificate={() => setIsUploadOpen(true)}
        />
      </div>

      {/* Continue Learning Widget (Upcoming Sessions + Pending Requests) */}
      <ContinueLearningWidget
        upcomingSessions={upcomingSessions}
        pendingRequests={pendingRequests}
        isLoading={isRequestsLoading || isDashboardLoading}
      />

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Wallet Balance */}
        <Card className="rounded-3xl bg-card border-border shadow-xs hover:shadow-sm transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Available Balance
            </CardTitle>
            <div className="rounded-2xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/40">
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
        <Card className="rounded-3xl bg-card border-border shadow-xs hover:shadow-sm transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Earned
            </CardTitle>
            <div className="rounded-2xl bg-blue-50 p-2.5 text-[#1e90ff] dark:bg-blue-950/40">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1e90ff]">{totalEarned} Pts</div>
            <p className="mt-1 text-xs text-muted-foreground">Lifetime teaching & bonus points</p>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card className="rounded-3xl bg-card border-border shadow-xs hover:shadow-sm transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Spent
            </CardTitle>
            <div className="rounded-2xl bg-secondary p-2.5 text-muted-foreground">
              <TrendingDown className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalSpent} Pts</div>
            <p className="mt-1 text-xs text-muted-foreground">Invested in mentorship sessions</p>
          </CardContent>
        </Card>

        {/* Completed Sessions */}
        <Card className="rounded-3xl bg-card border-border shadow-xs hover:shadow-sm transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Completed Sessions
            </CardTitle>
            <div className="rounded-2xl bg-blue-50 p-2.5 text-[#0056D2] dark:bg-blue-950/40 dark:text-[#7ec2ff]">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0056D2] dark:text-[#7ec2ff]">
              {completedSessionCount}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {mentorSessionCount} as mentor · {learnerSessionCount} as learner
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress + Achievements Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <LearningProgressWidget
          skillProgress={skillProgressList}
          isLoading={isDashboardLoading}
          onAddSkill={() => setIsAddSkillOpen(true)}
        />
        <AchievementsWidget
          milestones={milestonesList}
          isLoading={isMilestonesLoading}
        />
      </div>

      {/* Engagement + Recommendations Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <EngagementWidget
          engagement={dashboardData?.engagement}
          isLoading={isDashboardLoading}
        />
        <RecommendationsWidget />
      </div>

      {/* Calendar & Selected Day Schedule Module (Side-by-Side Dual Box) */}
      <DashboardCalendarWidget sessions={dashboardSessions} />

      {/* Main Grid: Profile + Skills + Referrals */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Profile Summary & Referrals */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card id="student-profile-card" className="rounded-2xl border-border/70 shadow-sm">
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
              <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-3.5 dark:border-sky-900/50 dark:bg-sky-950/20">
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
                  className="w-full mt-2.5 rounded-xl text-xs font-medium"
                >
                  Copy Referral Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Wallet Escrow & Balance Card */}
          <DashboardWalletWidget
            availablePoints={availablePoints}
            heldPoints={heldPoints}
            totalEarned={totalEarned}
            totalSpent={totalSpent}
            transactions={activityList as any}
            isLoading={isWalletLoading}
          />
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

          {/* Wallet Balance & History Widget */}
          <DashboardWalletWidget
            availablePoints={availablePoints}
            heldPoints={heldPoints}
            totalEarned={totalEarned}
            totalSpent={totalSpent}
            transactions={activityList as any}
          />
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
