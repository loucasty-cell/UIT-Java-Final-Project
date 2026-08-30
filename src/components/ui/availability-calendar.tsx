import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfDay, isBefore, setHours, setMinutes } from "date-fns";
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
  const [currentDate, setCurrentDate] = useState(minDate);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(selectedTime || null);

  const dayMap = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const availMap = new Map<string, TimeSlot[]>();
  slots.forEach((s) => {
    const d = s.dayOfWeek.toUpperCase();
    if (!availMap.has(d)) availMap.set(d, []);
    availMap.get(d)!.push(s);
  });

  const isAvail = (date: Date) => {
    if (isBefore(date, startOfDay(minDate))) return false;
    const dn = dayMap[date.getDay()];
    return availMap.has(dn) && !bookedDates.includes(format(date, "yyyy-MM-dd"));
  };

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

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const allDays = [...Array(monthStart.getDay()).fill(null).map((_, i) => new Date(monthStart.getFullYear(), monthStart.getMonth(), i - monthStart.getDay() + 1)), ...calDays];

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-border/70 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Select Date</CardTitle>
              <CardDescription>{format(currentDate, "MMMM yyyy")}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setCurrentDate(subMonths(currentDate, 1))}><ChevronLeft className="h-4 w-4" /></Button>
              <Button size="sm" variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
              <Button size="sm" variant="outline" onClick={() => setCurrentDate(addMonths(currentDate, 1))}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-7 bg-muted/40 border-b">
              {weekDays.map((d) => (
                <div key={d} className="p-2 text-center text-xs font-semibold">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 divide-x divide-y">
              {allDays.map((day, i) => {
                if (!day) return <div key={i} className="min-h-20 bg-muted/20"></div>;
                const isCurr = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                const isAvailable = isAvail(day);
                const isSel = selectedDate && isSameDay(day, selectedDate);
                return (
                  <button key={i} onClick={() => isAvailable && onSelectDateTime?.(day, getTimes(day)[0] || "")} disabled={!isAvailable} className={`min-h-20 p-2 text-sm ${!isCurr ? "opacity-30" : ""} ${isToday ? "bg-blue-50" : ""} ${isSel ? "bg-primary text-white" : ""} ${isAvailable ? "hover:bg-accent" : ""}`}>
                    <div className="text-xs font-semibold">{format(day, "d")}</div>
                    {isAvailable && isCurr && <Badge variant="secondary" className="text-xs">Open</Badge>}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedDate && times.length > 0 && (
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4" />Select Time</CardTitle>
            <CardDescription>{format(selectedDate, "MMM d, yyyy")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {times.map((t) => (
                <Button key={t} onClick={() => { setSelectedTimeSlot(t); onSelectDateTime?.(selectedDate, t); }} variant={selectedTimeSlot === t ? "default" : "outline"} size="sm">{t}</Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
