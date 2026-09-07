// Validates every seed data file against its JSON Schema.
// Run with: npm run validate  (from packages/org-doctrine-model)
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const here = path.dirname(fileURLToPath(import.meta.url));
const schemaDir = path.join(here, "..", "schema");
const dataDir = path.join(here, "..", "data");

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

function loadJson(p) {
  return JSON.parse(readFileSync(p, "utf-8"));
}

// Load every schema file so $ref to common.schema.json resolves.
for (const file of readdirSync(schemaDir)) {
  if (file.endsWith(".schema.json")) {
    ajv.addSchema(loadJson(path.join(schemaDir, file)));
  }
}

const checks = [
  { data: "organizations.json", schemaId: "https://ensim.dev/schema/organization.schema.json" },
  { data: "roles.json", schemaId: "https://ensim.dev/schema/role.schema.json" },
  { data: "c2nodes.json", schemaId: "https://ensim.dev/schema/c2node.schema.json" },
  { data: "doctrine-processes.json", schemaId: "https://ensim.dev/schema/doctrine-process.schema.json" },
  { data: "systems.json", schemaId: "https://ensim.dev/schema/system.schema.json" },
  { data: "interactions.json", schemaId: "https://ensim.dev/schema/interaction.schema.json" },
  { data: "decisions.json", schemaId: "https://ensim.dev/schema/decision.schema.json" },
];

let ok = true;

for (const { data, schemaId } of checks) {
  const validate = ajv.getSchema(schemaId);
  const records = loadJson(path.join(dataDir, data));
  for (const record of records) {
    const valid = validate(record);
    if (!valid) {
      ok = false;
      console.error(`FAIL ${data} :: ${record.id ?? "(no id)"}`);
      console.error(validate.errors);
    } else {
      console.log(`ok   ${data} :: ${record.id}`);
    }
  }
}

// Missions live one per file under data/missions/
const missionSchema = ajv.getSchema("https://ensim.dev/schema/mission.schema.json");
const missionsDir = path.join(dataDir, "missions");
for (const file of readdirSync(missionsDir)) {
  if (!file.endsWith(".json")) continue;
  const record = loadJson(path.join(missionsDir, file));
  const valid = missionSchema(record);
  if (!valid) {
    ok = false;
    console.error(`FAIL missions/${file} :: ${record.id ?? "(no id)"}`);
    console.error(missionSchema.errors);
  } else {
    console.log(`ok   missions/${file} :: ${record.id}`);
  }
}

if (!ok) {
  console.error("\nValidation FAILED.");
  process.exit(1);
} else {
  console.log("\nAll records valid.");
}
