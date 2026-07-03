import { addDays } from "date-fns";
import type { BoqLine, Request } from "./requests-types";

const today = new Date();
const iso = (d: Date) => d.toISOString();
const day = (offset: number) => iso(addDays(today, offset));

export const seedBoqLines: BoqLine[] = [
  {
    id: "BOQ-02.01",
    section: "Earthworks",
    description: "Excavation for basement, incl. shoring",
    unit: "m³",
    qtyBudgeted: 4200,
  },
  {
    id: "BOQ-03.04",
    section: "Concrete Works",
    description: "C30 ready-mix concrete for raft foundation",
    unit: "m³",
    qtyBudgeted: 850,
  },
  {
    id: "BOQ-03.11",
    section: "Concrete Works",
    description: "Grade 60 rebar, various diameters",
    unit: "ton",
    qtyBudgeted: 120,
  },
  {
    id: "BOQ-04.02",
    section: "Masonry",
    description: "200mm hollow concrete block, partition walls",
    unit: "m²",
    qtyBudgeted: 6300,
  },
  {
    id: "BOQ-07.06",
    section: "Waterproofing",
    description: "SBS bituminous membrane, roof and wet areas",
    unit: "m²",
    qtyBudgeted: 2100,
  },
  {
    id: "BOQ-16.03",
    section: "Electrical",
    description: "XLPE/PVC cable, 4-core 16mm²",
    unit: "m",
    qtyBudgeted: 3800,
  },
];

export const seedEngineers: string[] = [
  "Eng. A. Khan",
  "Eng. M. Patel",
  "Eng. S. Owusu",
  "Eng. R. Haddad",
  "Eng. L. Chen",
];

export const seedPMs: string[] = [
  "PM Sara Khan",
  "PM Omar Al-Farsi",
  "PM Nadia Rahman",
  "PM Yusuf Malik",
  "PM Layla Nasser",
];

export const seedSites: string[] = [
  "Tower A – Core L4",
  "Tower A – Basement",
  "Tower A – Column pour L5",
  "Tower B – Raft L-1",
  "Tower B – Roof",
  "Villa 12 – GF",
  "Villa 12 – Slab",
  "Villa 12 – Site prep",
];

export const seedRequests: Request[] = [
  {
    id: "REQ-0001",
    item: "C30 ready-mix concrete",
    qty: 45,
    unit: "m³",
    site: "Tower B – Raft L-1",
    neededBy: day(-1),
    boqLineId: "BOQ-03.04",
    requestedBy: "Eng. A. Khan",
    createdAt: day(-5),
    status: "Requested",
    history: [{ at: day(-5), actor: "Eng. A. Khan", action: "Submitted request" }],
  },
  {
    id: "REQ-0002",
    item: "Rebar T16, cut & bent",
    qty: 3.2,
    unit: "ton",
    site: "Tower A – Core L4",
    neededBy: day(1),
    boqLineId: "BOQ-03.11",
    requestedBy: "Eng. M. Patel",
    createdAt: day(-3),
    status: "Approved",
    history: [
      { at: day(-3), actor: "Eng. M. Patel", action: "Submitted request" },
      { at: day(-2), actor: "PM", action: "Approved as PM" },
    ],
  },
  {
    id: "REQ-0003",
    item: "200mm hollow blocks",
    qty: 1200,
    unit: "pcs",
    site: "Villa 12 – GF",
    neededBy: day(4),
    boqLineId: "BOQ-04.02",
    requestedBy: "Eng. S. Owusu",
    createdAt: day(-4),
    status: "Ordered",
    history: [
      { at: day(-4), actor: "Eng. S. Owusu", action: "Submitted request" },
      { at: day(-3), actor: "PM", action: "Approved as PM" },
      { at: day(-1), actor: "Procurement", action: "Marked ordered", comment: "PO-8821 · Al Manara Supplies" },
    ],
  },
  {
    id: "REQ-0004",
    item: "SBS waterproofing membrane 4mm",
    qty: 320,
    unit: "m²",
    site: "Tower B – Roof",
    neededBy: day(10),
    boqLineId: "BOQ-07.06",
    requestedBy: "Eng. R. Haddad",
    createdAt: day(-2),
    status: "Requested",
    history: [{ at: day(-2), actor: "Eng. R. Haddad", action: "Submitted request" }],
  },
  {
    id: "REQ-0005",
    item: "XLPE cable 4x16mm²",
    qty: 450,
    unit: "m",
    site: "Tower A – Basement",
    neededBy: day(6),
    boqLineId: "BOQ-16.03",
    requestedBy: "Eng. L. Chen",
    createdAt: day(-6),
    status: "Received",
    history: [
      { at: day(-6), actor: "Eng. L. Chen", action: "Submitted request" },
      { at: day(-5), actor: "PM", action: "Approved as PM" },
      { at: day(-3), actor: "Procurement", action: "Marked ordered", comment: "PO-8809 · Gulf Electric Co." },
      { at: day(-1), actor: "Site", action: "Marked received", comment: "Full delivery, QC passed" },
    ],
  },
  {
    id: "REQ-0006",
    item: "Excavator rental (30-ton)",
    qty: 1,
    unit: "wk",
    site: "Villa 12 – Site prep",
    neededBy: day(2),
    boqLineId: "BOQ-02.01",
    requestedBy: "Eng. S. Owusu",
    createdAt: day(-2),
    status: "Rejected",
    history: [
      { at: day(-2), actor: "Eng. S. Owusu", action: "Submitted request" },
      {
        at: day(-1),
        actor: "PM",
        action: "Pushed back",
        comment: "Duplicate — REQ-0003 already covers this scope. Please revise qty and re-submit.",
      },
    ],
  },
  {
    id: "REQ-0007",
    item: "C30 ready-mix concrete",
    qty: 12,
    unit: "m³",
    site: "Tower A – Column pour L5",
    neededBy: day(3),
    boqLineId: "BOQ-03.04",
    requestedBy: "Eng. M. Patel",
    createdAt: day(-1),
    status: "Approved",
    history: [
      { at: day(-1), actor: "Eng. M. Patel", action: "Submitted request" },
      { at: day(0), actor: "PM", action: "Approved as PM" },
    ],
  },
  {
    id: "REQ-0008",
    item: "Rebar T12",
    qty: 1.1,
    unit: "ton",
    site: "Villa 12 – Slab",
    neededBy: day(14),
    boqLineId: "BOQ-03.11",
    requestedBy: "Eng. A. Khan",
    createdAt: day(-1),
    status: "Ordered",
    history: [
      { at: day(-1), actor: "Eng. A. Khan", action: "Submitted request" },
      { at: day(-1), actor: "PM", action: "Approved as PM" },
      { at: day(0), actor: "Procurement", action: "Marked ordered", comment: "PO-8825 · Emirates Steel" },
    ],
  },
];
