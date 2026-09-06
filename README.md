# ENSIM — Enterprise Simulation Framework

Simulates a military enterprise — organizations, doctrine, roles, and command relationships — not just platforms and engagements. See `docs/architecture/ARCHITECTURE.md` for the full design; read `AGENTS.md` before generating or editing any code.

**Initial target:** United States Air Force, modeled from unclassified public doctrine only.
**Mission 1:** a fictionalized C-17 humanitarian airdrop from Hickam to Luzon, modeled on the pattern of Operation Damayan (2013).

## Status

`packages/org-doctrine-model` is scaffolded and validated: JSON Schema for `Organization`, `Role`, `C2Node`, `DoctrineProcess`, `Mission`, plus a seed USAF dataset, the Mission 1 scenario record, and generated TypeScript types. `apps/model-explorer`'s data-navigation UI is built against that data. `packages/federation-kernel` has a Maven scaffold for the Portico/HLA integration, pinned to `portico-2.1.4`, but no federate code yet. `sim-services`, `c2-interfaces`, and the rest of `apps/` are not started.

## Getting started

```
just validate-org-doctrine
```

validates the seed dataset.

```
npm run dev --workspace=@ensim/model-explorer
```

runs the model explorer UI. `just setup-portico` vendors Portico (see `docs/architecture/portico-setup.md`) — the release is pinned and it now runs unattended.

## Layout

See `docs/architecture/ARCHITECTURE.md` Section 8 for the full monorepo structure and what's built vs. planned.
