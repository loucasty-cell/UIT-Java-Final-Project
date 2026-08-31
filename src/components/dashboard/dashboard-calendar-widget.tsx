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

type ColorTheme = "obsidian" | "plum" | "slate";

interface DashboardCalendarWidgetProps {
  sessions: NormalizedSession[];
  className?: string;
  defaultTheme?: ColorTheme;
}

export function DashboardCalendarWidget({
  sessions,
  className = "",
  defaultTheme = "obsidian",
}: DashboardCalendarWidgetProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [theme, setTheme] = useState<ColorTheme>(defaultTheme);

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

  // Color theme styles
  const themeStyles = {
    obsidian: {
      leftCard: "bg-[#0c0e14] text-white border-zinc-800/90 shadow-xl",
      rightCard: "bg-[#12151e] text-white border-zinc-800/90 shadow-xl",
      headerText: "text-zinc-100",
      arrowBtn: "text-zinc-400 hover:bg-zinc-800 hover:text-white",
      activeWeekday: "text-white font-bold",
      inactiveWeekday: "text-zinc-500 font-semibold",
      selectedDay: "bg-emerald-500 text-zinc-950 font-bold shadow-lg shadow-emerald-500/25 scale-105",
      todayBorder: "border border-zinc-500 text-white font-bold hover:bg-zinc-800",
      normalDay: "text-zinc-300 hover:bg-zinc-800/70 hover:text-white",
      fadedDay: "text-zinc-700 hover:text-zinc-500",
      sessionCard: "bg-zinc-900/90 border-zinc-800 hover:border-zinc-700",
      sessionCardHighlight: "border-l-4 border-l-emerald-500",
      emptyState: "border-zinc-800/80 bg-zinc-900/30 text-zinc-400",
      accentText: "text-emerald-400",
      joinBtn: "bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold",
    },
    plum: {
      leftCard: "bg-[#251e33] text-white border-purple-900/40 shadow-xl",
      rightCard: "bg-[#1e172a] text-white border-purple-900/40 shadow-xl",
      headerText: "text-purple-50",
      arrowBtn: "text-purple-300 hover:bg-purple-900/40 hover:text-white",
      activeWeekday: "text-purple-100 font-bold",
      inactiveWeekday: "text-purple-400/60 font-semibold",
      selectedDay: "bg-emerald-500 text-zinc-950 font-bold shadow-lg shadow-emerald-500/30 scale-105",
      todayBorder: "border border-purple-400 text-purple-100 font-bold hover:bg-purple-900/40",
      normalDay: "text-purple-100 hover:bg-purple-900/30 hover:text-white",
      fadedDay: "text-purple-900/80 hover:text-purple-400",
      sessionCard: "bg-[#2d243e] border-purple-800/50 hover:border-purple-700",
      sessionCardHighlight: "border-l-4 border-l-fuchsia-400",
      emptyState: "border-purple-900/50 bg-[#251e33]/50 text-purple-300",
      accentText: "text-fuchsia-300",
      joinBtn: "bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold",
    },
    slate: {
      leftCard: "bg-card text-card-foreground border-border shadow-sm",
      rightCard: "bg-card text-card-foreground border-border shadow-sm",
      headerText: "text-foreground",
      arrowBtn: "text-muted-foreground hover:bg-muted hover:text-foreground",
      activeWeekday: "text-foreground font-bold",
      inactiveWeekday: "text-muted-foreground font-semibold",
      selectedDay: "bg-emerald-500 text-white font-bold shadow-md scale-105",
      todayBorder: "border border-emerald-500 text-foreground font-bold hover:bg-muted",
      normalDay: "text-foreground/90 hover:bg-muted hover:text-foreground",
      fadedDay: "text-muted-foreground/40 hover:text-muted-foreground",
      sessionCard: "bg-muted/40 border-border hover:border-foreground/20",
      sessionCardHighlight: "border-l-4 border-l-emerald-500",
      emptyState: "border-border bg-muted/20 text-muted-foreground",
      accentText: "text-emerald-600 dark:text-emerald-400",
      joinBtn: "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold",
    },
  }[theme];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Side-by-Side Dual Container Grid: Left (Calendar) and Right (Schedule Description Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* LEFT BOX: Compact Calendar Widget */}
        <div
          className={`lg:col-span-5 rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col p-5 ${themeStyles.leftCard}`}
        >
          {/* Calendar Top Header: Strict fixed layout to prevent button displacement */}
          <div className="flex items-center justify-between pb-3 gap-2">
            <div className="min-w-0 flex-1">
              <h3
                className={`text-base font-bold tracking-tight truncate ${themeStyles.headerText}`}
                title={format(currentMonth, "MMMM yyyy")}
              >
                {format(currentMonth, "MMMM yyyy")}
              </h3>
            </div>

            {/* Controls: fixed shrink-0 so navigation buttons NEVER jump or shift */}
            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              {/* Color adaptation palette pills */}
              <div className="flex items-center rounded-lg bg-black/25 p-0.5 border border-white/10 mr-1">
                <button
                  type="button"
                  onClick={() => setTheme("obsidian")}
                  title="Obsidian Dark theme"
                  className={`h-5 w-5 rounded-md flex items-center justify-center transition shrink-0 ${
                    theme === "obsidian" ? "bg-zinc-800 shadow-xs" : "opacity-50 hover:opacity-100"
                  }`}
                >
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("plum")}
                  title="Plum Purple theme"
                  className={`h-5 w-5 rounded-md flex items-center justify-center transition shrink-0 ${
                    theme === "plum" ? "bg-purple-900 shadow-xs" : "opacity-50 hover:opacity-100"
                  }`}
                >
                  <div className="h-2.5 w-2.5 rounded-full bg-purple-400" />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("slate")}
                  title="Slate Adaptive theme"
                  className={`h-5 w-5 rounded-md flex items-center justify-center transition shrink-0 ${
                    theme === "slate" ? "bg-muted shadow-xs" : "opacity-50 hover:opacity-100"
                  }`}
                >
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </button>
              </div>

              {/* Prev / Next buttons: strictly fixed dimensions */}
              <button
                type="button"
                onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${themeStyles.arrowBtn}`}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${themeStyles.arrowBtn}`}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday Row (MON, TUE, WED, THU, FRI, SAT, SUN) */}
          <div className="grid grid-cols-7 text-center text-[11px] tracking-wider font-semibold select-none mb-1">
            {weekdays.map((item) => {
              const isTodayWeekday =
                isSameMonth(currentMonth, currentToday) && currentTodayDayIdx === item.dayIdx;
              return (
                <div
                  key={item.label}
                  className={`py-1.5 ${
                    isTodayWeekday ? themeStyles.activeWeekday : themeStyles.inactiveWeekday
                  }`}
                >
                  {item.label}
                </div>
              );
            })}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-1 text-center text-xs select-none flex-1 content-start">
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
                        ? themeStyles.selectedDay
                        : isTodayDate
                          ? themeStyles.todayBorder
                          : isCurrentMth
                            ? themeStyles.normalDay
                            : themeStyles.fadedDay
                    }`}
                  >
                    <span>{format(day, "d")}</span>
                    {/* Event Dots */}
                    {hasEvents && !isSelected && (
                      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
                        <span
                          className={`h-1 w-1 rounded-full ${
                            dayEvents.some((s) => s.role === "Mentor")
                              ? "bg-purple-400"
                              : "bg-emerald-400"
                          }`}
                        />
                        {dayEvents.length > 1 && (
                          <span className="h-1 w-1 rounded-full bg-sky-400" />
                        )}
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Bottom Quick Indicator */}
          <div className="pt-3 mt-auto border-t border-white/5 flex items-center justify-between text-[11px] opacity-75">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Selected: <strong className="font-semibold">{format(selectedDate, "MMM d, yyyy")}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setSelectedDate(today);
                setCurrentMonth(today);
              }}
              className="hover:underline text-[11px] font-medium"
            >
              Today
            </button>
          </div>
        </div>

        {/* RIGHT BOX: Description & Schedule Box for Selected Day */}
        <div
          className={`lg:col-span-7 rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col p-5 ${themeStyles.rightCard}`}
        >
          {/* Header of the Schedule Box */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h3 className={`text-base font-bold tracking-tight ${themeStyles.headerText}`}>
                  Schedule · {format(selectedDate, "EEEE, MMM d")}
                </h3>
                <p className="text-xs opacity-75">
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
              className="rounded-xl text-xs font-semibold h-8 shrink-0"
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
                      className={`rounded-2xl p-4 border transition ${themeStyles.sessionCard} ${themeStyles.sessionCardHighlight} space-y-2.5`}
                    >
                      {/* Card Top Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                              isMentor ? "bg-purple-400" : "bg-emerald-400"
                            }`}
                          />
                          <h4 className="font-semibold text-sm leading-snug">
                            {session.skillName || "Peer Mentorship"}
                          </h4>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[10px] uppercase font-bold shrink-0"
                        >
                          {isMentor ? "Teaching" : "Learning"}
                        </Badge>
                      </div>

                      {/* Time & Location / Meeting info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs opacity-85">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 opacity-70 shrink-0" />
                          <span>
                            {session.time || "Scheduled"} · {session.duration || 60} mins
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="h-3.5 w-3.5 opacity-70 shrink-0" />
                          <span className="truncate">Google Meet / Video Room</span>
                        </div>
                      </div>

                      {/* Counterpart & Action Row */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar className="h-7 w-7 ring-1 ring-white/10 shrink-0">
                            <AvatarFallback className="text-[10px] font-bold bg-zinc-800 text-zinc-200">
                              {session.initials || "SB"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs truncate">
                            <span className="opacity-70">{isMentor ? "Learner: " : "Mentor: "}</span>
                            <strong className="font-medium">{session.counterpart}</strong>
                          </span>
                        </div>

                        {session.meetingUrl && (
                          <Button
                            size="sm"
                            onClick={() => window.open(session.meetingUrl, "_blank")}
                            className={`rounded-xl text-xs h-7 px-3 shrink-0 ${themeStyles.joinBtn}`}
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
              <div
                className={`rounded-2xl border border-dashed p-6 text-center flex flex-col items-center justify-center h-full min-h-[180px] ${themeStyles.emptyState}`}
              >
                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mb-2.5">
                  <Clock className="h-5 w-5 opacity-60" />
                </div>
                <h4 className="text-sm font-semibold mb-1">
                  No sessions on {format(selectedDate, "MMM d")}
                </h4>
                <p className="text-xs opacity-75 max-w-sm mb-4">
                  You are free on this day. You can request a 1-on-1 session with a student mentor or schedule teaching availability.
                </p>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" className="rounded-xl text-xs font-semibold">
                    <Link to="/mentors">
                      <Plus className="mr-1 h-3.5 w-3.5" /> Book a Mentor
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="rounded-xl text-xs">
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
