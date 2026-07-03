import { differenceInCalendarDays } from "date-fns";

export type UrgencyLevel = "Overdue" | "Critical" | "Soon" | "Normal";

export function getUrgency(neededByISO: string, now: Date = new Date()): {
  level: UrgencyLevel;
  days: number;
} {
  const days = differenceInCalendarDays(new Date(neededByISO), now);
  let level: UrgencyLevel;
  if (days < 0) level = "Overdue";
  else if (days <= 2) level = "Critical";
  else if (days <= 7) level = "Soon";
  else level = "Normal";
  return { level, days };
}

export const urgencyRank: Record<UrgencyLevel, number> = {
  Overdue: 0,
  Critical: 1,
  Soon: 2,
  Normal: 3,
};
