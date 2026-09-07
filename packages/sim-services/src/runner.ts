import type { Mission, DoctrineProcess } from "@ensim/org-doctrine-model";
import type { RunResult } from "./types/RunResult.js";

type RunStep = RunResult["steps"][number];

// Mission 1 v1 has no real per-step duration data - it's a discrete-event process/tasking
// simulation, not flight dynamics (ARCHITECTURE.md Section 7). This is a placeholder pace so
// simulated timestamps are monotonically increasing and plausible, decoupled from wall-clock
// run time (the run itself executes near-instantly; 30 simulated minutes per step is not how
// long the runner actually takes).
const SIMULATED_STEP_INTERVAL_MS = 30 * 60 * 1000;

export interface RunOptions {
  /** Defaults to the wall-clock run start. */
  simulatedStart?: Date;
  /** Called after each step completes - e.g. to publish it to federation-kernel as the run progresses. */
  onStep?: (step: RunStep) => void | Promise<void>;
}

/**
 * Steps through mission.timeline in order, advancing a simulated clock, and cross-references
 * each step's doctrineProcessStep against doctrineProcess to resolve the artifact it produces.
 * This is Mission 1 v1's "discrete-event: request received -> validated -> tasked via ATO ->
 * ... -> mission report closes the loop" simulation (ARCHITECTURE.md Section 7) - a linear
 * sequence of instantaneous events at increasing simulated timestamps, not a scheduler with
 * competing/reorderable events, which Mission 1 v1's strictly-ordered timeline doesn't need.
 */
export async function runMission(
  mission: Mission,
  doctrineProcess: DoctrineProcess,
  options: RunOptions = {},
): Promise<RunResult> {
  const startedAt = new Date();
  const simulatedStart = options.simulatedStart ?? startedAt;
  const runId = `${mission.id}-${startedAt.toISOString()}`;

  const steps: RunStep[] = [];
  const sortedTimeline = [...mission.timeline].sort((a, b) => a.step - b.step);

  for (const timelineStep of sortedTimeline) {
    const simulatedTimestamp = new Date(
      simulatedStart.getTime() + (timelineStep.step - 1) * SIMULATED_STEP_INTERVAL_MS,
    );

    const step: RunStep = {
      step: timelineStep.step,
      description: timelineStep.description,
      doctrineProcessStep: timelineStep.doctrineProcessStep ?? null,
      status: "Complete",
      simulatedTimestamp: simulatedTimestamp.toISOString(),
      artifactProduced: resolveArtifact(doctrineProcess, timelineStep.doctrineProcessStep),
    };

    steps.push(step);
    await options.onStep?.(step);
  }

  const completedAt = new Date();

  return {
    runId,
    missionId: mission.id,
    doctrineProcessId: doctrineProcess.id,
    status: "Complete",
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    federationPublished: false, // the caller overwrites this based on whether onStep actually published
    // mission.timeline has schema minItems:1 (mission.schema.json), so steps is non-empty by
    // construction here - the cast just tells TS what the runtime guarantee already ensures.
    steps: steps as RunResult["steps"],
  };
}

function resolveArtifact(
  doctrineProcess: DoctrineProcess,
  doctrineProcessStep: number | null | undefined,
): string | null {
  if (doctrineProcessStep == null) {
    return null;
  }
  const matched = doctrineProcess.steps.find((s) => s.stepNumber === doctrineProcessStep);
  return matched?.producesArtifact ?? null;
}
