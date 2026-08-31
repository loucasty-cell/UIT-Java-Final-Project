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
import type { NormalizedSession } from "@/routes/sessions";

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
              <div className="space-y-3">
                {selectedDaySessions.map((session) => {
                  const isMentor = session.role === "Mentor";
                  return (
                    <div
                      key={session.id}
                      className="rounded-2xl p-4 border border-border bg-secondary/40 hover:bg-secondary/70 hover:border-[#1e90ff]/40 transition border-l-4 border-l-[#1e90ff] space-y-2.5"
                    >
                      {/* Card Top Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                              isMentor ? "bg-purple-500" : "bg-emerald-500"
                            }`}
                          />
                          <h4 className="font-semibold text-sm leading-snug text-foreground">
                            {session.skillName || "Peer Mentorship"}
                          </h4>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[10px] uppercase font-bold shrink-0 bg-secondary text-muted-foreground border border-border"
                        >
                          {isMentor ? "Teaching" : "Learning"}
                        </Badge>
                      </div>

                      {/* Time & Location / Meeting info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 shrink-0 text-[#1e90ff]" />
                          <span>
                            {session.time || "Scheduled"} · {session.duration || 60} mins
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate">Google Meet / Video Room</span>
                        </div>
                      </div>

                      {/* Counterpart & Action Row */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar className="h-7 w-7 border border-border shrink-0">
                            <AvatarFallback className="text-[10px] font-bold bg-secondary text-foreground">
                              {session.initials || "SB"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs truncate text-muted-foreground">
                            <span>{isMentor ? "Learner: " : "Mentor: "}</span>
                            <strong className="font-medium text-foreground">{session.counterpart}</strong>
                          </span>
                        </div>

                        {session.meetingUrl && (
                          <Button
                            size="sm"
                            onClick={() => window.open(session.meetingUrl, "_blank")}
                            className="rounded-xl text-xs h-7 px-3 shrink-0 bg-[#1e90ff] hover:bg-blue-600 text-white font-semibold shadow-xs"
                          >
                            <Video className="mr-1.5 h-3 w-3" /> Join Room
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-secondary/20 p-6 text-center flex flex-col items-center justify-center h-full min-h-[180px]">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center mb-2.5 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-semibold mb-1 text-foreground">
                  No sessions on {format(selectedDate, "MMM d")}
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm mb-4">
                  You are free on this day. You can request a 1-on-1 session with a student mentor or schedule teaching availability.
                </p>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" className="rounded-xl text-xs font-semibold bg-[#1e90ff] hover:bg-blue-600 text-white">
                    <Link to="/mentors">
                      <Plus className="mr-1 h-3.5 w-3.5" /> Book a Mentor
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="rounded-xl text-xs border-border bg-card">
                    <Link to="/sessions">View All Dates</Link>
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
