export type Status =
  | "Requested"
  | "Approved"
  | "Ordered"
  | "Received"
  | "Rejected";

export type BoqLine = {
  id: string;
  section: string;
  description: string;
  unit: string;
  qtyBudgeted: number;
};

export type HistoryEntry = {
  at: string;
  actor: string;
  action: string;
  comment?: string;
};

export type Request = {
  id: string;
  item: string;
  qty: number;
  unit: string;
  site: string;
  neededBy: string;
  boqLineId: string;
  requestedBy: string;
  createdAt: string;
  status: Status;
  history: HistoryEntry[];
};

export type NewRequestInput = {
  item: string;
  qty: number;
  unit: string;
  site: string;
  neededBy: string;
  boqLineId: string;
  requestedBy: string;
};
