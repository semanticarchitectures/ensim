// Static reader — no live federation connection (deliberate v1 scope; see README). Reads
// org-doctrine-model (for actor name resolution), c2-interfaces (the message sequence), and
// sim-services' RunResult output (mission timeline), all as static JSON at build/dev time.
import type { Organization, Role, C2Node, Mission } from "@ensim/org-doctrine-model";
import type { TaskingRequest, ValidationRecord, ATOLine, ExecutionStatus, MissionReport } from "@ensim/c2-interfaces";
import type { RunResult } from "@ensim/sim-services";

import organizationsRaw from "../../../packages/org-doctrine-model/data/organizations.json";
import rolesRaw from "../../../packages/org-doctrine-model/data/roles.json";
import c2NodesRaw from "../../../packages/org-doctrine-model/data/c2nodes.json";

import taskingRequestsRaw from "../../../packages/c2-interfaces/data/tasking-requests.json";
import validationRecordsRaw from "../../../packages/c2-interfaces/data/validation-records.json";
import atoLinesRaw from "../../../packages/c2-interfaces/data/ato-lines.json";
import executionStatusesRaw from "../../../packages/c2-interfaces/data/execution-statuses.json";
import missionReportsRaw from "../../../packages/c2-interfaces/data/mission-reports.json";

const missionModules = import.meta.glob<Mission>("../../../packages/org-doctrine-model/data/missions/*.json", {
  eager: true,
  import: "default",
});
const runResultModules = import.meta.glob<RunResult>("../../../missions/*/*.json", {
  eager: true,
  import: "default",
});

export const organizations = organizationsRaw as Organization[];
export const roles = rolesRaw as Role[];
export const c2Nodes = c2NodesRaw as C2Node[];
export const missions = Object.values(missionModules).sort((a, b) => a.id.localeCompare(b.id));
export const runResults = Object.values(runResultModules).sort((a, b) => b.startedAt.localeCompare(a.startedAt));

export const organizationsById = new Map(organizations.map((o) => [o.id, o]));
export const rolesById = new Map(roles.map((r) => [r.id, r]));
export const c2NodesById = new Map(c2Nodes.map((n) => [n.id, n]));

export const taskingRequests = taskingRequestsRaw as TaskingRequest[];
export const validationRecords = validationRecordsRaw as ValidationRecord[];
export const atoLines = atoLinesRaw as ATOLine[];
export const executionStatuses = executionStatusesRaw as ExecutionStatus[];
export const missionReports = missionReportsRaw as MissionReport[];

export type C2Message = TaskingRequest | ValidationRecord | ATOLine | ExecutionStatus | MissionReport;

export const allMessages: C2Message[] = [
  ...taskingRequests,
  ...validationRecords,
  ...atoLines,
  ...executionStatuses,
  ...missionReports,
].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

export function messagesForMission(missionId: string): C2Message[] {
  return allMessages.filter((m) => m.missionId === missionId);
}

export function runResultsForMission(missionId: string): RunResult[] {
  return runResults.filter((r) => r.missionId === missionId);
}

/** The most recent ATOLine for a mission, if any — the dashboard's "ATO state" indicator. */
export function latestAtoLine(missionId: string): ATOLine | undefined {
  return atoLines
    .filter((line) => line.missionId === missionId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
}

export function messageSummary(message: C2Message): string {
  switch (message.messageType) {
    case "TaskingRequest":
      return message.requestSummary;
    case "ValidationRecord":
      return message.summary;
    case "ATOLine":
      return message.taskingSummary;
    case "ExecutionStatus":
      return message.statusNote ?? message.sortieStatus;
    case "MissionReport":
      return message.summary;
  }
}

type Actor = { roleId?: string | null; c2NodeId?: string | null; organizationId?: string | null };

/** Resolves a message's producedBy actor to a display name — the dashboard's "C2 node hand-offs" data. */
export function actorDisplayName(actor: Actor | undefined): string {
  if (!actor) return "External / not tracked";
  if (actor.roleId) return rolesById.get(actor.roleId)?.name ?? actor.roleId;
  if (actor.c2NodeId) return c2NodesById.get(actor.c2NodeId)?.name ?? actor.c2NodeId;
  if (actor.organizationId) return organizationsById.get(actor.organizationId)?.name ?? actor.organizationId;
  return "External / not tracked";
}
