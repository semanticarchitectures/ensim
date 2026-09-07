// Loads the org-doctrine-model seed dataset and derives lookup/relationship
// helpers the UI needs. This is a read-only view over packages/org-doctrine-model/data
// — see docs/architecture/ARCHITECTURE.md Section 13. Types come from the
// package's generated types (schema/*.schema.json), never hand-duplicated here.
import type { Organization, Role, C2Node, DoctrineProcess, Mission, System, Interaction, Decision } from "@ensim/org-doctrine-model";
import type { RunResult } from "@ensim/sim-services";

import organizationsRaw from "../../../../packages/org-doctrine-model/data/organizations.json";
import rolesRaw from "../../../../packages/org-doctrine-model/data/roles.json";
import c2NodesRaw from "../../../../packages/org-doctrine-model/data/c2nodes.json";
import doctrineProcessesRaw from "../../../../packages/org-doctrine-model/data/doctrine-processes.json";
import systemsRaw from "../../../../packages/org-doctrine-model/data/systems.json";
import interactionsRaw from "../../../../packages/org-doctrine-model/data/interactions.json";
import decisionsRaw from "../../../../packages/org-doctrine-model/data/decisions.json";

const missionModules = import.meta.glob<Mission>(
  "../../../../packages/org-doctrine-model/data/missions/*.json",
  { eager: true, import: "default" },
);

// Actual execution traces (ARCHITECTURE.md Section 13 v2), distinct from the planned-timeline
// seed record above — written by sim-services to missions/<id>/run-<timestamp>.json at the repo
// root, not under packages/org-doctrine-model/data.
const runResultModules = import.meta.glob<RunResult>("../../../../missions/*/*.json", {
  eager: true,
  import: "default",
});

export const organizations = organizationsRaw as Organization[];
export const roles = rolesRaw as Role[];
export const c2Nodes = c2NodesRaw as C2Node[];
export const doctrineProcesses = doctrineProcessesRaw as DoctrineProcess[];
export const systems = systemsRaw as System[];
export const interactions = interactionsRaw as Interaction[];
export const decisions = decisionsRaw as Decision[];
export const missions = Object.values(missionModules).sort((a, b) => a.id.localeCompare(b.id));
export const runResults = Object.values(runResultModules).sort((a, b) => b.startedAt.localeCompare(a.startedAt));

export const organizationsById = new Map(organizations.map((o) => [o.id, o]));
export const rolesById = new Map(roles.map((r) => [r.id, r]));
export const c2NodesById = new Map(c2Nodes.map((n) => [n.id, n]));
export const doctrineProcessesById = new Map(doctrineProcesses.map((p) => [p.id, p]));
export const systemsById = new Map(systems.map((s) => [s.id, s]));
export const interactionsById = new Map(interactions.map((i) => [i.id, i]));
export const decisionsById = new Map(decisions.map((d) => [d.id, d]));
export const missionsById = new Map(missions.map((m) => [m.id, m]));

/** Walks an Organization's parentId chain from itself up to the top-level org. */
export function organizationAncestorChain(id: string): Organization[] {
  const chain: Organization[] = [];
  let current = organizationsById.get(id);
  const seen = new Set<string>();
  while (current && !seen.has(current.id)) {
    chain.push(current);
    seen.add(current.id);
    current = current.parentId ? organizationsById.get(current.parentId) : undefined;
  }
  return chain;
}

export function childOrganizations(id: string): Organization[] {
  return organizations.filter((o) => o.parentId === id);
}

/** Walks a Role's reportsToRoleId chain from itself up to the top. */
export function roleReportsChain(id: string): Role[] {
  const chain: Role[] = [];
  let current = rolesById.get(id);
  const seen = new Set<string>();
  while (current && !seen.has(current.id)) {
    chain.push(current);
    seen.add(current.id);
    current = current.reportsToRoleId ? rolesById.get(current.reportsToRoleId) : undefined;
  }
  return chain;
}

export function directReports(id: string): Role[] {
  return roles.filter((r) => r.reportsToRoleId === id);
}

export function rolesInOrganization(organizationId: string): Role[] {
  return roles.filter((r) => r.organizationId === organizationId);
}

export function c2NodesInOrganization(organizationId: string): C2Node[] {
  return c2Nodes.filter((n) => n.organizationId === organizationId);
}

export function rolesInC2Node(c2NodeId: string): Role[] {
  return roles.filter((r) => r.c2NodeId === c2NodeId);
}

export function missionsUsingProcess(doctrineProcessId: string): Mission[] {
  return missions.filter((m) => m.doctrineProcessId === doctrineProcessId);
}

/** Newest first, matching the `runResults` sort order. */
export function runResultsForMission(missionId: string): RunResult[] {
  return runResults.filter((r) => r.missionId === missionId);
}

/** Every Interaction where this node (role/c2node/organization/system) is either end. */
export function interactionsForParticipant(kind: Interaction["from"]["kind"], id: string): Interaction[] {
  return interactions.filter(
    (i) => (i.from.kind === kind && i.from.id === id) || (i.to.kind === kind && i.to.id === id),
  );
}

export function decisionsForRole(roleId: string): Decision[] {
  return decisions.filter((d) => d.roleId === roleId);
}
