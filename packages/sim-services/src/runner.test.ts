import { test } from "node:test";
import assert from "node:assert/strict";
import type { Mission, DoctrineProcess } from "@ensim/org-doctrine-model";
import { runMission } from "./runner.js";

const doctrineProcess: DoctrineProcess = {
  id: "test-process",
  name: "Test Process",
  steps: [
    { stepNumber: 1, description: "First doctrine step", actorRoleId: null, actorC2NodeId: null, actorOrganizationId: null, producesArtifact: "Artifact A" },
    { stepNumber: 2, description: "Second doctrine step", actorRoleId: null, actorC2NodeId: null, actorOrganizationId: null, producesArtifact: null },
  ],
  doctrineSource: [{ publication: "Test source" }],
};

const mission: Mission = {
  id: "test-mission",
  name: "Test Mission",
  status: "Draft",
  fictionalized: true,
  doctrineProcessId: "test-process",
  organizationsInvolved: ["test-org"],
  timeline: [
    { step: 1, description: "Kick off", doctrineProcessStep: 1 },
    { step: 2, description: "Follow up", doctrineProcessStep: 2 },
    { step: 3, description: "No doctrine link", doctrineProcessStep: null },
  ],
  doctrineSource: [{ publication: "Test source" }],
};

test("runMission produces one result step per timeline step, in order", async () => {
  const result = await runMission(mission, doctrineProcess);
  assert.equal(result.steps.length, 3);
  assert.deepEqual(result.steps.map((s) => s.step), [1, 2, 3]);
  assert.equal(result.missionId, "test-mission");
  assert.equal(result.doctrineProcessId, "test-process");
  assert.equal(result.status, "Complete");
});

test("runMission cross-references doctrineProcessStep to resolve producesArtifact", async () => {
  const result = await runMission(mission, doctrineProcess);
  assert.equal(result.steps[0]?.artifactProduced, "Artifact A");
  assert.equal(result.steps[1]?.artifactProduced, null); // doctrine step 2 has no producesArtifact
  assert.equal(result.steps[2]?.artifactProduced, null); // no doctrineProcessStep at all
});

test("runMission advances simulated time monotonically without depending on wall-clock duration", async () => {
  const start = new Date("2026-01-01T00:00:00.000Z");
  const result = await runMission(mission, doctrineProcess, { simulatedStart: start });
  const timestamps = result.steps.map((s) => new Date(s.simulatedTimestamp).getTime());
  assert.equal(timestamps[0], start.getTime());
  assert.ok(timestamps[1]! > timestamps[0]!);
  assert.ok(timestamps[2]! > timestamps[1]!);
});

test("runMission calls onStep for every step, in order, before returning", async () => {
  const seen: number[] = [];
  await runMission(mission, doctrineProcess, {
    onStep: (step) => {
      seen.push(step.step);
    },
  });
  assert.deepEqual(seen, [1, 2, 3]);
});

test("runMission processes timeline steps in step-number order even if the input array isn't sorted", async () => {
  const shuffled: Mission = {
    ...mission,
    timeline: [mission.timeline[2]!, mission.timeline[0]!, mission.timeline[1]!],
  };
  const result = await runMission(shuffled, doctrineProcess);
  assert.deepEqual(result.steps.map((s) => s.step), [1, 2, 3]);
});
