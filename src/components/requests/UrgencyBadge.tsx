import { cn } from "@/lib/utils";
import { getUrgency } from "@/lib/urgency";

const styles: Record<string, string> = {
  Overdue: "bg-destructive/15 text-destructive border-destructive/30",
  Critical: "bg-orange-500/15 text-orange-700 border-orange-500/30 dark:text-orange-300",
  Soon: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300",
  Normal: "bg-muted text-muted-foreground border-border",
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
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        styles[level],
      )}
    >
      {label}
    </span>
  );
}
