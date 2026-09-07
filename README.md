# ENSIM — Enterprise Simulation Framework

Simulates a military enterprise — organizations, doctrine, roles, and command relationships — not just platforms and engagements. See `docs/architecture/ARCHITECTURE.md` for the full design; read `AGENTS.md` before generating or editing any code.

**Initial target:** United States Air Force, modeled from unclassified public doctrine only.
**Mission 1:** a fictionalized C-17 humanitarian airdrop from Hickam to Luzon, modeled on the pattern of Operation Damayan (2013).

## Status

`packages/org-doctrine-model` is scaffolded and validated: JSON Schema for `Organization`, `Role`, `C2Node`, `DoctrineProcess`, `Mission`, plus a seed USAF dataset, the Mission 1 scenario record, and generated TypeScript types. `apps/model-explorer`'s data-navigation UI is built against that data. `packages/federation-kernel` has a working minimal HLA federate (Portico, pinned to `portico-2.1.4`) exposed over a JSON-over-stdio bridge. `packages/sim-services` runs Mission 1's discrete-event timeline end to end, publishing to `federation-kernel` and writing a validated run result to `missions/001-hickam-luzon-airdrop/` — the full stack now connects. `packages/c2-interfaces` has five schema-only C2 message types (request → validate → ATO line → execution → report), grounded in real doctrine-process artifacts, with no UI yet. `apps/` beyond `model-explorer` is not started.

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

## Layout

See `docs/architecture/ARCHITECTURE.md` Section 8 for the full monorepo structure and what's built vs. planned.
