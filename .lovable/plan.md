
# Procurement Requests Dashboard — Plan

A single-page ERP dashboard to track material requests through the flow **Requested → Approved → Ordered → Received**, with in-place pushback (Rejected + comment → engineer edits → resubmits). Urgency is derived from `neededBy` date. Data is in-memory with seeded samples.

## Screens & Structure

Single route `/` (replace placeholder in `src/routes/index.tsx`).

```text
┌───────────────────────────────────────────────────────────┐
│ Header: "Procurement Requests"  [+ New Request]           │
├───────────────────────────────────────────────────────────┤
│ Summary chips: Requested 4 · Approved 2 · Ordered 3 · …   │
├───────────────────────────────────────────────────────────┤
│ Filter tabs: All | Requested | Approved | Ordered |       │
│              Received | Rejected                          │
│ Sort: Urgency (default) | Needed-by | Created             │
├───────────────────────────────────────────────────────────┤
│ Table:                                                    │
│  Urgency · Item · Qty · Site · Needed-by · BoQ · Status · │
│  Requested by · Actions                                   │
│                                                           │
│  Row click → side sheet with detail, history, comments,   │
│  and stage-appropriate action buttons.                    │
└───────────────────────────────────────────────────────────┘
```

## Data Model (TypeScript, in-memory)

```ts
type Status = "Requested" | "Approved" | "Ordered" | "Received" | "Rejected";

type BoqLine = {
  id: string;         // "BOQ-03.04"
  section: string;    // "Concrete Works"
  description: string;// "C30 ready-mix concrete for raft foundation"
  unit: string;       // "m³"
  qtyBudgeted: number;
};

type HistoryEntry = {
  at: string;         // ISO
  actor: string;      // "PM", "Engineer A. Khan"
  action: string;     // "Approved", "Pushed back", "Marked ordered"
  comment?: string;
};

type Request = {
  id: string;             // "REQ-0007"
  item: string;
  qty: number;
  unit: string;
  site: string;           // "Tower B – L4"
  neededBy: string;       // ISO date
  boqLineId: string;
  requestedBy: string;
  createdAt: string;
  status: Status;
  history: HistoryEntry[];
};
```

**Urgency (derived, not stored):** days until `neededBy` vs today.
- `Overdue` (<0) — red
- `Critical` (0–2) — orange
- `Soon` (3–7) — amber
- `Normal` (>7) — muted

Sort order: Overdue → Critical → Soon → Normal, then by `neededBy` ascending.

## Flow & Actions (single "act as PM" — no roles)

| From status  | Actions available                                  |
|--------------|----------------------------------------------------|
| Requested    | **Approve as PM**, **Push back** (requires comment)|
| Rejected     | **Edit & Resubmit** (returns to Requested)         |
| Approved     | **Mark Ordered** (optional PO # + supplier)        |
| Ordered      | **Mark Received** (optional received qty/date)     |
| Received     | terminal (read-only)                               |

Every transition appends a `HistoryEntry`. Pushback = status → Rejected with comment; Edit & Resubmit reopens the same record in the New Request dialog, then sets status back to Requested and logs the resubmission — same ID preserved.

## Components

- `src/routes/index.tsx` — page shell, header, summary chips, filter tabs, sort, table.
- `src/components/requests/RequestsTable.tsx` — sortable/filterable table.
- `src/components/requests/UrgencyBadge.tsx` — computes + renders urgency pill.
- `src/components/requests/StatusBadge.tsx` — colored status pill.
- `src/components/requests/RequestDetailSheet.tsx` — side `Sheet` with detail, BoQ context, history timeline, stage-appropriate action buttons, pushback comment field.
- `src/components/requests/RequestFormDialog.tsx` — create + edit-resubmit dialog (BoQ line select, item, qty, unit, site, needed-by via shadcn DatePicker).
- `src/lib/requests-store.ts` — Zustand store with seeded requests + BoQ lines, transition helpers.
- `src/lib/urgency.ts` — pure helper.
- `src/lib/seed-data.ts` — ~8 realistic sample requests spanning all statuses, ~6 BoQ lines.

Uses existing shadcn primitives (Table, Sheet, Dialog, Select, Button, Badge, Tabs, Popover, Calendar). No new deps beyond `zustand` and `date-fns` (add via `bun add`).

## Head Metadata

Update `__root.tsx` head with real title/description ("BuildFlow — Procurement Requests" / short description) replacing the "Lovable App" placeholders. Set matching og/twitter tags. No og:image.

## Out of Scope (avoid feature creep)

- Auth / roles / RBAC
- Real backend / persistence
- File attachments, notifications, WhatsApp integration
- Multi-line requests, split deliveries, partial receipts beyond a single qty field
- Reporting / analytics beyond the header summary chips

## Verification

After build: load `/`, confirm seeded rows render sorted by urgency, walk one row through Requested → Approved → Ordered → Received, and one through Requested → Rejected (pushback) → Edit & Resubmit → Approved. Check history timeline entries appear for each transition.
