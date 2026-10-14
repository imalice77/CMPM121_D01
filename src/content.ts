export type Upgrade = {
  id: string;
  name: string;
  cost: number;
  effect: number;
  unlock: number;
  kind: "tool" | "resource";
};
export const upgrades: Upgrade[] = [
  {
    id: "pen",
    name: "Ballpoint Pen",
    cost: 15,
    effect: 2,
    unlock: 0,
    kind: "tool",
  },
  {
    id: "mechanical",
    name: "Mechanical Pencil",
    cost: 90,
    effect: 4,
    unlock: 100,
    kind: "tool",
  },
  {
    id: "fountain",
    name: "Fountain Pen",
    cost: 350,
    effect: 8,
    unlock: 500,
    kind: "tool",
  },
  {
    id: "premium",
    name: "Premium Pen",
    cost: 1400,
    effect: 15,
    unlock: 2000,
    kind: "tool",
  },
  {
    id: "timer",
    name: "Study Timer",
    cost: 10,
    effect: 0.1,
    unlock: 0,
    kind: "resource",
  },
  {
    id: "desk",
    name: "Library Desk",
    cost: 35,
    effect: 0.2,
    unlock: 100,
    kind: "resource",
  },
  {
    id: "group",
    name: "Study Group",
    cost: 120,
    effect: 1,
    unlock: 500,
    kind: "resource",
  },
  {
    id: "search",
    name: "Search Engine",
    cost: 500,
    effect: 3,
    unlock: 2000,
    kind: "resource",
  },
  {
    id: "ai",
    name: "AI Assistant",
    cost: 1800,
    effect: 10,
    unlock: 5000,
    kind: "resource",
  },
  {
    id: "mentor",
    name: "Peer Mentor",
    cost: 4500,
    effect: 25,
    unlock: 12000,
    kind: "resource",
  },
  {
    id: "lab",
    name: "Research Lab",
    cost: 11000,
    effect: 70,
    unlock: 25000,
    kind: "resource",
  },
  {
    id: "network",
    name: "Academic Network",
    cost: 24000,
    effect: 180,
    unlock: 50000,
    kind: "resource",
  },
];
export const stages = [
  { name: "Elementary School", at: 0 },
  { name: "Middle School", at: 100 },
  { name: "High School", at: 500 },
  { name: "College Freshman", at: 2000 },
  { name: "College Sophomore", at: 5000 },
  { name: "College Junior", at: 12000 },
  { name: "College Senior", at: 25000 },
  { name: "Academic Weapon", at: 50000 },
];
