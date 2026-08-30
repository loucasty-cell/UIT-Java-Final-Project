export type SessionDuration = 30 | 45 | 60 | 90;

export interface DurationOption {
  value: SessionDuration;
  label: string;
  cost: number;
}

export const DURATION_PRICING: Record<SessionDuration, number> = {
  30: 10,
  45: 15,
  60: 20,
  90: 30,
};

export function getSessionCost(duration: number): number {
  return DURATION_PRICING[duration as SessionDuration] ?? 15;
}

export function getSessionDurationOptions(): DurationOption[] {
  return [
    { value: 30, label: "30 Minutes", cost: 10 },
    { value: 45, label: "45 Minutes", cost: 15 },
    { value: 60, label: "60 Minutes", cost: 20 },
    { value: 90, label: "90 Minutes", cost: 30 },
  ];
}
