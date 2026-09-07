# model-explorer

Read-only UI for two things (see `docs/architecture/ARCHITECTURE.md` Section 13 for the full design):

1. **Navigate the data model** — browse Organizations, Roles, C2 Nodes, Doctrine Processes, Systems, Interactions, Decisions, and Missions from `packages/org-doctrine-model/data`, follow their relationships (parent orgs, reporting chains, process steps and actors, and — for Systems/Interactions/Decisions — the mission execution interaction network: which personnel and equipment interact with which, how, and what they actually decide), and see every record's `doctrineSource` citations inline, including unverified-fact notes and non-official-source caveats. Role detail pages show a role's Training, Interactions, and Decisions alongside its reporting chain, so personnel read as network nodes with real inputs/outputs, not just hierarchy entries — see the Loadmaster for the most fully modeled example.

2. **View mission simulation results** — v1 renders a Mission's planned `timeline`. v2 (built): reads real `RunResult` output from `sim-services` (glob-loaded from `missions/<id>/*.json` at the repo root), lets a viewer pick which run to view via a "Run results" list on the Mission detail page, and switches the Timeline section to that run's executed trace — real per-step status, simulated timestamps, and artifacts — with the original planned sequence still available in a collapsed `<details>` underneath. Same view code as v1, just fed richer data, per the plan in `ARCHITECTURE.md` Section 13.

## Scope for v1/v2

Table/list/detail views only, reading static JSON directly. No editing (that's `apps/mission-planner`'s job), no live updates, no graph visualization — those are deliberate future additions, not omissions.

## Status

Both halves built: data-navigation (list/detail views for all five entity types, relationship links, inline doctrine-source citations) and results-viewing (renders real `sim-services` run output when present, falls back to the planned timeline otherwise).

## Stack

TypeScript, React, Vite, react-router-dom. Client-rendered SPA reading JSON directly; no backend needed since all data is static files. Types come from `@ensim/org-doctrine-model` and `@ensim/sim-services`'s generated types (never hand-duplicated — see AGENTS.md Section 5).

## Development

```
npm install   # from repo root
npm run dev --workspace=@ensim/model-explorer
npm run typecheck --workspace=@ensim/model-explorer
```
