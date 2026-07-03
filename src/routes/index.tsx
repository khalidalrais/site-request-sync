import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { Plus, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";


import { useRequestsStore } from "@/lib/requests-store";
import { getUrgency, urgencyRank } from "@/lib/urgency";
import type { Request, Status } from "@/lib/requests-types";
import { UrgencyBadge } from "@/components/requests/UrgencyBadge";
import { StatusBadge } from "@/components/requests/StatusBadge";
import { RequestDetailSheet } from "@/components/requests/RequestDetailSheet";
import { RequestFormDialog } from "@/components/requests/RequestFormDialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Procurement Requests — BuildFlow" },
      {
        name: "description",
        content:
          "Track site material requests from submission through approval, order, and delivery.",
      },
      { property: "og:title", content: "Procurement Requests — BuildFlow" },
      {
        property: "og:description",
        content:
          "Replace WhatsApp chaos: one dashboard for engineers, PMs, and procurement.",
      },
    ],
  }),
  component: Dashboard,
});

type Filter = Status | "All";
type SortKey = "urgency" | "neededBy";

const filters: Filter[] = [
  "All",
  "Requested",
  "Approved",
  "Ordered",
  "Received",
  "Rejected",
];

function Dashboard() {
  const requests = useRequestsStore((s) => s.requests);
  const boqLines = useRequestsStore((s) => s.boqLines);

  const [filter, setFilter] = useState<Filter>("All");
  const [sort, setSort] = useState<SortKey>("urgency");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Request | null>(null);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      All: requests.length,
      Requested: 0,
      Approved: 0,
      Ordered: 0,
      Received: 0,
      Rejected: 0,
    };
    for (const r of requests) c[r.status]++;
    return c;
  }, [requests]);

  const visible = useMemo(() => {
    let rows = requests;
    if (filter !== "All") rows = rows.filter((r) => r.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.item.toLowerCase().includes(q) ||
          r.site.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.boqLineId.toLowerCase().includes(q),
      );
    }
    const sorted = [...rows];
    if (sort === "urgency") {
      sorted.sort((a, b) => {
        const ua = getUrgency(a.neededBy);
        const ub = getUrgency(b.neededBy);
        const r = urgencyRank[ua.level] - urgencyRank[ub.level];
        if (r !== 0) return r;
        return +new Date(a.neededBy) - +new Date(b.neededBy);
      });
    } else if (sort === "neededBy") {
      sorted.sort((a, b) => +new Date(a.neededBy) - +new Date(b.neededBy));
    }
    return sorted;
  }, [requests, filter, sort, query]);

  const selected = requests.find((r) => r.id === selectedId) ?? null;

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (r: Request) => {
    setSelectedId(null);
    setEditing(r);
    setFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Procurement Requests
            </h1>
            <p className="text-sm text-muted-foreground">
              Site engineers submit · PMs approve · Procurement orders · Site receives
            </p>
          </div>
          <Button onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" /> New request
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6 space-y-4">
        {/* Summary chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md border px-3 py-2 text-left transition-colors ${
                filter === f
                  ? "border-primary bg-primary/5"
                  : "hover:bg-accent"
              }`}
            >
              <div className="text-xs text-muted-foreground">{f}</div>
              <div className="text-lg font-semibold">{counts[f]}</div>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList>
              {filters.map((f) => (
                <TabsTrigger key={f} value={f}>
                  {f}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search item, site, BoQ…"
                className="pl-8 w-64"
              />
            </div>
          </div>
        </div>






        {/* Table */}
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Urgency</TableHead>
                <TableHead>Request</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Needed by</TableHead>
                <TableHead>BoQ</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                    No requests match.
                  </TableCell>
                </TableRow>
              )}
              {visible.map((r) => {
                const boq = boqLines.find((l) => l.id === r.boqLineId);
                return (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedId(r.id)}
                  >
                    <TableCell>
                      <UrgencyBadge neededBy={r.neededBy} />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{r.item}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {r.id}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {r.qty} {r.unit}
                    </TableCell>
                    <TableCell className="text-sm">{r.site}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {format(new Date(r.neededBy), "MMM d")}
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs">{r.boqLineId}</div>
                      {boq && (
                        <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {boq.section}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {r.requestedBy}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </main>

      <RequestDetailSheet
        request={selected}
        onOpenChange={(open) => !open && setSelectedId(null)}
        onEdit={openEdit}
      />
      <RequestFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        editing={editing}
      />
    </div>
  );
}
