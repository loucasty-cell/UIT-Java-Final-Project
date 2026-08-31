import { useMemo, useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  isAfter,
  isBefore,
  differenceInMinutes,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Video,
  Clock,
  User,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Coins,
  CheckCircle2,
  AlertCircle,
  Filter,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { NormalizedSession } from "@/types/api";

type CalendarViewMode = "timeline" | "month" | "agenda";
type RoleFilter = "ALL" | "MENTOR" | "LEARNER";

interface SessionCalendarProps {
  sessions: NormalizedSession[];
  onEventClick?: (session: NormalizedSession) => void;
  defaultRoleFilter?: RoleFilter;
  userRoleTitle?: string;
}

export function SessionCalendar({
  sessions,
  onEventClick,
  defaultRoleFilter = "ALL",
  userRoleTitle,
}: SessionCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("timeline");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>(defaultRoleFilter);
  const [selectedSession, setSelectedSession] = useState<NormalizedSession | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Keep live current time updated every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Filter sessions by role if chosen
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (roleFilter === "MENTOR") {
        return s.role === "Mentor";
      }
      if (roleFilter === "LEARNER") {
        return s.role === "Learner";
      }
      return true;
    });
  }, [sessions, roleFilter]);

  // Next upcoming session within the next 24-48 hours
  const upcomingNextSession = useMemo(() => {
    const now = new Date();
    const futureSessions = filteredSessions
      .filter((s) => {
        const dateStr = s.scheduledStart || s.scheduledAt;
        if (!dateStr) return false;
        const sDate = new Date(dateStr);
        if (isNaN(sDate.getTime())) return false;
        return isAfter(sDate, now) || Math.abs(differenceInMinutes(sDate, now)) < (s.duration || 60);
      })
      .sort((a, b) => {
        const aDate = new Date(a.scheduledStart || a.scheduledAt!).getTime();
        const bDate = new Date(b.scheduledStart || b.scheduledAt!).getTime();
        return aDate - bDate;
      });
    return futureSessions[0] || null;
  }, [filteredSessions]);

  // Group sessions by day string (yyyy-MM-dd)
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, NormalizedSession[]>();
    filteredSessions.forEach((s) => {
      const dateStr = s.scheduledStart || s.scheduledAt;
      if (dateStr) {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          const key = format(parsed, "yyyy-MM-dd");
          if (!map.has(key)) map.set(key, []);
          map.get(key)!.push(s);
        }
      }
    });
    return map;
  }, [filteredSessions]);

  // Days for the Week Strip in Timeline view
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Month grid calculations
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = monthStart.getDay();
  const prevMonthPadding = Array.from({ length: firstDayOfWeek }).map((_, i) =>
    new Date(monthStart.getFullYear(), monthStart.getMonth(), i - firstDayOfWeek + 1)
  );
  const totalSlotsNeeded = Math.ceil((prevMonthPadding.length + calendarDays.length) / 7) * 7;
  const nextMonthPaddingLength = totalSlotsNeeded - (prevMonthPadding.length + calendarDays.length);
  const nextMonthPadding = Array.from({ length: nextMonthPaddingLength }).map((_, i) =>
    new Date(monthEnd.getFullYear(), monthEnd.getMonth() + 1, i + 1)
  );
  const allMonthDays = [...prevMonthPadding, ...calendarDays, ...nextMonthPadding];

  // Sessions for the currently selected date in Timeline/Day view
  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
  const selectedDaySessions = useMemo(() => {
    const list = sessionsByDate.get(selectedDateKey) || [];
    return [...list].sort((a, b) => {
      const aTime = new Date(a.scheduledStart || a.scheduledAt || 0).getTime();
      const bTime = new Date(b.scheduledStart || b.scheduledAt || 0).getTime();
      return aTime - bTime;
    });
  }, [sessionsByDate, selectedDateKey]);

  // Timeline hours from 8 AM to 9 PM (14 hours)
  const timelineHours = Array.from({ length: 14 }).map((_, i) => i + 8); // 8 to 21

  const handlePrev = () => {
    if (viewMode === "month") {
      setCurrentDate((d) => subMonths(d, 1));
    } else if (viewMode === "timeline") {
      setSelectedDate((d) => subWeeks(d, 1));
      setCurrentDate((d) => subWeeks(d, 1));
    } else {
      setSelectedDate((d) => subDays(d, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      setCurrentDate((d) => addMonths(d, 1));
    } else if (viewMode === "timeline") {
      setSelectedDate((d) => addWeeks(d, 1));
      setCurrentDate((d) => addWeeks(d, 1));
    } else {
      setSelectedDate((d) => addDays(d, 1));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentDate(today);
  };

  const handleSelectDay = (day: Date) => {
    setSelectedDate(day);
    setCurrentDate(day);
  };

  const openSessionDetail = (session: NormalizedSession) => {
    setSelectedSession(session);
    onEventClick?.(session);
  };

  // Color helper for session cards based on role & status
  const getSessionColorClasses = (session: NormalizedSession) => {
    const isMentor = session.role === "Mentor";
    if (session.status === "COMPLETED") {
      return {
        bg: "bg-emerald-500/10 dark:bg-emerald-950/30",
        border: "border-emerald-500/40 text-emerald-900 dark:text-emerald-200",
        pill: "bg-emerald-600 text-white",
        accent: "border-l-4 border-l-emerald-500",
        tag: "Completed",
      };
    }
    if (session.status === "DISPUTED") {
      return {
        bg: "bg-rose-500/10 dark:bg-rose-950/30",
        border: "border-rose-500/40 text-rose-900 dark:text-rose-200",
        pill: "bg-rose-600 text-white",
        accent: "border-l-4 border-l-rose-500",
        tag: "Disputed",
      };
    }
    if (isMentor) {
      // Teaching commitment (Instructor)
      return {
        bg: "bg-purple-500/10 dark:bg-purple-950/30",
        border: "border-purple-500/40 text-purple-900 dark:text-purple-200",
        pill: "bg-purple-600 text-white",
        accent: "border-l-4 border-l-purple-500",
        tag: "Teaching Session",
      };
    }
    // Learner session
    return {
      bg: "bg-sky-500/10 dark:bg-sky-950/30",
      border: "border-sky-500/40 text-sky-900 dark:text-sky-200",
      pill: "bg-sky-600 text-white",
      accent: "border-l-4 border-l-sky-500",
      tag: "Learning Session",
    };
  };

  return (
    <div className="space-y-4">
      {/* 1. Upcoming Notification Alert Banner */}
      {upcomingNextSession && (
        <Card className="overflow-hidden border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent shadow-sm">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white shadow-sm">
                <Clock className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-rose-500 text-white hover:bg-rose-600">
                    Next Upcoming Session
                  </Badge>
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                    {upcomingNextSession.role === "Mentor"
                      ? "Teaching as Mentor"
                      : "Learning as Student"}
                  </span>
                </div>
                <h3 className="mt-0.5 text-sm font-bold sm:text-base">
                  {upcomingNextSession.skillName || "Mentorship Session"} with{" "}
                  <span className="underline decoration-rose-400">
                    {upcomingNextSession.counterpart}
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(upcomingNextSession.scheduledStart!), "EEEE, MMMM d 'at' h:mm a")}{" "}
                  ({upcomingNextSession.duration || 60} mins)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {upcomingNextSession.meetingUrl && (
                <Button
                  size="sm"
                  onClick={() => window.open(upcomingNextSession.meetingUrl, "_blank")}
                  className="rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                >
                  <Video className="mr-1.5 h-4 w-4" /> Join Video Room
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => openSessionDetail(upcomingNextSession)}
                className="rounded-xl"
              >
                View Details
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 2. Main Apple Calendar Shell */}
      <Card className="rounded-2xl border-border/70 shadow-sm overflow-hidden bg-card">
        {/* Apple Calendar Top Bar */}
        <div className="border-b border-border/70 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Apple Calendar Badge & Month Title */}
            <div className="flex items-center gap-4">
              {/* Iconic Apple Calendar Day Badge */}
              <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl border border-rose-500/20 bg-background shadow-md overflow-hidden shrink-0">
                <div className="w-full bg-rose-500 py-0.5 text-center text-[10px] font-black uppercase tracking-wider text-white">
                  {format(selectedDate, "EEE")}
                </div>
                <div className="flex flex-1 items-center justify-center font-bold text-2xl tracking-tighter text-foreground">
                  {format(selectedDate, "d")}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                    {format(selectedDate, "MMMM yyyy")}
                  </h2>
                  {userRoleTitle && (
                    <Badge variant="outline" className="text-xs">
                      {userRoleTitle}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")} •{" "}
                  <span className="font-medium text-foreground">
                    {selectedDaySessions.length}{" "}
                    {selectedDaySessions.length === 1 ? "session" : "sessions"} scheduled
                  </span>
                </p>
              </div>
            </div>

            {/* Navigation & Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Role filter pills */}
              <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/50">
                <button
                  onClick={() => setRoleFilter("ALL")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    roleFilter === "ALL"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All ({sessions.length})
                </button>
                <button
                  onClick={() => setRoleFilter("MENTOR")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    roleFilter === "MENTOR"
                      ? "bg-purple-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Teaching ({sessions.filter((s) => s.role === "Mentor").length})
                </button>
                <button
                  onClick={() => setRoleFilter("LEARNER")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    roleFilter === "LEARNER"
                      ? "bg-sky-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Learning ({sessions.filter((s) => s.role === "Learner").length})
                </button>
              </div>

              {/* View Switcher */}
              <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/50">
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    viewMode === "timeline"
                      ? "bg-background text-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Day Schedule
                </button>
                <button
                  onClick={() => setViewMode("month")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    viewMode === "month"
                      ? "bg-background text-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Month Grid
                </button>
                <button
                  onClick={() => setViewMode("agenda")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    viewMode === "agenda"
                      ? "bg-background text-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Agenda List
                </button>
              </div>

              {/* Nav buttons */}
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrev}
                  className="h-8 w-8 p-0 rounded-lg"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleToday}
                  className="h-8 rounded-lg px-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400"
                >
                  Today
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleNext}
                  className="h-8 w-8 p-0 rounded-lg"
                  aria-label="Next"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {/* VIEW MODE 1: Apple iOS Week Strip + Day Timeline */}
          {viewMode === "timeline" && (
            <div>
              {/* Apple iOS Week Day Strip */}
              <div className="border-b border-border/70 bg-muted/20 px-4 py-3 sm:px-6">
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {weekDays.map((day) => {
                    const dayKey = format(day, "yyyy-MM-dd");
                    const daySessionsList = sessionsByDate.get(dayKey) || [];
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentToday = isToday(day);

                    return (
                      <button
                        key={dayKey}
                        onClick={() => handleSelectDay(day)}
                        className={`flex flex-col items-center justify-center rounded-2xl py-2 transition ${
                          isSelected
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold"
                            : "hover:bg-muted/60 text-muted-foreground"
                        }`}
                      >
                        <span className="text-[11px] font-medium uppercase tracking-wider">
                          {format(day, "EEE")}
                        </span>
                        <div
                          className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition ${
                            isSelected
                              ? "bg-rose-500 text-white shadow-md"
                              : isCurrentToday
                                ? "border-2 border-rose-500 text-rose-600"
                                : "text-foreground"
                          }`}
                        >
                          {format(day, "d")}
                        </div>
                        {/* Event Dots */}
                        <div className="mt-1 flex h-1.5 items-center gap-0.5">
                          {daySessionsList.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className={`h-1.5 w-1.5 rounded-full ${
                                s.role === "Mentor" ? "bg-purple-500" : "bg-sky-500"
                              }`}
                            />
                          ))}
                          {daySessionsList.length > 3 && (
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day Hourly Timeline (Apple Style) */}
              <div className="p-4 sm:p-6 max-h-[600px] overflow-y-auto">
                <div className="relative space-y-3">
                  {timelineHours.map((hour) => {
                    const hourString = hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;
                    
                    // Filter sessions starting in this hour on selectedDate
                    const hourSessions = selectedDaySessions.filter((s) => {
                      if (!s.scheduledStart) return false;
                      const sDate = new Date(s.scheduledStart);
                      return sDate.getHours() === hour;
                    });

                    // Check if current real-time marker falls in this hour for today
                    const isTodaySelected = isToday(selectedDate);
                    const currentHour = currentTime.getHours();
                    const isCurrentHourRow = isTodaySelected && currentHour === hour;
                    const minutePercentage = (currentTime.getMinutes() / 60) * 100;

                    return (
                      <div key={hour} className="relative flex gap-4 min-h-16 group">
                        {/* Hour Label */}
                        <div className="w-16 shrink-0 text-right text-xs font-semibold text-muted-foreground pt-0.5">
                          {hourString}
                        </div>

                        {/* Timeline Track Line */}
                        <div className="relative flex-1 border-t border-border/60 pt-2 pb-2">
                          {/* Live Current Time Red Marker Line (Apple iOS signature) */}
                          {isCurrentHourRow && (
                            <div
                              className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                              style={{ top: `${minutePercentage}%` }}
                            >
                              <div className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-sm" />
                              <div className="h-[2px] flex-1 bg-rose-500 shadow-sm" />
                              <span className="ml-2 rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                                {format(currentTime, "h:mm a")}
                              </span>
                            </div>
                          )}

                          {/* Render sessions starting in this slot */}
                          {hourSessions.length > 0 ? (
                            <div className="space-y-2">
                              {hourSessions.map((session) => {
                                const style = getSessionColorClasses(session);
                                return (
                                  <div
                                    key={session.id}
                                    onClick={() => openSessionDetail(session)}
                                    className={`relative cursor-pointer rounded-xl p-3 border transition hover:shadow-md ${style.bg} ${style.border} ${style.accent}`}
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold text-foreground">
                                            {session.time} ({session.duration || 60}m)
                                          </span>
                                          <Badge className={`text-[10px] ${style.pill}`}>
                                            {session.role === "Mentor" ? "TEACHING" : "LEARNING"}
                                          </Badge>
                                          <Badge variant="outline" className="text-[10px]">
                                            {session.mode}
                                          </Badge>
                                        </div>
                                        <h4 className="text-sm font-bold text-foreground">
                                          {session.skillName || "Mentorship Session"}
                                        </h4>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                          <User className="h-3.5 w-3.5" />
                                          <span>
                                            {session.role === "Mentor" ? "Learner: " : "Mentor: "}
                                            <strong>{session.counterpart}</strong>
                                          </span>
                                          {session.points > 0 && (
                                            <span className="ml-2 flex items-center gap-1 text-emerald-600 font-semibold">
                                              <Coins className="h-3 w-3" />
                                              {session.points} Pts
                                            </span>
                                          )}
                                        </p>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        {session.meetingUrl && (
                                          <Button
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              window.open(session.meetingUrl, "_blank");
                                            }}
                                            className="h-8 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs shadow-sm"
                                          >
                                            <Video className="mr-1 h-3.5 w-3.5" /> Join Room
                                          </Button>
                                        )}
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-8 rounded-lg text-xs"
                                        >
                                          Details <ArrowRight className="ml-1 h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="h-6 w-full group-hover:bg-muted/10 rounded transition" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedDaySessions.length === 0 && (
                  <div className="mt-6 rounded-xl border border-dashed border-border/80 p-8 text-center">
                    <CalendarIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm font-semibold">No sessions scheduled for this day</p>
                    <p className="text-xs text-muted-foreground">
                      Pick another date from the week strip above or browse available mentor slots.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: Apple Month Grid View */}
          {viewMode === "month" && (
            <div className="p-4 sm:p-6">
              <div className="overflow-hidden rounded-2xl border border-border/70">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 border-b border-border/70 bg-muted/40 text-center">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
                    <div
                      key={dayName}
                      className="py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      {dayName}
                    </div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 divide-x divide-y divide-border/60">
                  {allMonthDays.map((day, idx) => {
                    const dayKey = format(day, "yyyy-MM-dd");
                    const daySessions = sessionsByDate.get(dayKey) || [];
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentToday = isToday(day);

                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectDay(day)}
                        className={`min-h-24 p-2 cursor-pointer transition ${
                          isSelected
                            ? "bg-rose-500/10 dark:bg-rose-950/20"
                            : isCurrentMonth
                              ? "bg-card hover:bg-muted/30"
                              : "bg-muted/15 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                              isSelected
                                ? "bg-rose-500 text-white shadow-sm"
                                : isCurrentToday
                                  ? "border border-rose-500 text-rose-600"
                                  : isCurrentMonth
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                            }`}
                          >
                            {format(day, "d")}
                          </span>

                          {daySessions.length > 0 && (
                            <span className="text-[10px] font-semibold text-muted-foreground">
                              {daySessions.length} {daySessions.length === 1 ? "event" : "events"}
                            </span>
                          )}
                        </div>

                        {/* Event chips */}
                        <div className="mt-1.5 space-y-1">
                          {daySessions.slice(0, 2).map((session) => {
                            const style = getSessionColorClasses(session);
                            return (
                              <button
                                key={session.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openSessionDetail(session);
                                }}
                                className={`w-full text-left truncate rounded px-1.5 py-0.5 text-[11px] font-medium transition hover:opacity-80 ${style.bg} ${style.border} border`}
                              >
                                {session.time.split(" ")[0]} {session.skillName}
                              </button>
                            );
                          })}
                          {daySessions.length > 2 && (
                            <p className="text-[10px] font-medium text-muted-foreground px-1">
                              +{daySessions.length - 2} more
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Day Agenda Drawer beneath month grid */}
              <div className="mt-4 rounded-xl border border-border/70 p-4 bg-muted/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold">
                    Schedule for {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {selectedDaySessions.length} Sessions
                  </Badge>
                </div>

                {selectedDaySessions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No sessions scheduled for this date.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {selectedDaySessions.map((session) => {
                      const style = getSessionColorClasses(session);
                      return (
                        <div
                          key={session.id}
                          onClick={() => openSessionDetail(session)}
                          className={`cursor-pointer rounded-xl p-3 border transition hover:shadow-sm ${style.bg} ${style.border} ${style.accent}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">{session.time}</span>
                            <Badge className={`text-[10px] ${style.pill}`}>
                              {session.role === "Mentor" ? "TEACHING" : "LEARNING"}
                            </Badge>
                          </div>
                          <h5 className="text-sm font-semibold mt-1">{session.skillName}</h5>
                          <p className="text-xs text-muted-foreground">
                            With <strong>{session.counterpart}</strong>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW MODE 3: Agenda List View */}
          {viewMode === "agenda" && (
            <div className="p-4 sm:p-6 space-y-4">
              {filteredSessions.length === 0 ? (
                <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                  <CalendarIcon className="mx-auto h-8 w-8 mb-2" />
                  <p className="text-sm font-medium">No sessions found for this filter</p>
                </div>
              ) : (
                filteredSessions
                  .sort((a, b) => {
                    const aTime = a.scheduledStart ? new Date(a.scheduledStart).getTime() : 0;
                    const bTime = b.scheduledStart ? new Date(b.scheduledStart).getTime() : 0;
                    return aTime - bTime;
                  })
                  .map((session) => {
                    const style = getSessionColorClasses(session);
                    const sDate = session.scheduledStart
                      ? new Date(session.scheduledStart)
                      : new Date();
                    return (
                      <div
                        key={session.id}
                        onClick={() => openSessionDetail(session)}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition cursor-pointer hover:shadow-md ${style.bg} ${style.border} ${style.accent}`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 border border-border/80">
                            <AvatarFallback className="bg-primary/10 font-bold text-xs">
                              {session.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                {format(sDate, "EEE, MMM d, yyyy")} • {session.time}
                              </span>
                              <Badge className={`text-[10px] ${style.pill}`}>
                                {session.role === "Mentor" ? "TEACHING" : "LEARNING"}
                              </Badge>
                            </div>
                            <h4 className="text-base font-bold mt-0.5">
                              {session.skillName || "Mentorship Session"}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {session.role === "Mentor" ? "Student" : "Instructor"}:{" "}
                              <strong>{session.counterpart}</strong> • {session.duration || 60} mins
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {session.meetingUrl && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(session.meetingUrl, "_blank");
                              }}
                              className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs shadow-sm"
                            >
                              <Video className="mr-1 h-3.5 w-3.5" /> Join Room
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="rounded-lg text-xs">
                            Details
                          </Button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          )}
        </CardContent>

        {/* Legend Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/70 bg-muted/20 px-4 py-3 sm:px-6 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
              <span>Teaching Commitment (Instructor)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
              <span>Learning Session (Student)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span>Disputed / Live Today</span>
            </div>
          </div>
          <span className="italic">Click any session to view details & Google Meet link</span>
        </div>
      </Card>

      {/* 3. Session Details Interactive Dialog */}
      {selectedSession && (
        <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  className={
                    selectedSession.role === "Mentor"
                      ? "bg-purple-600 text-white"
                      : "bg-sky-600 text-white"
                  }
                >
                  {selectedSession.role === "Mentor"
                    ? "TEACHING COMMITMENT"
                    : "LEARNING COMMITMENT"}
                </Badge>
                <Badge variant="outline">{selectedSession.status}</Badge>
              </div>
              <DialogTitle className="text-xl font-bold">
                {selectedSession.skillName || "Mentorship Session"}
              </DialogTitle>
              <DialogDescription>
                {selectedSession.role === "Mentor"
                  ? "You are scheduled to instruct this peer learning session."
                  : "You are scheduled to participate in this mentoring session."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="rounded-xl bg-muted/40 p-3.5 space-y-2.5 border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Date & Time:</span>
                  <span className="font-bold text-foreground">
                    {selectedSession.date} at {selectedSession.time}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium text-foreground">
                    {selectedSession.duration || 60} Minutes
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {selectedSession.role === "Mentor" ? "Learner Student:" : "Mentor Instructor:"}
                  </span>
                  <span className="font-bold text-foreground">{selectedSession.counterpart}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Exchange Mode:</span>
                  <span className="font-medium text-foreground">{selectedSession.mode}</span>
                </div>
                {selectedSession.points > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Points Escrow:</span>
                    <span className="font-bold text-emerald-600">
                      {selectedSession.points} Skill Points
                    </span>
                  </div>
                )}
              </div>

              {selectedSession.meetingUrl && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-rose-600" />
                      <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                        Live Video Room URL
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground truncate">
                    {selectedSession.meetingUrl}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              {selectedSession.meetingUrl && (
                <Button
                  onClick={() => window.open(selectedSession.meetingUrl, "_blank")}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white w-full sm:w-auto"
                >
                  <Video className="mr-1.5 h-4 w-4" /> Open Video Room
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setSelectedSession(null)}
                className="rounded-xl w-full sm:w-auto"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
