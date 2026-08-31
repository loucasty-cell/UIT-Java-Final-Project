import { Flame, TrendingUp, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { EngagementMetrics } from '@/types/api';

interface EngagementWidgetProps {
  engagement?: EngagementMetrics;
  isLoading?: boolean;
}

export function EngagementWidget({ engagement, isLoading }: EngagementWidgetProps) {
  if (!engagement && !isLoading) {
    return (
      <Card className="rounded-3xl border border-dashed border-border bg-secondary/20 h-full flex flex-col justify-center">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Flame className="h-12 w-12 text-muted-foreground mb-3 opacity-60" />
          <p className="text-sm font-semibold text-foreground mb-1">Start Your Streak!</p>
          <p className="text-xs text-muted-foreground">
            Complete a session today to begin tracking your learning streak
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const currentStreak = engagement?.currentStreak || 0;
  const longestStreak = engagement?.longestStreak || 0;
  const hoursThisWeek = engagement?.hoursThisWeek || 0;
  const hoursThisMonth = engagement?.hoursThisMonth || 0;
  
  const getStreakMessage = () => {
    if (currentStreak === 0) return "Start your streak today!";
    if (currentStreak === 1) return "Great start!";
    if (currentStreak < 7) return "Keep it going!";
    if (currentStreak < 30) return "You're on fire!";
    return "Legendary streak!";
  };
  
  const getStreakEmoji = () => {
    if (currentStreak === 0) return "💫";
    if (currentStreak < 7) return "🔥";
    if (currentStreak < 30) return "🔥🔥";
    return "🔥🔥🔥";
  };
  
  return (
    <Card className="rounded-3xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800 shadow-sm flex flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          Your Learning Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Big Streak Number */}
        <div className="text-center py-2">
          <div className="text-5xl sm:text-6xl font-extrabold text-orange-600 dark:text-orange-400 tracking-tight mb-1">
            {currentStreak}
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">
            {currentStreak === 1 ? 'day active' : 'days active'} {getStreakEmoji()}
          </p>
          <p className="text-xs text-muted-foreground">
            {getStreakMessage()}
          </p>
          {currentStreak >= 7 && (
            <Badge className="mt-2 bg-orange-600 text-white dark:bg-orange-700 text-xs">
              On Fire! 🔥
            </Badge>
          )}
        </div>
        
        <Separator className="bg-orange-200/70 dark:bg-orange-800/70" />
        
        {/* Engagement Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-white dark:bg-gray-900 border border-orange-200 dark:border-orange-800 text-center shadow-xs">
            <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">
              {hoursThisWeek.toFixed(1)}h
            </p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </div>
          
          <div className="p-3 rounded-2xl bg-white dark:bg-gray-900 border border-orange-200 dark:border-orange-800 text-center shadow-xs">
            <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">
              {longestStreak}
            </p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
        </div>
        
        {/* This Month Hours */}
        <div className="p-3 rounded-2xl bg-orange-100/70 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-xs font-semibold text-foreground">This Month</span>
            </div>
            <span className="text-base font-bold text-orange-600 dark:text-orange-400">
              {hoursThisMonth.toFixed(1)}h
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
