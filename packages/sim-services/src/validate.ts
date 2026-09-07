import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { RunResult } from "./types/RunResult.js";

// require(), not an ESM import: ajv/ajv-formats' .d.ts declares default exports in a way that
// doesn't type-check cleanly under NodeNext module resolution, even though the runtime CJS
// interop works fine (same tension package.json's plain-JS validate.mjs in org-doctrine-model
// never hits, since it isn't type-checked). require() sidesteps the broken type declarations.
const require = createRequire(import.meta.url);
const Ajv2020 = require("ajv/dist/2020.js");
const addFormats = require("ajv-formats");

const here = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(here, "..", "schema", "run-result.schema.json");

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validateFn = ajv.compile(JSON.parse(readFileSync(schemaPath, "utf-8")));

export function validateRunResult(result: RunResult): void {
  if (!validateFn(result)) {
    const message = ajv.errorsText(validateFn.errors ?? [], { separator: "\n  " });
    throw new Error(`RunResult failed schema validation:\n  ${message}`);
  }
}
