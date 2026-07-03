import { createServerFn } from "@tanstack/react-start";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";

const InsightItem = z.object({
  boqLineId: z.string(),
  section: z.string(),
  description: z.string(),
  unit: z.string(),
  qtyBudgeted: z.number(),
  consumed: z.number(),
  pctConsumed: z.number(),
  recentBurnPerDay: z.number(),
  priorBurnPerDay: z.number(),
  daysToExhaust: z.number().nullable(),
  projectedOverrunPct: z.number(),
  severity: z.enum(["over", "watch"]),
});

const NarrativeSchema = z.object({
  items: z.array(
    z.object({
      boqLineId: z.string(),
      headline: z.string(),
      body: z.string(),
    }),
  ),
});

export type InsightNarrative = z.infer<typeof NarrativeSchema>["items"][number];

export const explainInsights = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ items: z.array(InsightItem) }).parse(input),
  )
  .handler(async ({ data }): Promise<{ items: InsightNarrative[]; degraded: boolean; error?: string }> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { items: [], degraded: true, error: "Missing LOVABLE_API_KEY" };
    if (data.items.length === 0) return { items: [], degraded: false };

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const round = (n: number) => Math.round(n * 10) / 10;
    const lines = data.items
      .map((f) => {
        const pct = Math.round(f.pctConsumed * 100);
        const over = Math.round(f.projectedOverrunPct * 100);
        const days =
          f.daysToExhaust !== null ? `${Math.max(0, Math.round(f.daysToExhaust))} days to exhaust budget` : "no recent burn";
        return `- ${f.boqLineId} (${f.section} — ${f.description}): ${pct}% of ${f.qtyBudgeted} ${f.unit} consumed; recent burn ${round(f.recentBurnPerDay)} ${f.unit}/day vs prior ${round(f.priorBurnPerDay)} ${f.unit}/day; ${days}; projected overrun ${over}%; severity ${f.severity}.`;
      })
      .join("\n");

    const prompt = `You are a construction procurement analyst. For each flagged BoQ line below, produce:
- headline: <=10 words, plain English (e.g. "Projected 34% over budget by month end")
- body: <=30 words, one sentence explaining the risk plus one concrete action for the PM

Rules: only reference the figures provided; do not invent numbers or supplier names. Return every line in the input.

Flagged lines:
${lines}`;

    try {
      const { output } = await generateText({
        model,
        output: Output.object({ schema: NarrativeSchema }),
        prompt,
      });
      return { items: output.items, degraded: false };
    } catch (error) {
      let text: string | undefined;
      if (NoObjectGeneratedError.isInstance(error)) text = error.text;
      const message = error instanceof Error ? error.message : String(error);
      console.warn("explainInsights failed", message, text?.slice(0, 200));
      return { items: [], degraded: true, error: message };
    }
  });
