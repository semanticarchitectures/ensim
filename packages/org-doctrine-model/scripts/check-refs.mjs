// Checks that every id reference (parentId, organizationId, reportsToRoleId,
// actor*Id, doctrineProcessId, organizationsInvolved, rolesInvolved, etc.)
// actually resolves to a record that exists. JSON Schema alone doesn't catch
// a typo'd id — this does. Run with: node scripts/check-refs.mjs
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(here, "..", "data");
const load = (p) => JSON.parse(readFileSync(p, "utf-8"));

const organizations = load(path.join(dataDir, "organizations.json"));
const roles = load(path.join(dataDir, "roles.json"));
const c2nodes = load(path.join(dataDir, "c2nodes.json"));
const doctrineProcesses = load(path.join(dataDir, "doctrine-processes.json"));
const systems = load(path.join(dataDir, "systems.json"));
const interactions = load(path.join(dataDir, "interactions.json"));
const decisions = load(path.join(dataDir, "decisions.json"));
const missions = readdirSync(path.join(dataDir, "missions"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => load(path.join(dataDir, "missions", f)));

const orgIds = new Set(organizations.map((o) => o.id));
const roleIds = new Set(roles.map((r) => r.id));
const c2nodeIds = new Set(c2nodes.map((n) => n.id));
const processIds = new Set(doctrineProcesses.map((p) => p.id));
const systemIds = new Set(systems.map((s) => s.id));

const participantSets = { role: roleIds, c2node: c2nodeIds, organization: orgIds, system: systemIds };

const errors = [];
const check = (set, id, where) => {
  if (id != null && !set.has(id)) errors.push(`${where}: dangling reference "${id}"`);
};

for (const o of organizations) check(orgIds, o.parentId, `organizations/${o.id}.parentId`);

for (const r of roles) {
  check(orgIds, r.organizationId, `roles/${r.id}.organizationId`);
  check(c2nodeIds, r.c2NodeId, `roles/${r.id}.c2NodeId`);
  check(roleIds, r.reportsToRoleId, `roles/${r.id}.reportsToRoleId`);
}

for (const n of c2nodes) check(orgIds, n.organizationId, `c2nodes/${n.id}.organizationId`);

for (const p of doctrineProcesses) {
  for (const s of p.steps) {
    check(roleIds, s.actorRoleId, `doctrine-processes/${p.id}.step${s.stepNumber}.actorRoleId`);
    check(c2nodeIds, s.actorC2NodeId, `doctrine-processes/${p.id}.step${s.stepNumber}.actorC2NodeId`);
    check(orgIds, s.actorOrganizationId, `doctrine-processes/${p.id}.step${s.stepNumber}.actorOrganizationId`);
  }
}

for (const m of missions) {
  check(processIds, m.doctrineProcessId, `missions/${m.id}.doctrineProcessId`);
  for (const id of m.organizationsInvolved ?? []) check(orgIds, id, `missions/${m.id}.organizationsInvolved`);
  for (const id of m.rolesInvolved ?? []) check(roleIds, id, `missions/${m.id}.rolesInvolved`);
}

function checkParticipant(participant, where) {
  const set = participantSets[participant.kind];
  if (!set) {
    errors.push(`${where}: unknown participant kind "${participant.kind}"`);
    return;
  }
  check(set, participant.id, `${where}.id (kind=${participant.kind})`);
}

for (const i of interactions) {
  checkParticipant(i.from, `interactions/${i.id}.from`);
  checkParticipant(i.to, `interactions/${i.id}.to`);
}

for (const d of decisions) {
  check(roleIds, d.roleId, `decisions/${d.id}.roleId`);
  d.informedBy.forEach((p, idx) => checkParticipant(p, `decisions/${d.id}.informedBy[${idx}]`));
}

if (errors.length) {
  console.error(`FAILED — ${errors.length} dangling reference(s):`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
} else {
  console.log(`All references resolve (${organizations.length} orgs, ${roles.length} roles, ${c2nodes.length} c2nodes, ${doctrineProcesses.length} processes, ${systems.length} systems, ${interactions.length} interactions, ${decisions.length} decisions, ${missions.length} mission(s)).`);
}
