import { differenceInCalendarDays } from "date-fns";
import type { BoqLine, Request } from "./requests-types";

export type FlaggedLine = {
  boqLineId: string;
  section: string;
  description: string;
  unit: string;
  qtyBudgeted: number;
  consumed: number;
  pctConsumed: number;
  recentBurnPerDay: number;
  priorBurnPerDay: number;
  remaining: number;
  daysToExhaust: number | null;
  projectedOverrunPct: number; // negative means under
  severity: "over" | "watch";
};

// A request "counts" against BoQ once it's approved or beyond — Requested and
// Rejected are not committed spend.
const COMMITTED: ReadonlyArray<Request["status"]> = ["Approved", "Ordered", "Received"];

export function computeInsights(
  requests: Request[],
  boqLines: BoqLine[],
  now: Date = new Date(),
): FlaggedLine[] {
  const flagged: FlaggedLine[] = [];

  for (const line of boqLines) {
    const rows = requests.filter(
      (r) => r.boqLineId === line.id && COMMITTED.includes(r.status),
    );
    if (rows.length === 0) continue;

    const consumed = rows.reduce((s, r) => s + r.qty, 0);
    const pctConsumed = consumed / line.qtyBudgeted;

    // Burn windows use createdAt as the commitment date (no separate delivery date modeled).
    let recentSum = 0;
    let priorSum = 0;
    for (const r of rows) {
      const daysAgo = differenceInCalendarDays(now, new Date(r.createdAt));
      if (daysAgo >= 0 && daysAgo < 14) recentSum += r.qty;
      else if (daysAgo >= 14 && daysAgo < 28) priorSum += r.qty;
    }
    const recentBurnPerDay = recentSum / 14;
    const priorBurnPerDay = priorSum / 14;

    const remaining = line.qtyBudgeted - consumed;
    const daysToExhaust =
      recentBurnPerDay > 0 ? remaining / recentBurnPerDay : null;

    // Accelerating: recent > 1.25× prior, and there is real recent activity.
    const accelerating =
      recentBurnPerDay > 0 &&
      (priorBurnPerDay === 0
        ? recentSum >= 10 // any meaningful new burn where there was none
        : recentBurnPerDay > priorBurnPerDay * 1.25);

    // Projected total = consumed + 30 more days at the recent burn rate.
    const projectedTotal = consumed + Math.max(recentBurnPerDay, 0) * 30;
    const projectedOverrunPct = projectedTotal / line.qtyBudgeted - 1;

    let severity: FlaggedLine["severity"] | null = null;
    if (pctConsumed >= 0.8 && accelerating && (daysToExhaust ?? Infinity) < 30) {
      severity = "over";
    } else if (pctConsumed >= 0.5 && accelerating) {
      severity = "watch";
    }
    if (!severity) continue;

    flagged.push({
      boqLineId: line.id,
      section: line.section,
      description: line.description,
      unit: line.unit,
      qtyBudgeted: line.qtyBudgeted,
      consumed,
      pctConsumed,
      recentBurnPerDay,
      priorBurnPerDay,
      remaining,
      daysToExhaust,
      projectedOverrunPct,
      severity,
    });
  }

  flagged.sort((a, b) => b.projectedOverrunPct - a.projectedOverrunPct);
  return flagged.slice(0, 5);
}

export function fallbackNarrative(f: FlaggedLine): { headline: string; body: string } {
  const round = (n: number) => Math.round(n * 10) / 10;
  const pct = Math.round(f.pctConsumed * 100);
  const over = Math.round(f.projectedOverrunPct * 100);
  const headline =
    f.severity === "over"
      ? `Projected ${over}% over budget`
      : `Burn rate up, watch closely`;
  const body =
    `${pct}% of ${f.qtyBudgeted} ${f.unit} consumed. ` +
    `Recent burn ${round(f.recentBurnPerDay)} ${f.unit}/day vs prior ${round(f.priorBurnPerDay)}. ` +
    (f.daysToExhaust !== null && f.daysToExhaust < 60
      ? `Budget exhausted in ~${Math.max(0, Math.round(f.daysToExhaust))} days at current rate.`
      : `Trend accelerating.`);
  return { headline, body };
}
