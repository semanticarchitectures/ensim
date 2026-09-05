# model-explorer

Read-only UI for two things (see `docs/architecture/ARCHITECTURE.md` Section 13 for the full design):

1. **Navigate the data model** — browse Organizations, Roles, C2 Nodes, Doctrine Processes, and Missions from `packages/org-doctrine-model/data`, follow their relationships (parent orgs, reporting chains, process steps and actors), and see every record's `doctrineSource` citations inline, including unverified-fact notes. This half can be built now — the data already exists and validates.

2. **View mission simulation results** — v1 renders a Mission's planned `timeline` (already real data). v2, once `sim-services` exists and can actually execute a mission, upgrades this to real per-step execution status, timestamps, and generated artifacts, reusing the same view rather than being rebuilt.

## Scope for v1

Table/list/detail views only, reading static JSON directly. No editing (that's `apps/mission-planner`'s job), no live updates, no graph visualization — those are deliberate v2+ additions, not omissions.

## Status

Scaffold only (`package.json`, this README). No components yet — there's more value in `org-doctrine-model` and `sim-services` existing first than in a UI with nothing new to render.

## Stack

TypeScript, React, Vite. Client-rendered SPA reading JSON directly; no backend needed for v1 since the data is static files.
