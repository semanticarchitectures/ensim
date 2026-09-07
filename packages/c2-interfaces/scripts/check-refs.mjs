// Checks that every id reference into org-doctrine-model (missionId, producedBy.roleId/
// c2NodeId/organizationId, taskedOrganizationId) actually resolves to a record that exists.
// JSON Schema alone doesn't catch a typo'd id — this does. Mirrors
// packages/org-doctrine-model/scripts/check-refs.mjs. Run with: node scripts/check-refs.mjs
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(here, "..", "data");
const orgDataDir = path.join(here, "..", "..", "org-doctrine-model", "data");
const load = (p) => JSON.parse(readFileSync(p, "utf-8"));

const organizations = load(path.join(orgDataDir, "organizations.json"));
const roles = load(path.join(orgDataDir, "roles.json"));
const c2nodes = load(path.join(orgDataDir, "c2nodes.json"));
const missions = readdirSync(path.join(orgDataDir, "missions"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => load(path.join(orgDataDir, "missions", f)));

const orgIds = new Set(organizations.map((o) => o.id));
const roleIds = new Set(roles.map((r) => r.id));
const c2nodeIds = new Set(c2nodes.map((n) => n.id));
const missionIds = new Set(missions.map((m) => m.id));

const errors = [];
const check = (set, id, where) => {
  if (id != null && !set.has(id)) errors.push(`${where}: dangling reference "${id}"`);
};

const messageFiles = [
  "tasking-requests.json",
  "validation-records.json",
  "ato-lines.json",
  "execution-statuses.json",
  "mission-reports.json",
];

let messageCount = 0;

for (const file of messageFiles) {
  const messages = load(path.join(dataDir, file));
  for (const m of messages) {
    messageCount++;
    check(missionIds, m.missionId, `${file}/${m.id}.missionId`);
    if (m.producedBy) {
      check(roleIds, m.producedBy.roleId, `${file}/${m.id}.producedBy.roleId`);
      check(c2nodeIds, m.producedBy.c2NodeId, `${file}/${m.id}.producedBy.c2NodeId`);
      check(orgIds, m.producedBy.organizationId, `${file}/${m.id}.producedBy.organizationId`);
    }
    if (m.taskedOrganizationId) {
      check(orgIds, m.taskedOrganizationId, `${file}/${m.id}.taskedOrganizationId`);
    }
  }
}

if (errors.length) {
  console.error(`FAILED — ${errors.length} dangling reference(s):`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
} else {
  console.log(`All references into org-doctrine-model resolve (${messageCount} message(s) checked).`);
}
