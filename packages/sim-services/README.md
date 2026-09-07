# sim-services

Discrete-event scenario runner for ENSIM missions. See `docs/architecture/ARCHITECTURE.md` Sections 7, 11, and 13.

## What it does

`npm run run-mission -- <mission-id>` (default `mission-001-hickam-luzon-airdrop`):

1. Loads the Mission record and its referenced DoctrineProcess from `packages/org-doctrine-model/data`.
2. Steps through `mission.timeline` in order, advancing a *simulated* clock (decoupled from wall-clock run time — the run itself completes in milliseconds; simulated time advances by a placeholder 30 minutes per step, since Mission 1 v1 has no real per-step duration data). Each step is cross-referenced against its `doctrineProcessStep` to resolve the artifact that step of doctrine produces (`producesArtifact`).
3. If `packages/federation-kernel`'s jar is built, connects to it as an HLA federate and publishes the Mission record's `status` as it crosses real transitions (`Draft` → `Tasked` → `Executing` → `Complete`, matching `mission.schema.json`'s enum — see `cli.ts`'s `missionStatusForStep` for the exact mapping). This is "the mission run as one federate, org/doctrine as shared state" (ARCHITECTURE.md Section 4a). If the jar isn't built, this step is skipped with a warning (`--no-federation` skips it deliberately).
4. Validates the result against `schema/run-result.schema.json` and writes it to `missions/<mission-id-without-the-"mission-"-prefix>/run-<timestamp>.json` at the repo root.

## Why this is the shape it is

- **Discrete-event, not a scheduler.** Mission 1's timeline is a strictly-ordered linear sequence (`ARCHITECTURE.md` Section 7), not competing/reorderable events, so `runMission` is a simple ordered loop rather than a priority-queue event engine — building the latter now would be solving a problem Mission 1 v1 doesn't have.
- **`RunResult` is its own schema, generated the same way `org-doctrine-model` generates its types** (`scripts/generate-types.mjs` → `src/types/RunResult.ts`, never hand-duplicated — AGENTS.md Section 5). It's the "run-result" data contract `ARCHITECTURE.md` Section 13 deliberately deferred until sim-services was scoped: the planned-timeline shape plus execution fields (status, simulated timestamp, artifact), so `model-explorer`'s future v2 results view can render it without being rebuilt.
- **`federationClient.ts`** is a thin JSON-over-stdio client matching `federation-kernel`'s `StdioBridge` protocol exactly (see that package's README) — this is the actual integration point the two packages were built to meet at.

## Development

```
npm install        # from repo root
npm run build --workspace=@ensim/sim-services
npm run test --workspace=@ensim/sim-services       # node:test - builds first, then runs dist/*.test.js
npm run run-mission --workspace=@ensim/sim-services -- mission-001-hickam-luzon-airdrop
```

Publishing to `federation-kernel` requires its jar built first (`mvn package` in `packages/federation-kernel`) and `java` on `PATH`.

## Status

Working end-to-end: loads real Mission 1 data, runs the discrete-event sequence, publishes to a real Portico federation via `federation-kernel`, validates and writes the result. `missions/001-hickam-luzon-airdrop/` has a real example run committed as a reference. Every `run-mission` invocation writes a new timestamped file there — this will accumulate over time; no pruning policy has been decided yet.

Not yet built: `model-explorer`'s v2 results view (rendering `RunResult` instead of just the planned timeline), and any handling of run *failure* (the runner and schema currently assume every step that runs reaches `Complete` — see `run-result.schema.json`'s note on per-step status).
