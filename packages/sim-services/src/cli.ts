#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Mission } from "@ensim/org-doctrine-model";

import { loadMission, loadDoctrineProcess } from "./data.js";
import { runMission } from "./runner.js";
import { FederationClient, defaultFederationKernelJarPath, isFederationKernelJarAvailable } from "./federationClient.js";
import { validateRunResult } from "./validate.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..", ".."); // packages/sim-services/src -> repo root

/**
 * Maps a completed timeline step to the Mission status it implies, so the published Mission
 * record's `status` field tracks run progress through valid Mission.schema.json enum values
 * (Draft -> Tasked -> Executing -> Complete) rather than inventing new fields. Grounded in
 * Mission 1's own timeline text: step 5 is the ATO tasking, step 7 is sortie execution, step 8
 * is the closing mission report. Returns null for steps that don't cross a status boundary.
 */
function missionStatusForStep(stepNumber: number): Mission["status"] | null {
  if (stepNumber === 5 || stepNumber === 6) return "Tasked";
  if (stepNumber === 7) return "Executing";
  if (stepNumber === 8) return "Complete";
  return null;
}

async function main(): Promise<void> {
  const missionId = process.argv[2] ?? "mission-001-hickam-luzon-airdrop";
  const noFederation = process.argv.includes("--no-federation");

  console.log(`Loading mission "${missionId}"...`);
  const mission = loadMission(missionId);
  const doctrineProcess = loadDoctrineProcess(mission.doctrineProcessId);

  const jarPath = defaultFederationKernelJarPath();
  const useFederation = !noFederation && isFederationKernelJarAvailable(jarPath);

  let client: FederationClient | undefined;
  if (useFederation) {
    console.log(`Connecting to federation-kernel (${jarPath})...`);
    client = new FederationClient(jarPath);
    await client.connect(`ensim-mission-${mission.id}`, "sim-services");
  } else {
    console.log(
      noFederation
        ? "Skipping federation-kernel (--no-federation)."
        : `Skipping federation-kernel: jar not found at ${jarPath} (run \`mvn package\` in packages/federation-kernel first).`,
    );
  }

  console.log(`Running "${mission.name}" (${doctrineProcess.name})...`);
  const result = await runMission(mission, doctrineProcess, {
    onStep: async (step) => {
      console.log(`  step ${step.step}: ${step.description}`);
      const newStatus = client ? missionStatusForStep(step.step) : null;
      if (client && newStatus) {
        const updated: Mission = { ...mission, status: newStatus };
        await client.publish("Mission", mission.id, updated);
      }
    },
  });
  result.federationPublished = useFederation;

  if (client) {
    await client.resign();
    client.close();
  }

  validateRunResult(result);

  const missionDirName = mission.id.replace(/^mission-/, "");
  const outDir = path.join(repoRoot, "missions", missionDirName);
  mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `run-${result.startedAt.replace(/:/g, "-")}.json`);
  writeFileSync(outFile, JSON.stringify(result, null, 2) + "\n");

  console.log(`\nRun ${result.status.toLowerCase()}.`);
  console.log(`Wrote ${path.relative(repoRoot, outFile)}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
