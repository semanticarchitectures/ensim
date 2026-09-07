import { test } from "node:test";
import assert from "node:assert/strict";
import type { RunResult } from "./types/RunResult.js";
import { validateRunResult } from "./validate.js";

const validResult: RunResult = {
  runId: "test-mission-2026-01-01T00:00:00.000Z",
  missionId: "test-mission",
  doctrineProcessId: "test-process",
  status: "Complete",
  startedAt: "2026-01-01T00:00:00.000Z",
  completedAt: "2026-01-01T00:00:01.000Z",
  federationPublished: false,
  steps: [
    {
      step: 1,
      description: "Kick off",
      doctrineProcessStep: 1,
      status: "Complete",
      simulatedTimestamp: "2026-01-01T00:00:00.000Z",
      artifactProduced: "Artifact A",
    },
  ],
};

test("validateRunResult accepts a well-formed RunResult", () => {
  assert.doesNotThrow(() => validateRunResult(validResult));
});

test("validateRunResult rejects a missing required field", () => {
  const { missionId: _missionId, ...invalid } = validResult;
  assert.throws(() => validateRunResult(invalid as RunResult), /failed schema validation/);
});

test("validateRunResult rejects an invalid status enum value", () => {
  const invalid = { ...validResult, status: "InProgress" } as unknown as RunResult;
  assert.throws(() => validateRunResult(invalid), /failed schema validation/);
});

test("validateRunResult rejects an empty steps array", () => {
  const invalid = { ...validResult, steps: [] } as unknown as RunResult;
  assert.throws(() => validateRunResult(invalid), /failed schema validation/);
});
