import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type AvailabilityDate = { date: string; times: string[] };

export function availabilitySlotsFromDates(entries: AvailabilityDate[]) {
  return entries.flatMap((entry) => entry.times.map((time) => ({ date: entry.date, time })));
}

export function AvailabilityEditor({
  value,
  onChange,
  idPrefix,
}: {
  value: AvailabilityDate[];
  onChange: (value: AvailabilityDate[]) => void;
  idPrefix: string;
}) {
  const update = (index: number, next: AvailabilityDate) =>
    onChange(value.map((entry, entryIndex) => (entryIndex === index ? next : entry)));
  const updateDate = (dateIndex: number, date: string) =>
    update(dateIndex, { ...value[dateIndex], date });
  const updateTime = (dateIndex: number, timeIndex: number, time: string) => {
    const entry = value[dateIndex];
    const times = [...entry.times];
    times[timeIndex] = time;
    update(dateIndex, { ...entry, times });
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>Available dates and times</Label>
        <p className="text-xs text-muted-foreground">
          Add exact dates and session start times. The other person can choose only from these slots.
        </p>
      </div>
      {value.map((entry, dateIndex) => (
        <div key={`${entry.date}-${dateIndex}`} className="rounded-lg border p-3">
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[190px] flex-1">
              <Label htmlFor={`${idPrefix}-date-${dateIndex}`} className="text-xs">Date</Label>
              <Input
                id={`${idPrefix}-date-${dateIndex}`}
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={entry.date}
                onChange={(event) => updateDate(dateIndex, event.target.value)}
                onInput={(event) => updateDate(dateIndex, event.currentTarget.value)}
                onBlur={(event) => updateDate(dateIndex, event.currentTarget.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => onChange(value.filter((_, index) => index !== dateIndex))}
            >
              Remove date
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {entry.times.map((time, timeIndex) => (
              <div key={`${idPrefix}-time-${dateIndex}-${timeIndex}`} className="flex flex-wrap items-end gap-2">
                <div className="min-w-[190px] flex-1">
                  <Label htmlFor={`${idPrefix}-time-${dateIndex}-${timeIndex}`} className="text-xs">Start time</Label>
                  <Input
                    id={`${idPrefix}-time-${dateIndex}-${timeIndex}`}
                    type="time"
                    value={time}
                    onChange={(event) => updateTime(dateIndex, timeIndex, event.target.value)}
                    onInput={(event) => updateTime(dateIndex, timeIndex, event.currentTarget.value)}
                    onBlur={(event) => updateTime(dateIndex, timeIndex, event.currentTarget.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => update(dateIndex, { ...entry, times: entry.times.filter((_, index) => index !== timeIndex) })}
                >
                  Remove time
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => update(dateIndex, { ...entry, times: [...entry.times, ""] })}
            >
              Add time
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => onChange([...value, { date: "", times: [""] }])}>
        Add available date
      </Button>
    </div>
  );
}
