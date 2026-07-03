import { useState } from "react";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "./StatusBadge";
import { UrgencyBadge } from "./UrgencyBadge";
import { useRequestsStore } from "@/lib/requests-store";
import type { Request } from "@/lib/requests-types";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Truck, PackageCheck, Pencil } from "lucide-react";

type Props = {
  request: Request | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (r: Request) => void;
};

export function RequestDetailSheet({ request, onOpenChange, onEdit }: Props) {
  const boqLines = useRequestsStore((s) => s.boqLines);
  const approve = useRequestsStore((s) => s.approve);
  const pushBack = useRequestsStore((s) => s.pushBack);
  const markOrdered = useRequestsStore((s) => s.markOrdered);
  const markReceived = useRequestsStore((s) => s.markReceived);

  const [pushbackComment, setPushbackComment] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [receiveNote, setReceiveNote] = useState("");

  if (!request) return null;
  const boq = boqLines.find((l) => l.id === request.boqLineId);

  const doApprove = () => {
    approve(request.id);
    toast.success(`${request.id} approved`);
    onOpenChange(false);
  };
  const doPushback = () => {
    if (!pushbackComment.trim()) {
      toast.error("Add a comment explaining the pushback");
      return;
    }
    pushBack(request.id, pushbackComment.trim());
    toast.success(`${request.id} pushed back to engineer`);
    setPushbackComment("");
    onOpenChange(false);
  };
  const doOrder = () => {
    markOrdered(request.id, orderNote.trim() || undefined);
    toast.success(`${request.id} marked ordered`);
    setOrderNote("");
    onOpenChange(false);
  };
  const doReceive = () => {
    markReceived(request.id, receiveNote.trim() || undefined);
    toast.success(`${request.id} marked received`);
    setReceiveNote("");
    onOpenChange(false);
  };

  return (
    <Sheet open={!!request} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle className="font-mono text-base">{request.id}</SheetTitle>
            <StatusBadge status={request.status} />
            <UrgencyBadge neededBy={request.neededBy} />
          </div>
          <SheetDescription>{request.item}</SheetDescription>
        </SheetHeader>

        <div className="px-4 space-y-6 pb-6">
          <section className="grid grid-cols-2 gap-3 text-sm">
            <Field label="Quantity" value={`${request.qty} ${request.unit}`} />
            <Field label="Needed by" value={format(new Date(request.neededBy), "PPP")} />
            <Field label="Site" value={request.site} />
            <Field label="Requested by" value={request.requestedBy} />
            <Field
              label="Created"
              value={format(new Date(request.createdAt), "PP")}
            />
          </section>

          <section className="rounded-md border p-3">
            <div className="text-xs font-medium text-muted-foreground mb-1">
              BoQ line
            </div>
            {boq ? (
              <div className="text-sm">
                <div className="font-mono text-xs text-muted-foreground">
                  {boq.id} · {boq.section}
                </div>
                <div>{boq.description}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Budgeted: {boq.qtyBudgeted} {boq.unit}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Unlinked</div>
            )}
          </section>

          <Separator />

          {/* Stage actions */}
          {request.status === "Requested" && (
            <section className="space-y-3">
              <Button className="w-full" onClick={doApprove}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Approve as PM
              </Button>
              <div className="space-y-2">
                <Label htmlFor="pb">Push back with comment</Label>
                <Textarea
                  id="pb"
                  placeholder="Why are you rejecting this? What should the engineer change?"
                  value={pushbackComment}
                  onChange={(e) => setPushbackComment(e.target.value)}
                />
                <Button variant="destructive" className="w-full" onClick={doPushback}>
                  <XCircle className="mr-2 h-4 w-4" /> Push back
                </Button>
              </div>
            </section>
          )}

          {request.status === "Approved" && (
            <section className="space-y-2">
              <Label htmlFor="po">PO # / supplier (optional)</Label>
              <Input
                id="po"
                placeholder="PO-8830 · Al Manara Supplies"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
              />
              <Button className="w-full" onClick={doOrder}>
                <Truck className="mr-2 h-4 w-4" /> Mark ordered
              </Button>
            </section>
          )}

          {request.status === "Ordered" && (
            <section className="space-y-2">
              <Label htmlFor="rn">Receipt note (optional)</Label>
              <Input
                id="rn"
                placeholder="Full delivery, QC passed"
                value={receiveNote}
                onChange={(e) => setReceiveNote(e.target.value)}
              />
              <Button className="w-full" onClick={doReceive}>
                <PackageCheck className="mr-2 h-4 w-4" /> Mark received
              </Button>
            </section>
          )}

          {request.status === "Rejected" && (
            <section>
              <Button className="w-full" onClick={() => onEdit(request)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit & Resubmit
              </Button>
            </section>
          )}

          {request.status === "Received" && (
            <div className="text-sm text-muted-foreground text-center">
              Request completed. No further actions.
            </div>
          )}

          <Separator />

          <section>
            <div className="text-xs font-medium text-muted-foreground mb-2">
              History
            </div>
            <ol className="space-y-3">
              {request.history.map((h, i) => (
                <li key={i} className="text-sm">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium">{h.action}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(h.at), "PP p")}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">{h.actor}</div>
                  {h.comment && (
                    <div className="mt-1 rounded bg-muted px-2 py-1 text-sm">
                      {h.comment}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
