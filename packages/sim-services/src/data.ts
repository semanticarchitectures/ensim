import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import type { Mission, DoctrineProcess } from "@ensim/org-doctrine-model";

const require = createRequire(import.meta.url);

function orgDoctrineModelDataDir(): string {
  // Resolved via node_modules (the npm workspace symlink), not a hardcoded relative path,
  // so this works regardless of where sim-services is invoked from.
  const packageJsonPath = require.resolve("@ensim/org-doctrine-model/package.json");
  return path.join(path.dirname(packageJsonPath), "data");
}

export function loadMission(missionId: string): Mission {
  const missionsDir = path.join(orgDoctrineModelDataDir(), "missions");
  for (const file of readdirSync(missionsDir)) {
    if (!file.endsWith(".json")) continue;
    const record = JSON.parse(readFileSync(path.join(missionsDir, file), "utf-8")) as Mission;
    if (record.id === missionId) return record;
  }
  throw new Error(`No mission record with id "${missionId}" found in ${missionsDir}`);
}

export function loadDoctrineProcess(doctrineProcessId: string): DoctrineProcess {
  const filePath = path.join(orgDoctrineModelDataDir(), "doctrine-processes.json");
  const records = JSON.parse(readFileSync(filePath, "utf-8")) as DoctrineProcess[];
  const found = records.find((r) => r.id === doctrineProcessId);
  if (!found) {
    throw new Error(`No doctrine process record with id "${doctrineProcessId}" found in ${filePath}`);
  }
  return found;
}
