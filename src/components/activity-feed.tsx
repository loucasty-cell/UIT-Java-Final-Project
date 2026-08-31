import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Award, BookOpen, Users, Zap } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "SESSION_COMPLETED" | "SKILL_GAINED" | "CERTIFICATE_EARNED" | "SESSION_STARTED" | "BADGE_EARNED" | "POINTS_EARNED";
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
  metadata?: Record<string, any>;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

function ActivityTypeIcon({ type }: { type: string }) {
  const iconMap: { [key: string]: React.ReactNode } = {
    SESSION_COMPLETED: <BookOpen className="w-4 h-4" />,
    SKILL_GAINED: <Zap className="w-4 h-4" />,
    CERTIFICATE_EARNED: <Award className="w-4 h-4" />,
    SESSION_STARTED: <Users className="w-4 h-4" />,
    BADGE_EARNED: <Award className="w-4 h-4" />,
    POINTS_EARNED: <Zap className="w-4 h-4" />,
  };
  return iconMap[type] || <Activity className="w-4 h-4" />;
}

function ActivityTypeBadge({ type }: { type: string }) {
  const badgeMap: { [key: string]: { color: string; label: string } } = {
    SESSION_COMPLETED: { color: "bg-blue-100 text-blue-800", label: "Session Completed" },
    SKILL_GAINED: { color: "bg-purple-100 text-purple-800", label: "Skill Gained" },
    CERTIFICATE_EARNED: { color: "bg-amber-100 text-amber-800", label: "Certificate" },
    SESSION_STARTED: { color: "bg-green-100 text-green-800", label: "Session Started" },
    BADGE_EARNED: { color: "bg-pink-100 text-pink-800", label: "Badge Earned" },
    POINTS_EARNED: { color: "bg-orange-100 text-orange-800", label: "Points Earned" },
  };

  const config = badgeMap[type] || { color: "bg-gray-100 text-gray-800", label: type };

  return (
    <Badge className={`${config.color} text-xs`}>
      {config.label}
    </Badge>
  );
}

function ActivityCard({ activity }: { activity: ActivityItem }) {
  const timestamp = new Date(activity.timestamp);
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let timeLabel = "";
  if (diffMins < 1) timeLabel = "just now";
  else if (diffMins < 60) timeLabel = `${diffMins}m ago`;
  else if (diffHours < 24) timeLabel = `${diffHours}h ago`;
  else if (diffDays < 7) timeLabel = `${diffDays}d ago`;
  else timeLabel = timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="flex gap-4 pb-4 last:pb-0">
      {/* Timeline dot */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <ActivityTypeIcon type={activity.type} />
        </div>
        <div className="w-0.5 h-12 bg-muted last:hidden" />
      </div>

      {/* Activity content */}
      <div className="flex-1 pt-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-foreground">{activity.title}</p>
            {activity.description && (
              <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
            )}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{timeLabel}</span>
        </div>
        <div className="mt-2">
          <ActivityTypeBadge type={activity.type} />
        </div>
      </div>
    </div>
  );
}

/**
 * PHASE 7: Activity Feed Component
 * 
 * Shows:
 * - Recent activity timeline
 * - Activity type indicators
 * - Descriptions
 * - Relative timestamps
 * - Visual timeline UI with dots and lines
 */
export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (!activities || activities.length === 0) {
    return (
      <Card className="p-8 text-center rounded-lg border-0 shadow-sm">
        <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No recent activity</p>
      </Card>
    );
  }

  return (
    <Card className="rounded-lg border-0 shadow-sm p-6">
      <h2 className="text-lg font-bold mb-6">Recent Activity</h2>
      <div className="space-y-0">
        {activities.slice(0, 10).map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>

      {activities.length > 10 && (
        <div className="text-center pt-4 border-t mt-4">
          <p className="text-sm text-muted-foreground">
            Showing 10 of {activities.length} activities
          </p>
        </div>
      )}
    </Card>
  );
}
