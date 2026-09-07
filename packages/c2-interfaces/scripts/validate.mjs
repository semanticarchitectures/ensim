// Validates every seed data file against its JSON Schema. Mirrors
// packages/org-doctrine-model/scripts/validate.mjs.
// Run with: npm run validate  (from packages/c2-interfaces)
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

for (const file of readdirSync(schemaDir)) {
  if (file.endsWith(".schema.json")) {
    ajv.addSchema(loadJson(path.join(schemaDir, file)));
  }
}

const checks = [
  { data: "tasking-requests.json", schemaId: "https://ensim.dev/schema/c2-interfaces/tasking-request.schema.json" },
  { data: "validation-records.json", schemaId: "https://ensim.dev/schema/c2-interfaces/validation-record.schema.json" },
  { data: "ato-lines.json", schemaId: "https://ensim.dev/schema/c2-interfaces/ato-line.schema.json" },
  { data: "execution-statuses.json", schemaId: "https://ensim.dev/schema/c2-interfaces/execution-status.schema.json" },
  { data: "mission-reports.json", schemaId: "https://ensim.dev/schema/c2-interfaces/mission-report.schema.json" },
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

if (!ok) {
  console.error("\nValidation FAILED.");
  process.exit(1);
} else {
  console.log("\nAll records valid.");
}
