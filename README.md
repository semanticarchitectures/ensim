# ENSIM — Enterprise Simulation Framework

Simulates a military enterprise — organizations, doctrine, roles, and command relationships — not just platforms and engagements. See `docs/architecture/ARCHITECTURE.md` for the full design; read `AGENTS.md` before generating or editing any code.

**Initial target:** United States Air Force, modeled from unclassified public doctrine only.
**Mission 1:** a fictionalized C-17 humanitarian airdrop from Hickam to Luzon, modeled on the pattern of Operation Damayan (2013).
**Mission 2:** C5ISR Airdrop — a fictionalized companion mission supporting the same relief effort by air-launching long-endurance ISR/comms-relay UAVs using a Rapid Dragon-class palletized-effects deployment system, coordinated by a TOC-L (Tactical Operations Center-Light).
**Mission 3:** Luzon Aeromedical Evacuation — a fictionalized companion mission evacuating injured disaster-relief personnel and casualties to a higher level of care, crewed by an 18th Aeromedical Evacuation Squadron Flight Nurse/Medical Crew Director and AE Technician, tasked through a Theater Patient Movement Requirements Center (TPMRC).
**Weather data flow:** a real Operational Weather Squadron and an AOC Weather Support Team stream forecasts to both the Air Operations Center and the tasked aircraft, from mission planning through the duration of execution — cross-cutting across all three missions above.

## Status

`packages/org-doctrine-model` is scaffolded and validated: JSON Schema for `Organization`, `Role`, `C2Node`, `DoctrineProcess`, `Mission`, plus `System`, `Interaction`, and `Decision` (a mission execution interaction network — personnel and equipment as nodes, e.g. Mission 1's aircrew/ATC/drop-zone team interacting with a representative aircraft, comms, security/access-control, and airdrop-release system; Mission 2's TOC-L Coordinator and Rapid Dragon/UAV systems; Mission 3's Flight Nurse/AE Technician and patient-care equipment; and a cross-cutting weather data stream from the 17th Operational Weather Squadron through the AOC to every tasked aircraft), a seed USAF dataset, all three mission scenario records, and generated TypeScript types. `apps/model-explorer`'s data-navigation UI is built against all of that. `packages/federation-kernel` has a working minimal HLA federate (Portico, pinned to `portico-2.1.4`) exposed over a JSON-over-stdio bridge. `packages/sim-services` runs Mission 1's discrete-event timeline end to end, publishing to `federation-kernel` and writing a validated run result to `missions/001-hickam-luzon-airdrop/` — the full stack now connects. `packages/c2-interfaces` has five schema-only C2 message types (request → validate → ATO line → execution → report), grounded in real doctrine-process artifacts. `apps/ops-dashboard` renders them as a static process/status board (ATO state, C2 node hand-offs, mission timeline) — no live federation connection yet, a deliberate v1 scope decision. `apps/mission-planner` is not started.

## Getting started

```
just validate-org-doctrine
```

validates the seed dataset.

```
npm run dev --workspace=@ensim/model-explorer
```

runs the model explorer UI. `just setup-portico` vendors Portico (see `docs/architecture/portico-setup.md`) — the release is pinned and it now runs unattended.

```
npm run run-mission --workspace=@ensim/sim-services
```

runs Mission 1 end to end (requires `mvn package` in `packages/federation-kernel` first to publish to the federation; runs without it otherwise).

```
npm run dev --workspace=@ensim/ops-dashboard
```

runs the ops dashboard.

## Layout

See `docs/architecture/ARCHITECTURE.md` Section 8 for the full monorepo structure and what's built vs. planned.
