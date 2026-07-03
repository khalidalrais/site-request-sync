import { cn } from "@/lib/utils";
import type { Status } from "@/lib/requests-types";

// Neutral navy/blue palette for pipeline states.
// Accent (orange) is intentionally NOT used here — reserved for urgency + CTAs.
const styles: Record<Status, string> = {
  Requested: "bg-secondary text-secondary-foreground ring-secondary",
  Approved: "bg-primary/10 text-primary ring-primary/20",
  Ordered: "bg-primary/15 text-primary ring-primary/25",
  Received: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-600/15",
};

const dotStyles: Record<Status, string> = {
  Requested: "bg-primary/60",
  Approved: "bg-primary",
  Ordered: "bg-primary",
  Received: "bg-emerald-500",
  Rejected: "bg-rose-500",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        styles[status],
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[status])} />
      {status}
    </span>
  );
}
