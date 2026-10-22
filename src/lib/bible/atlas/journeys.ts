import { NT_JOURNEYS } from "./journeys-nt.ts";
import { OT_JOURNEYS } from "./journeys-ot.ts";
import type { Journey, RoleId } from "./stops.ts";

export type { Journey, RoleId, Stop } from "./stops.ts";

export const ROLES: { id: RoleId; title: string }[] = [
  { id: "jesus", title: "Jesus" },
  { id: "patriarcas", title: "Patriarcas" },
  { id: "lideres", title: "Líderes e reis" },
  { id: "profetas", title: "Profetas" },
  { id: "sacerdotes", title: "Sacerdotes" },
  { id: "apostolos", title: "Apóstolos" },
];

export const JOURNEYS: Journey[] = [...NT_JOURNEYS, ...OT_JOURNEYS];
