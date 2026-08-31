import { ArrowRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@tanstack/react-router';
import type { NormalizedSession, LearningRequestResponse } from '@/types/api';

interface ContinueLearningWidgetProps {
  upcomingSessions?: NormalizedSession[];
  pendingRequests?: LearningRequestResponse[];
  isLoading?: boolean;
}

export function ContinueLearningWidget({ 
  upcomingSessions, 
  pendingRequests,
  isLoading 
}: ContinueLearningWidgetProps) {
  // Don't show if no content and not loading
  if (!upcomingSessions?.length && !pendingRequests?.length && !isLoading) {
    return null;
  }
  
  return (
    <Card className="rounded-3xl border-2 border-[#1e90ff]/30 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 dark:border-[#1e90ff]/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Clock className="h-5 w-5 text-[#1e90ff]" />
              Continue Learning
            </CardTitle>
            <CardDescription className="text-xs">Pick up where you left off</CardDescription>
          </div>
          <Button size="sm" variant="outline" className="rounded-xl h-8 text-xs font-semibold" asChild>
            <Link to="/sessions">
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Upcoming Scheduled Sessions */}
        {upcomingSessions && upcomingSessions.length > 0 && (
          <div className="space-y-2">
            {upcomingSessions.slice(0, 3).map(session => {
              const scheduledDate = session.scheduledStart ? new Date(session.scheduledStart) : null;
              let isToday = false;
              if (scheduledDate && !isNaN(scheduledDate.getTime())) {
                isToday = format(scheduledDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              }
              
              return (
                <div 
                  key={session.id} 
                  className={`flex items-center justify-between p-4 rounded-2xl border transition hover:shadow-md ${
                    isToday 
                      ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700' 
                      : 'bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="h-10 w-10 shrink-0 border-2 border-border">
                      <AvatarFallback className="text-sm font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {session.initials || (session.counterpart ? session.counterpart.slice(0, 2).toUpperCase() : 'SB')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate text-foreground">
                        {session.skillName || session.counterpart || session.title || 'Mentorship Session'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          {scheduledDate && !isNaN(scheduledDate.getTime())
                            ? format(scheduledDate, 'MMM d, h:mm a')
                            : session.date || 'Scheduled'}
                        </p>
                        {isToday && (
                          <Badge className="text-[10px] px-1.5 py-0 h-4 bg-green-600 text-white font-medium">Today!</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" className="rounded-xl shrink-0 ml-2 bg-[#1e90ff] hover:bg-blue-600 text-white h-8 text-xs font-semibold" asChild>
                    <Link to="/sessions">
                      View <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Pending Learning Requests */}
        {pendingRequests && pendingRequests.length > 0 && (
          <div className="space-y-2">
            {pendingRequests.slice(0, 2).map(req => {
              const reqDate = req.createdAt ? new Date(req.createdAt) : null;
              const formattedAgo = reqDate && !isNaN(reqDate.getTime())
                ? formatDistanceToNow(reqDate, { addSuffix: true })
                : 'recently';

              return (
                <div 
                  key={req.id} 
                  className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <p className="text-sm font-semibold text-foreground">Awaiting mentor response</p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {req.requestedSkillName || 'Skill session'} • Requested {formattedAgo}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 shrink-0 ml-2 text-xs font-medium">
                    Pending
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Empty State */}
        {!upcomingSessions?.length && !pendingRequests?.length && !isLoading && (
          <div className="text-center py-6">
            <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-foreground mb-1">No Active Sessions</p>
            <p className="text-xs text-muted-foreground mb-3">
              Book a session with a mentor to start learning
            </p>
            <Button size="sm" className="rounded-xl bg-[#1e90ff] hover:bg-blue-600 text-white" asChild>
              <Link to="/mentors">
                Find a Mentor <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
