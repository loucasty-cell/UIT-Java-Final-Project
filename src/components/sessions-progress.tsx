import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Star, Users } from "lucide-react";

interface Session {
  id: string;
  title: string;
  duration: number; // minutes
  date: string;
  status: "COMPLETED" | "IN_PROGRESS" | "SCHEDULED";
  rating?: number;
  learnerCount?: number;
  skillsGained?: string[];
}

interface SessionsProgressProps {
  sessions: Session[];
  totalSessions: number;
  completedSessions: number;
  currentStreak: number;
  hoursLearned: number;
}

function StatusBadge({ status }: { status: string }) {
  const statusMap: { [key: string]: { color: string; label: string } } = {
    COMPLETED: { color: "bg-green-100 text-green-800", label: "Completed" },
    IN_PROGRESS: { color: "bg-blue-100 text-blue-800", label: "In Progress" },
    SCHEDULED: { color: "bg-gray-100 text-gray-800", label: "Scheduled" },
  };

  const config = statusMap[status] || { color: "bg-gray-100 text-gray-800", label: status };

  return (
    <Badge className={`${config.color} text-xs`}>
      {config.label}
    </Badge>
  );
}

function SessionCard({ session }: { session: Session }) {
  const sessionDate = new Date(session.date);
  const formattedDate = sessionDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="rounded-lg border p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground">{session.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{formattedDate}</p>
        </div>
        <StatusBadge status={session.status} />
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{session.duration} min</span>
        </div>

        {session.learnerCount !== undefined && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{session.learnerCount} learner{session.learnerCount !== 1 ? "s" : ""}</span>
          </div>
        )}

        {session.rating !== undefined && (
          <div className="flex items-center gap-1 text-amber-600">
            <Star className="w-4 h-4 fill-amber-600" />
            <span>{session.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {session.skillsGained && session.skillsGained.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {session.skillsGained.map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * PHASE 4: Sessions & Progress Component
 * 
 * Shows:
 * - Recent sessions list
 * - Session duration and status
 * - Session ratings
 * - Skills gained from sessions
 * - Progress tracking
 * - Streak information
 */
export function SessionsProgress({
  sessions,
  totalSessions,
  completedSessions,
  currentStreak,
  hoursLearned,
}: SessionsProgressProps) {
  if (!sessions || sessions.length === 0) {
    return (
      <Card className="p-8 text-center rounded-2xl border-0 shadow-sm">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No sessions yet</p>
      </Card>
    );
  }

  const completionPercentage = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="p-6 rounded-2xl border-0 shadow-sm">
        <h2 className="text-lg font-bold mb-6">Learning Progress</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Completion */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Sessions Completed</span>
              <span className="text-sm font-bold">{completionPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {completedSessions} of {totalSessions} sessions
            </p>
          </div>

          {/* Streak */}
          <div>
            <p className="text-sm font-medium mb-2">Current Streak</p>
            <p className="text-3xl font-bold text-orange-600">{currentStreak}</p>
            <p className="text-xs text-muted-foreground mt-1">days</p>
          </div>

          {/* Hours */}
          <div>
            <p className="text-sm font-medium mb-2">Hours Learned</p>
            <p className="text-3xl font-bold text-blue-600">{hoursLearned}</p>
            <p className="text-xs text-muted-foreground mt-1">total hours</p>
          </div>
        </div>
      </Card>

      {/* Sessions List */}
      <div>
        <h3 className="text-lg font-bold mb-4">Recent Sessions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.slice(0, 6).map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>

        {sessions.length > 6 && (
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Showing 6 of {sessions.length} sessions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
