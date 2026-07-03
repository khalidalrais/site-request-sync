import { cn } from "@/lib/utils";
import { getUrgency } from "@/lib/urgency";

// Accent (golden orange) is reserved for urgency/alerts and primary CTAs.
// Overdue = solid accent, Critical = tinted accent, Soon/Normal = neutral.
const styles: Record<string, string> = {
  Overdue: "bg-accent text-accent-foreground ring-accent/60",
  Critical: "bg-accent/15 text-accent-foreground ring-accent/40",
  Soon: "bg-secondary text-secondary-foreground ring-secondary",
  Normal: "bg-muted text-muted-foreground ring-border",
};

export function UrgencyBadge({ neededBy }: { neededBy: string }) {
  const { level, days } = getUrgency(neededBy);
  const showDays = level === "Overdue" || level === "Critical";
  const label =
    level === "Overdue"
      ? `Overdue ${Math.abs(days)}d`
      : days === 0
        ? "Due today"
        : showDays
          ? `${level} · ${days}d`
          : level;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap tabular-nums",
        styles[level],
      )}
    >
      {label}
    </span>
  );
}
