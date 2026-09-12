import { format, isBefore, startOfDay } from "date-fns";
import type { MentorAvailabilitySlot } from "@/types/api";

export type { MentorAvailabilitySlot } from "@/types/api";

const minutes = (time: string) => {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
};
const asDate = (value: string) => new Date(`${value}T00:00:00`);
const normalizeTime = (value: string) => value.slice(0, 5);

export function availabilitySummary(slots: MentorAvailabilitySlot[]) {
  const byDate = new Map<string, string[]>();
  slots.forEach((slot) =>
    byDate.set(slot.date, [...(byDate.get(slot.date) ?? []), normalizeTime(slot.time)]),
  );
  return [...byDate.entries()]
    .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
    .map(([date, times]) => `${format(asDate(date), "EEE, MMM d")}: ${times.sort().join(", ")}`)
    .join(" · ");
}

/** Specific future calendar dates published by this mentor. */
export function availableDates(slots: MentorAvailabilitySlot[]) {
  const today = startOfDay(new Date());
  return [...new Set(slots.map((slot) => slot.date))]
    .filter((date) => !isBefore(asDate(date), today))
    .sort()
    .map((date) => ({ value: date, label: format(asDate(date), "EEEE, MMM d") }));
}

/** Published session start times for the exact selected date. */
export function availableTimes(slots: MentorAvailabilitySlot[], date: string) {
  if (!date) return [];
  const now = new Date();
  const selectedDate = asDate(date);
  const isToday = selectedDate.toDateString() === now.toDateString();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const times = new Set<string>();
  slots.filter((slot) => slot.date === date).forEach((slot) => {
    if (!isToday || minutes(slot.time) > currentMinutes) times.add(normalizeTime(slot.time));
  });
  return [...times].sort();
}

/** Keeps the time the learner selected, including their local UTC offset. */
export function localDateTimeWithOffset(date: string, time: string) {
  const local = new Date(`${date}T${time}`);
  const offsetMinutes = -local.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteMinutes = Math.abs(offsetMinutes);
  const offset = `${String(Math.floor(absoluteMinutes / 60)).padStart(2, "0")}:${String(absoluteMinutes % 60).padStart(2, "0")}`;
  return `${date}T${normalizeTime(time)}${sign}${offset}`;
}

/**
 * Availability is published as a fixed calendar date and start time. Display
 * the stored wall-clock value directly so a browser timezone never shifts it.
 */
export function formatPublishedSessionTime(value: string) {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(value);
  if (!match) return new Date(value).toLocaleString();
  return `${format(asDate(match[1]), "EEEE, MMM d")} · ${match[2]}`;
}
