import { cn } from "@/lib/utils";
import type { Status } from "@/lib/requests-types";

const styles: Record<Status, string> = {
  Requested: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-300",
  Approved: "bg-violet-500/15 text-violet-700 border-violet-500/30 dark:text-violet-300",
  Ordered: "bg-cyan-500/15 text-cyan-700 border-cyan-500/30 dark:text-cyan-300",
  Received: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
  Rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}
