import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRequestsStore } from "@/lib/requests-store";
import type { Request, NewRequestInput } from "@/lib/requests-types";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: Request | null;
};

const defaultInput: NewRequestInput = {
  item: "",
  qty: 0,
  unit: "pcs",
  site: "",
  neededBy: new Date().toISOString(),
  boqLineId: "",
  requestedBy: "Eng. A. Khan",
};

export function RequestFormDialog({ open, onOpenChange, editing }: Props) {
  const boqLines = useRequestsStore((s) => s.boqLines);
  const createRequest = useRequestsStore((s) => s.createRequest);
  const updateRequest = useRequestsStore((s) => s.updateRequest);
  const resubmit = useRequestsStore((s) => s.resubmit);

  const initial = useMemo<NewRequestInput>(() => {
    if (!editing) return defaultInput;
    return {
      item: editing.item,
      qty: editing.qty,
      unit: editing.unit,
      site: editing.site,
      neededBy: editing.neededBy,
      boqLineId: editing.boqLineId,
      requestedBy: editing.requestedBy,
    };
  }, [editing]);

  const [form, setForm] = useState<NewRequestInput>(initial);

  // Reset when opened / editing target changes
  useMemo(() => {
    setForm(initial);
  }, [initial, open]);

  const isEdit = !!editing;

  const canSubmit =
    form.item.trim() &&
    form.qty > 0 &&
    form.unit.trim() &&
    form.site.trim() &&
    form.boqLineId &&
    form.requestedBy.trim();

  const submit = () => {
    if (!canSubmit) return;
    if (isEdit && editing) {
      updateRequest(editing.id, form);
      if (editing.status === "Rejected") {
        resubmit(editing.id);
        toast.success(`${editing.id} resubmitted`);
      } else {
        toast.success(`${editing.id} updated`);
      }
    } else {
      const id = createRequest(form);
      toast.success(`${id} submitted`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? editing?.status === "Rejected"
                ? `Edit & Resubmit ${editing.id}`
                : `Edit ${editing?.id}`
              : "New material request"}
          </DialogTitle>
          <DialogDescription>
            Link the request to a Bill of Quantities line so procurement has full context.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="item">Item</Label>
            <Input
              id="item"
              value={form.item}
              onChange={(e) => setForm({ ...form, item: e.target.value })}
              placeholder="e.g. C30 ready-mix concrete"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input
                id="qty"
                type="number"
                min={0}
                step="any"
                value={form.qty || ""}
                onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="m³, ton, pcs"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="site">Site / location</Label>
            <Input
              id="site"
              value={form.site}
              onChange={(e) => setForm({ ...form, site: e.target.value })}
              placeholder="Tower B – L4"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Needed by</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("justify-start text-left font-normal")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(new Date(form.neededBy), "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(form.neededBy)}
                    onSelect={(d) =>
                      d && setForm({ ...form, neededBy: d.toISOString() })
                    }
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="requestedBy">Requested by</Label>
              <Input
                id="requestedBy"
                value={form.requestedBy}
                onChange={(e) => setForm({ ...form, requestedBy: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>BoQ line</Label>
            <Select
              value={form.boqLineId}
              onValueChange={(v) => setForm({ ...form, boqLineId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a BoQ line" />
              </SelectTrigger>
              <SelectContent>
                {boqLines.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    <span className="font-mono text-xs mr-2">{l.id}</span>
                    {l.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {isEdit
              ? editing?.status === "Rejected"
                ? "Save & Resubmit"
                : "Save changes"
              : "Submit request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
