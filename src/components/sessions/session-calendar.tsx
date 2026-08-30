import { useMemo, useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { NormalizedSession } from "@/types/api";

export function SessionCalendar(props: {
  sessions: NormalizedSession[];
  onEventClick?: (session: NormalizedSession) => void;
}) {
  const { sessions, onEventClick } = props;
  const [currentDate, setCurrentDate] = useState(new Date());

  const activeSessions = useMemo(() => {
    return sessions.filter(s => s.status === "SCHEDULED" || (s as any).status === "IN_PROGRESS");
  }, [sessions]);

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, NormalizedSession[]>();
    activeSessions.forEach(s => {
      if (s.scheduledStart) {
        const key = format(new Date(s.scheduledStart), "yyyy-MM-dd");
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(s);
      }
    });
    return map;
  }, [activeSessions]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDay = monthStart.getDay();
  const prevMonthDays = Array.from({ length: firstDay }).map((_, i) =>
    new Date(monthStart.getFullYear(), monthStart.getMonth(), i - firstDay + 1)
  );
  const allDays = [...prevMonthDays, ...calendarDays];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="rounded-2xl border-border/70 shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Session Calendar</CardTitle>
            <CardDescription>{format(currentDate, "MMMM yyyy")}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="rounded-lg">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCurrentDate(new Date())} className="rounded-lg">Today</Button>
            <Button size="sm" variant="outline" onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="rounded-lg">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <div className="grid grid-cols-7 bg-muted/40 border-b border-border/50">
            {weekDays.map(d => (
              <div key={d} className="p-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 divide-x divide-y divide-border/50">
            {allDays.map((day, idx) => {
              const key = format(day, "yyyy-MM-dd");
              const daySessions = sessionsByDate.get(key) || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              return (
                <div key={idx} className={`min-h-24 p-2 text-sm ${isCurrentMonth ? "bg-background" : "bg-muted/20"} ${isToday ? "bg-blue-50 dark:bg-blue-950/30" : ""}`}>
                  <div className={`font-semibold text-xs mb-1 ${!isCurrentMonth ? "text-muted-foreground" : ""}`}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1">
                    {daySessions.slice(0, 2).map(s => (
                      <button key={s.id} onClick={() => onEventClick?.(s)} className={`block w-full px-1.5 py-1 rounded text-xs font-medium text-white truncate cursor-pointer hover:opacity-80 transition ${(s as any).status === "IN_PROGRESS" ? "bg-green-500" : "bg-blue-500"}`} title={s.skillName}>
                        {s.skillName?.split(" ")[0]}
                      </button>
                    ))}
                    {daySessions.length > 2 && <div className="text-xs text-muted-foreground px-1.5">+{daySessions.length - 2} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-4 flex gap-6 text-xs">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500"></div><span className="text-muted-foreground">Scheduled</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-500"></div><span className="text-muted-foreground">In Progress</span></div>
        </div>
      </CardContent>
    </Card>
  );
}
