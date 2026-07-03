import { create } from "zustand";
import { seedBoqLines, seedPMs, seedRequests } from "./seed-data";
import type {
  BoqLine,
  HistoryEntry,
  NewRequestInput,
  Request,
  Status,
} from "./requests-types";

type State = {
  requests: Request[];
  boqLines: BoqLine[];
  nextSeq: number;
  createRequest: (input: NewRequestInput) => string;
  updateRequest: (id: string, input: NewRequestInput) => void;
  approve: (id: string) => void;
  pushBack: (id: string, comment: string) => void;
  resubmit: (id: string) => void;
  markOrdered: (id: string, comment?: string) => void;
  markReceived: (id: string, comment?: string) => void;
};

const nowISO = () => new Date().toISOString();

const appendHistory = (r: Request, entry: HistoryEntry): Request => ({
  ...r,
  history: [...r.history, entry],
});

export const useRequestsStore = create<State>((set, get) => ({
  requests: seedRequests,
  boqLines: seedBoqLines,
  nextSeq: seedRequests.length + 1,

  createRequest: (input) => {
    const seq = get().nextSeq;
    const id = `REQ-${String(seq).padStart(4, "0")}`;
    const req: Request = {
      id,
      ...input,
      createdAt: nowISO(),
      status: "Requested",
      history: [
        { at: nowISO(), actor: input.requestedBy || "Engineer", action: "Submitted request" },
      ],
    };
    set((s) => ({ requests: [req, ...s.requests], nextSeq: s.nextSeq + 1 }));
    return id;
  },

  updateRequest: (id, input) => {
    set((s) => ({
      requests: s.requests.map((r) => (r.id === id ? { ...r, ...input } : r)),
    }));
  },

  approve: (id) => {
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id && r.status === "Requested"
          ? appendHistory({ ...r, status: "Approved" as Status }, {
              at: nowISO(),
              actor: "PM",
              action: "Approved as PM",
            })
          : r,
      ),
    }));
  },

  pushBack: (id, comment) => {
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id && r.status === "Requested"
          ? appendHistory({ ...r, status: "Rejected" as Status }, {
              at: nowISO(),
              actor: "PM",
              action: "Pushed back",
              comment,
            })
          : r,
      ),
    }));
  },

  resubmit: (id) => {
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id && r.status === "Rejected"
          ? appendHistory({ ...r, status: "Requested" as Status }, {
              at: nowISO(),
              actor: r.requestedBy,
              action: "Resubmitted after edits",
            })
          : r,
      ),
    }));
  },

  markOrdered: (id, comment) => {
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id && r.status === "Approved"
          ? appendHistory({ ...r, status: "Ordered" as Status }, {
              at: nowISO(),
              actor: "Procurement",
              action: "Marked ordered",
              comment,
            })
          : r,
      ),
    }));
  },

  markReceived: (id, comment) => {
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id && r.status === "Ordered"
          ? appendHistory({ ...r, status: "Received" as Status }, {
              at: nowISO(),
              actor: "Site",
              action: "Marked received",
              comment,
            })
          : r,
      ),
    }));
  },
}));
