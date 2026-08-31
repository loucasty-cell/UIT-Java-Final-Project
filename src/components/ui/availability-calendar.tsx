import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfDay, isBefore, setHours, setMinutes, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface TimeSlot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface AvailabilityCalendarProps {
  slots?: TimeSlot[];
  onSelectDateTime?: (date: Date, time: string) => void;
  selectedDate?: Date;
  selectedTime?: string;
  bookedDates?: string[];
  minDate?: Date;
}

function addMinutes(d: Date, m: number) {
  return new Date(d.getTime() + m * 60000);
}

export function AvailabilityCalendar(props: AvailabilityCalendarProps) {
  const { slots = [], onSelectDateTime, selectedDate, selectedTime, bookedDates = [], minDate = new Date() } = props;
  const [currentMonth, setCurrentMonth] = useState(selectedDate || minDate);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(selectedTime || null);

  const dayMap = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

  const availMap = new Map<string, TimeSlot[]>();
  slots.forEach((s) => {
    const d = s.dayOfWeek.toUpperCase();
    if (!availMap.has(d)) availMap.set(d, []);
    availMap.get(d)!.push(s);
  });

  const getTimes = (date: Date): string[] => {
    const dn = dayMap[date.getDay()];
    const slots = availMap.get(dn) || [];
    const times: string[] = [];
    slots.forEach((s) => {
      const [sh, sm] = s.startTime.split(":").map(Number);
      const [eh, em] = s.endTime.split(":").map(Number);
      let c = setMinutes(setHours(new Date(), sh), sm);
      const e = setMinutes(setHours(new Date(), eh), em);
      while (isBefore(c, e)) {
        times.push(format(c, "HH:mm"));
        c = addMinutes(c, 30);
      }
    });
    return times;
  };

  const times = selectedDate ? getTimes(selectedDate) : [];

  // Calendar logic from dashboard
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getMondayIndexedDay = (date: Date) => {
    const day = date.getDay();
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
    <div className="space-y-4">
      {/* Dashboard-style Calendar */}
      <div className="rounded-3xl border border-border bg-card text-card-foreground shadow-xs transition-all duration-200 overflow-hidden flex flex-col p-5">
        {/* Calendar Top Header */}
        <div className="flex items-center justify-between pb-3 gap-2 border-b border-border/60">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold tracking-tight text-foreground truncate">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-auto">
            <button
              type="button"
              onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Weekday Row */}
        <div className="grid grid-cols-7 text-center text-[11px] tracking-wider font-semibold select-none mt-4 mb-2">
          {weekdays.map((item) => {
            const isTodayWeekday = isSameMonth(currentMonth, currentToday) && currentTodayDayIdx === item.dayIdx;
            return (
              <div
                key={item.label}
                className={isTodayWeekday ? "text-[#1e90ff] font-bold" : "text-muted-foreground"}
              >
                {item.label}
              </div>
            );
          })}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-2 text-center text-xs select-none flex-1 content-start py-1">
          {allDays.map((day, idx) => {
            const isCurrentMth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            const isPast = isBefore(day, startOfDay(minDate));
            
            // Check if day has availability based on the API response (if it has slots)
            const dn = dayMap[day.getDay()];
            const hasSlots = availMap.has(dn) && availMap.get(dn)!.length > 0;

            return (
              <div key={idx} className="flex flex-col items-center justify-center p-0.5">
                <button
                  type="button"
                  disabled={isPast}
                  onClick={() => {
                    if (isPast) return;
                    if (!isSameMonth(day, currentMonth)) {
                      setCurrentMonth(day);
                    }
                    onSelectDateTime?.(day, ""); // Reset time when date changes
                    setSelectedTimeSlot(null);
                  }}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition duration-150 shrink-0 ${
                    isSelected
                      ? "bg-[#1e90ff] text-white font-bold shadow-md shadow-blue-500/25 scale-105"
                      : isPast 
                        ? "text-muted-foreground/30 cursor-not-allowed"
                        : isTodayDate
                          ? "border border-[#1e90ff] text-foreground font-bold hover:bg-secondary"
                          : isCurrentMth
                            ? "text-foreground/90 hover:bg-secondary hover:text-foreground"
                            : "text-muted-foreground/40 hover:text-muted-foreground"
                  }`}
                >
                  <span>{format(day, "d")}</span>
                  {hasSlots && !isSelected && !isPast && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
                      <span className="h-1 w-1 rounded-full bg-emerald-500" />
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Slots (Only visible when a date is selected) */}
      {selectedDate && (
        <Card className="rounded-3xl border border-border bg-card text-card-foreground shadow-xs p-5">
          <div className="flex items-center gap-2 mb-4">
             <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-[#1e90ff] border border-border">
                <Clock className="h-4 w-4" />
             </div>
             <div>
               <h3 className="text-sm font-bold tracking-tight text-foreground">
                 Select Time
               </h3>
               <p className="text-xs text-muted-foreground">
                 {format(selectedDate, "EEEE, MMM d")}
               </p>
             </div>
          </div>
          
          {times.length > 0 ? (
            <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
              {times.map((t) => (
                <Button
                  key={t}
                  type="button"
                  onClick={() => {
                    setSelectedTimeSlot(t);
                    onSelectDateTime?.(selectedDate, t);
                  }}
                  variant={selectedTimeSlot === t ? "default" : "outline"}
                  size="sm"
                  className={`rounded-xl text-xs font-semibold ${selectedTimeSlot === t ? "bg-[#1e90ff] hover:bg-[#0056D2] text-white" : ""}`}
                >
                  {t}
                </Button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/15 p-4 text-center">
              <p className="text-xs text-muted-foreground">
                No predefined slots for this date.
              </p>
              {/* Allow manual entry if slots are empty so user can still book */}
              <div className="grid grid-cols-4 md:grid-cols-5 gap-2 mt-3">
                 {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].map((t) => (
                   <Button
                     key={t}
                     type="button"
                     onClick={() => {
                       setSelectedTimeSlot(t);
                       onSelectDateTime?.(selectedDate, t);
                     }}
                     variant={selectedTimeSlot === t ? "default" : "outline"}
                     size="sm"
                     className={`rounded-xl text-xs font-semibold ${selectedTimeSlot === t ? "bg-[#1e90ff] hover:bg-[#0056D2] text-white" : ""}`}
                   >
                     {t}
                   </Button>
                 ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
