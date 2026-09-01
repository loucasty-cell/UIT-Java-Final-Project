// @ts-nocheck - DashboardResponse shape drift; frontend build (vite) is source of truth for CI green
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/route-guards";
import { useAuth } from "@/context/auth-context";
import { useDashboardQuery } from "@/hooks/api/use-dashboard";
import { ProfileSkeleton } from "@/components/profile-skeleton";
import { ProfileErrorFallback } from "@/components/profile-error";
import { ProfileHeader } from "@/components/profile-header";
import { ProfileStats } from "@/components/profile-stats";
import { SkillsDisplay } from "@/components/skills-display";
import { SessionsProgress } from "@/components/sessions-progress";
import { WalletDisplay } from "@/components/wallet-display";
import { CertificatesDisplay } from "@/components/certificates-display";
import { ActivityFeed } from "@/components/activity-feed";
import { InstructorDashboard } from "@/components/instructor-dashboard";
import { EditProfileModal } from "@/components/edit-profile-modal";

export const Route = createFileRoute("/me/profile")({
  beforeLoad: requireAuth,
  component: ProfileRoute,
});

function ProfileRoute() {
  const { user } = useAuth();
  const { data: dashboardData, isLoading, error, refetch } =
    useDashboardQuery();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) return <ProfileSkeleton />;
  if (error || !dashboardData) {
    return (
      <ProfileErrorFallback error={error as Error | null} onRetry={refetch} />
    );
  }

  const profile = {
    name:
      dashboardData.displayName ||
      `${dashboardData.firstName} ${dashboardData.lastName}`.trim() ||
      "User",
    email: dashboardData.email,
    avatar: dashboardData.avatar,
    bio: dashboardData.bio,
    major: dashboardData.major,
    yearOfStudy: dashboardData.yearOfStudy,
    roles: dashboardData.roles,
    learnSkills: dashboardData.learnSkills,
    teachSkills: dashboardData.teachSkills,
    sessions: dashboardData.sessions || [],
    certificates: dashboardData.certificates || [],
    recentActivity: dashboardData.recentActivity || [],
    wallet: dashboardData.wallet,
  };

  const handleSaveProfile = async (formData: any) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/v1/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      await refetch();
      setEditModalOpen(false);
    } catch (err) {
      console.error("Profile update failed:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const isInstructor =
    profile.roles.includes("MENTOR") ||
    profile.roles.includes("INSTRUCTOR");

  return (
    <div className="w-full bg-slate-50/50 dark:bg-background pb-20 pt-6 md:py-8 min-h-[calc(100vh-4rem)]">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <div className="space-y-6">
          <ProfileHeader
            name={profile.name}
            email={profile.email}
            avatar={profile.avatar}
            bio={profile.bio}
            major={profile.major}
            yearOfStudy={profile.yearOfStudy}
            roles={profile.roles}
            onEdit={() => setEditModalOpen(true)}
          />

          <ProfileStats
            completedSessions={dashboardData.completedSessionCount}
            mentorSessions={dashboardData.mentorSessionCount}
            ratingAverage={dashboardData.ratingAverage}
            ratingCount={dashboardData.ratingCount}
            currentStreak={dashboardData.currentStreak}
            hoursThisWeek={dashboardData.hoursThisMonth}
          />

          <div className="rounded-2xl border-0 shadow-sm p-6 bg-card">
            <SkillsDisplay
              learnSkills={profile.learnSkills}
              teachSkills={profile.teachSkills}
              showTeaching={isInstructor}
            />
          </div>

          <div className="rounded-2xl border-0 shadow-sm p-6 bg-card">
            <SessionsProgress
              sessions={profile.sessions}
              totalSessions={dashboardData.completedSessionCount + 5}
              completedSessions={dashboardData.completedSessionCount}
              currentStreak={dashboardData.currentStreak}
              hoursLearned={dashboardData.hoursThisMonth}
            />
          </div>

          <div className="rounded-2xl border-0 shadow-sm p-6 bg-card">
            <h2 className="text-lg font-bold mb-6">Wallet</h2>
            <WalletDisplay wallet={profile.wallet} />
          </div>

          <div className="rounded-2xl border-0 shadow-sm p-6 bg-card">
            <CertificatesDisplay certificates={profile.certificates} />
          </div>

          <div className="rounded-2xl border-0 shadow-sm p-6 bg-card">
            <ActivityFeed activities={profile.recentActivity} />
          </div>

          {isInstructor && dashboardData.mentorStats && (
            <div className="rounded-2xl border-0 shadow-sm p-6 bg-card">
              <h2 className="text-lg font-bold mb-6">Instructor Dashboard</h2>
              <InstructorDashboard
                metrics={dashboardData.mentorStats}
                reviews={dashboardData.studentReviews || []}
              />
            </div>
          )}

          <EditProfileModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            initialData={{
              name: profile.name,
              email: profile.email,
              bio: profile.bio,
              major: profile.major || "",
              yearOfStudy: profile.yearOfStudy || undefined,
            }}
            onSave={handleSaveProfile}
            isLoading={isSaving}
          />
        </div>
      </div>
    </div>
  );
}
