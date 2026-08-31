import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Star, Award, Clock } from "lucide-react";

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  badge?: string;
}

function StatItem({ icon, label, value, badge }: StatItemProps) {
  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <div className="text-muted-foreground">{icon}</div>
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {badge && (
          <Badge variant="secondary" className="text-xs">
            {badge}
          </Badge>
        )}
      </div>
    </div>
  );
}

interface ProfileStatsProps {
  completedSessions: number;
  mentorSessions: number;
  ratingAverage: number;
  ratingCount: number;
  currentStreak: number;
  hoursThisWeek: number;
}

/**
 * PHASE 2: Profile Statistics Component
 * 
 * Displays real engagement metrics from backend:
 * - Completed sessions count
 * - Mentor sessions (if instructor)
 * - Rating average and count
 * - Current streak
 * - Hours learned this week
 */
export function ProfileStats({
  completedSessions,
  mentorSessions,
  ratingAverage,
  ratingCount,
  currentStreak,
  hoursThisWeek,
}: ProfileStatsProps) {
  return (
    <Card className="p-6 rounded-2xl border-0 shadow-sm">
      <h2 className="text-lg font-bold mb-6">Your Progress</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {/* Sessions */}
        <StatItem
          icon={<Award className="w-5 h-5" />}
          label="Sessions Completed"
          value={completedSessions}
        />

        {/* Mentor Sessions */}
        {mentorSessions > 0 && (
          <StatItem
            icon={<Star className="w-5 h-5" />}
            label="Sessions Mentored"
            value={mentorSessions}
          />
        )}

        {/* Rating */}
        <StatItem
          icon={<Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />}
          label="Your Rating"
          value={ratingAverage.toFixed(1)}
          badge={`${ratingCount} ${ratingCount === 1 ? "review" : "reviews"}`}
        />

        {/* Streak */}
        <StatItem
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          label="Current Streak"
          value={`${currentStreak} ${currentStreak === 1 ? "day" : "days"}`}
        />

        {/* Hours This Week */}
        <StatItem
          icon={<Clock className="w-5 h-5" />}
          label="Hours This Week"
          value={hoursThisWeek}
        />
      </div>
    </Card>
  );
}
