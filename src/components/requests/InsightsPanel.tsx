import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRequestsStore } from "@/lib/requests-store";
import { computeInsights, fallbackNarrative, type FlaggedLine } from "@/lib/insights";
import { explainInsights } from "@/lib/insights.functions";

export function InsightsPanel() {
  const requests = useRequestsStore((s) => s.requests);
  const boqLines = useRequestsStore((s) => s.boqLines);
  const queryClient = useQueryClient();

  const flagged = useMemo(() => computeInsights(requests, boqLines), [requests, boqLines]);

  const explain = useServerFn(explainInsights);
  const keySignature = flagged
    .map((f) => `${f.boqLineId}:${f.severity}:${Math.round(f.pctConsumed * 100)}`)
    .join("|");

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["insights-narrative", keySignature],
    queryFn: () =>
      explain({
        data: {
          items: flagged.map((f) => ({
            boqLineId: f.boqLineId,
            section: f.section,
            description: f.description,
            unit: f.unit,
            qtyBudgeted: f.qtyBudgeted,
            consumed: f.consumed,
            pctConsumed: f.pctConsumed,
            recentBurnPerDay: f.recentBurnPerDay,
            priorBurnPerDay: f.priorBurnPerDay,
            daysToExhaust: f.daysToExhaust,
            projectedOverrunPct: f.projectedOverrunPct,
            severity: f.severity,
          })),
        },
      }),
    enabled: flagged.length > 0,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (flagged.length === 0) return null;

  const narrativeFor = (f: FlaggedLine) => {
    const ai = data?.items.find((i) => i.boqLineId === f.boqLineId);
    if (ai) return ai;
    return { boqLineId: f.boqLineId, ...fallbackNarrative(f) };
  };

  return (
    <section className="rounded-lg border bg-card shadow-xs">
      <header className="flex items-center justify-between px-4 py-2.5 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <h2 className="text-[13px] font-semibold tracking-tight">Insights</h2>
          <span className="text-[11px] text-muted-foreground">
            {flagged.length} BoQ {flagged.length === 1 ? "line" : "lines"} at risk
          </span>
        </div>
        <div className="flex items-center gap-2">
          {data?.degraded && (
            <span className="text-[11px] text-muted-foreground">AI explanations unavailable</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[12px]"
            disabled={isFetching}
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["insights-narrative"] });
              refetch();
            }}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </header>
      <ul className="divide-y">
        {flagged.map((f) => {
          const n = narrativeFor(f);
          const isOver = f.severity === "over";
          return (
            <li key={f.boqLineId} className="px-4 py-3 flex gap-3">
              <div className="pt-0.5">
                {isOver ? (
                  <TriangleAlert className="h-4 w-4 text-accent-foreground" />
                ) : (
                  <span className="block h-2 w-2 rounded-full bg-secondary-foreground/60 mt-1.5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-mono text-[11px] text-muted-foreground">{f.boqLineId}</span>
                  <span className="text-[13px] font-medium text-foreground">{f.description}</span>
                  <span
                    className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
                      isOver
                        ? "bg-accent/20 text-accent-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {isOver ? "Over" : "Watch"}
                  </span>
                </div>
                <p className="text-[13px] font-medium text-foreground mt-1">{n.headline}</p>
                <p className="text-[12px] text-muted-foreground leading-snug mt-0.5">{n.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
