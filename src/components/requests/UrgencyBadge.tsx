import { cn } from "@/lib/utils";
import { getUrgency } from "@/lib/urgency";

const styles: Record<string, string> = {
  Overdue: "bg-rose-50 text-rose-700 ring-rose-600/10 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20",
  Critical: "bg-orange-50 text-orange-700 ring-orange-600/10 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-400/20",
  Soon: "bg-amber-50 text-amber-800 ring-amber-600/10 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
  Normal: "bg-muted text-muted-foreground ring-border",
};

export function UrgencyBadge({ neededBy }: { neededBy: string }) {
  const { level, days } = getUrgency(neededBy);
  const label =
    level === "Overdue"
      ? `Overdue ${Math.abs(days)}d`
      : days === 0
        ? "Due today"
        : `${level} · ${days}d`;
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
