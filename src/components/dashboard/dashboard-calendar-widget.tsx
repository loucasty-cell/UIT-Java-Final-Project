import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Video,
  Calendar as CalendarIcon,
  ArrowRight,
  Clock,
  Plus,
  Sparkles,
  MapPin,
  CheckCircle2,
  CalendarDays,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { NormalizedSession } from "@/types/api";

interface DashboardCalendarWidgetProps {
  sessions: NormalizedSession[];
  className?: string;
}

export function DashboardCalendarWidget({
  sessions,
  className = "",
}: DashboardCalendarWidgetProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Group sessions by yyyy-MM-dd
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, NormalizedSession[]>();
    sessions.forEach((s) => {
      const dateVal = s.scheduledStart || s.scheduledAt;
      if (dateVal) {
        const parsed = new Date(dateVal);
        if (!isNaN(parsed.getTime())) {
          const key = format(parsed, "yyyy-MM-dd");
          if (!map.has(key)) map.set(key, []);
          map.get(key)!.push(s);
        }
      }
    });
    return map;
  }, [sessions]);

  // Calendar dates calculation (Monday start: 1 for Monday to 0 for Sunday)
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getMondayIndexedDay = (date: Date) => {
    const day = date.getDay(); // 0 is Sun, 1 is Mon
    return day === 0 ? 6 : day - 1;
  };

  const firstDayOffset = getMondayIndexedDay(monthStart);
  const prevMonthPadding = Array.from({ length: firstDayOffset }).map((_, i) =>
    new Date(monthStart.getFullYear(), monthStart.getMonth(), i - firstDayOffset + 1)
  );

  const totalSlots = Math.ceil((prevMonthPadding.length + calendarDays.length) / 7) * 7;
  const nextMonthPaddingLength = totalSlots - (prevMonthPadding.length + calendarDays.length);
  const nextMonthPadding = Array.from({ length: nextMonthPaddingLength }).map((_, i) =>
    new Date(monthEnd.getFullYear(), monthEnd.getMonth() + 1, i + 1)
  );

  const allDays = [...prevMonthPadding, ...calendarDays, ...nextMonthPadding];

  // Sessions on the selected date
  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
  const selectedDaySessions = useMemo(() => {
    const list = sessionsByDate.get(selectedDateKey) || [];
    return [...list].sort((a, b) => {
      const aDateStr = a.scheduledStart || a.scheduledAt;
      const bDateStr = b.scheduledStart || b.scheduledAt;
      const aTime = aDateStr ? new Date(aDateStr).getTime() : 0;
      const bTime = bDateStr ? new Date(bDateStr).getTime() : 0;
      return aTime - bTime;
    });
  }, [sessionsByDate, selectedDateKey]);

  const weekdays = [
    { label: "MON", dayIdx: 1 },
    { label: "TUE", dayIdx: 2 },
    { label: "WED", dayIdx: 3 },
    { label: "THU", dayIdx: 4 },
    { label: "FRI", dayIdx: 5 },
    { label: "SAT", dayIdx: 6 },
    { label: "SUN", dayIdx: 0 },
  ];

  const currentToday = new Date();
  const currentTodayDayIdx = currentToday.getDay();

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Side-by-Side Dual Container Grid: Left (Calendar) and Right (Schedule Description Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* LEFT BOX: Compact Calendar Widget (White & Grey Colorway) */}
        <div className="lg:col-span-5 rounded-3xl border border-border bg-card text-card-foreground shadow-xs transition-all duration-200 overflow-hidden flex flex-col p-5">
          {/* Calendar Top Header: Strict fixed layout to prevent button displacement */}
          <div className="flex items-center justify-between pb-3 gap-2 border-b border-border/60">
            <div className="min-w-0 flex-1">
              <h3
                className="text-base font-bold tracking-tight text-foreground truncate"
                title={format(currentMonth, "MMMM yyyy")}
              >
                {format(currentMonth, "MMMM yyyy")}
              </h3>
            </div>

            {/* Prev / Next buttons */}
            <div className="flex items-center gap-1 shrink-0 ml-auto">
              <button
                type="button"
                onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday Row (MON, TUE, WED, THU, FRI, SAT, SUN) */}
          <div className="grid grid-cols-7 text-center text-[11px] tracking-wider font-semibold select-none mt-2 mb-1">
            {weekdays.map((item) => {
              const isTodayWeekday =
                isSameMonth(currentMonth, currentToday) && currentTodayDayIdx === item.dayIdx;
              return (
                <div
                  key={item.label}
                  className={`py-1.5 ${
                    isTodayWeekday ? "text-foreground font-bold" : "text-muted-foreground font-semibold"
                  }`}
                >
                  {item.label}
                </div>
              );
            })}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-1 text-center text-xs select-none flex-1 content-start py-1">
            {allDays.map((day, idx) => {
              const dayKey = format(day, "yyyy-MM-dd");
              const dayEvents = sessionsByDate.get(dayKey) || [];
              const hasEvents = dayEvents.length > 0;
              const isCurrentMth = isSameMonth(day, currentMonth);
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);

              return (
                <div key={idx} className="flex flex-col items-center justify-center p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(day);
                      if (!isSameMonth(day, currentMonth)) {
                        setCurrentMonth(day);
                      }
                    }}
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition duration-150 shrink-0 ${
                      isSelected
                        ? "bg-[#1e90ff] text-white font-bold shadow-md shadow-blue-500/25 scale-105"
                        : isTodayDate
                          ? "border border-[#1e90ff] text-foreground font-bold hover:bg-secondary"
                          : isCurrentMth
                            ? "text-foreground/90 hover:bg-secondary hover:text-foreground"
                            : "text-muted-foreground/35 hover:text-muted-foreground"
                    }`}
                  >
                    <span>{format(day, "d")}</span>
                    {/* Event Dots */}
                    {hasEvents && !isSelected && (
                      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
                        <span
                          className={`h-1 w-1 rounded-full ${
                            dayEvents.some((s) => s.role === "Mentor")
                              ? "bg-purple-500"
                              : "bg-emerald-500"
                          }`}
                        />
                        {dayEvents.length > 1 && (
                          <span className="h-1 w-1 rounded-full bg-[#1e90ff]" />
                        )}
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Bottom Quick Indicator */}
          <div className="pt-3 mt-auto border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Selected: <strong className="font-semibold text-foreground">{format(selectedDate, "MMM d, yyyy")}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setSelectedDate(today);
                setCurrentMonth(today);
              }}
              className="hover:underline text-[11px] font-medium text-[#1e90ff]"
            >
              Today
            </button>
          </div>
        </div>

        {/* RIGHT BOX: Description & Schedule Box for Selected Day (White & Grey Colorway) */}
        <div className="lg:col-span-7 rounded-3xl border border-border bg-card text-card-foreground shadow-xs transition-all duration-200 overflow-hidden flex flex-col p-5">
          {/* Header of the Schedule Box */}
          <div className="flex items-center justify-between pb-3.5 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-[#1e90ff] border border-border">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight text-foreground">
                  Schedule · {format(selectedDate, "EEEE, MMM d")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedDaySessions.length > 0
                    ? `${selectedDaySessions.length} mentorship session${selectedDaySessions.length > 1 ? "s" : ""} scheduled`
                    : "No appointments or sessions scheduled"}
                </p>
              </div>
            </div>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-semibold h-8 shrink-0 border-border bg-secondary/50 hover:bg-secondary text-foreground"
            >
              <Link to="/sessions">
                Full Calendar <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {/* Content: Selected Day Session Cards or Clean Empty State */}
          <div className="flex-1 pt-4 space-y-3 overflow-y-auto">
            {selectedDaySessions.length > 0 ? (
              <div className="space-y-3.5">
                {selectedDaySessions.map((session) => {
                  const isMentor = session.role === "Mentor";
                  return (
                    <div
                      key={session.id}
                      className="group relative rounded-xl border border-border/80 bg-card p-4 sm:p-4.5 shadow-xs hover:border-[#0056D2]/40 hover:shadow-md transition-all duration-200 flex flex-col gap-3"
                    >
                      {/* Top Row: Category / Role Badge & Status */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide border ${
                              isMentor
                                ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60"
                                : "bg-blue-50 text-[#0056D2] border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60"
                            }`}
                          >
                            {isMentor ? "Mentoring / Teaching" : "Enrolled Mentorship"}
                          </span>
                          {session.mode && (
                            <span className="hidden sm:inline-flex items-center text-[11px] text-muted-foreground font-medium">
                              • {session.mode}
                            </span>
                          )}
                        </div>

                        {session.points !== undefined && session.points > 0 && (
                          <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/40">
                            {session.points} Pts
                          </span>
                        )}
                      </div>

                      {/* Title & Metadata */}
                      <div className="space-y-1.5">
                        <h4 className="text-sm sm:text-base font-semibold text-foreground tracking-tight group-hover:text-[#0056D2] transition-colors line-clamp-1">
                          {session.skillName || "Peer Mentorship Session"}
                        </h4>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5 font-medium text-foreground/80">
                            <Clock className="h-3.5 w-3.5 text-[#0056D2] shrink-0" />
                            <span>
                              {session.time || "Scheduled"} · {session.duration || 60} mins
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Video className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>1-on-1 Interactive Video</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: Partner Profile & Actions (Coursera Blue CTA) */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/60">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar className="h-8 w-8 ring-1 ring-border shrink-0">
                            <AvatarFallback className="text-xs font-semibold bg-secondary text-foreground">
                              {session.initials || "SB"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold leading-none">
                              {isMentor ? "Learner" : "Instructor / Mentor"}
                            </p>
                            <p className="text-xs font-semibold text-foreground truncate mt-0.5">
                              {session.counterpart}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 w-full sm:w-auto">
                          {session.meetingUrl ? (
                            <Button
                              size="sm"
                              onClick={() => window.open(session.meetingUrl, "_blank")}
                              className="w-full sm:w-auto rounded-lg text-xs h-8 px-4 font-semibold bg-[#0056D2] hover:bg-[#00419E] active:scale-[0.98] text-white shadow-xs transition-all"
                            >
                              <Video className="mr-1.5 h-3.5 w-3.5" /> Join Live Classroom
                            </Button>
                          ) : (
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="w-full sm:w-auto rounded-lg text-xs h-8 px-3 border-border hover:bg-secondary"
                            >
                              <Link to="/sessions">View Details</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/15 p-6 sm:p-8 text-center flex flex-col items-center justify-center h-full min-h-[200px]">
                <div className="h-11 w-11 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#0056D2] dark:text-blue-300 flex items-center justify-center mb-3">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-semibold text-foreground mb-1">
                  No sessions scheduled for {format(selectedDate, "MMMM d")}
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm mb-4 leading-relaxed">
                  You have an open schedule on this day. Explore certified student mentors or offer a peer session.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button asChild size="sm" className="rounded-lg text-xs font-semibold bg-[#0056D2] hover:bg-[#00419E] text-white shadow-xs">
                    <Link to="/mentors">
                      <Plus className="mr-1 h-3.5 w-3.5" /> Book a Mentor
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="rounded-lg text-xs border-border bg-card">
                    <Link to="/sessions">View Full Calendar</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
