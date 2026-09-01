import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Award, MessageSquare, Star } from "lucide-react";

interface InstructorMetrics {
  totalStudents: number;
  sessionsMentored: number;
  earningsFromMentoring: number;
  averageStudentRating: number;
  totalReviews: number;
  conversionRate?: number;
}

interface StudentReview {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
}

interface InstructorDashboardProps {
  metrics: InstructorMetrics;
  reviews: StudentReview[];
}

function MetricCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <div className="rounded-lg border p-4 bg-card hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold mt-2 text-foreground">{value}</p>
          {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
        </div>
        <div className="text-muted-foreground opacity-40">{icon}</div>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: StudentReview }) {
  return (
    <Card className="p-4 rounded-lg border shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-foreground">{review.studentName}</p>
          <p className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
        </div>
      </div>
      <p className="text-sm text-foreground/80">{review.comment}</p>
    </Card>
  );
}

export function InstructorDashboard({
  metrics,
  reviews,
}: InstructorDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard icon={<Users className="w-8 h-8" />} label="Total Students" value={metrics.totalStudents} />
        <MetricCard icon={<TrendingUp className="w-8 h-8" />} label="Sessions Mentored" value={metrics.sessionsMentored} />
        <MetricCard icon={<Award className="w-8 h-8" />} label="Earnings" value={metrics.earningsFromMentoring} />
      </div>

      <Card className="rounded-lg border shadow-sm p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Student Rating</p>
            <p className="text-4xl font-bold">{metrics.averageStudentRating.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Reviews</p>
            <p className="text-4xl font-bold">{metrics.totalReviews}</p>
          </div>
        </div>
      </Card>

      {reviews && reviews.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4">Student Reviews</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.slice(0, 4).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}