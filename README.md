# ENSIM — Enterprise Simulation Framework

Simulates a military enterprise — organizations, doctrine, roles, and command relationships — not just platforms and engagements. See `docs/architecture/ARCHITECTURE.md` for the full design; read `AGENTS.md` before generating or editing any code.

**Initial target:** United States Air Force, modeled from unclassified public doctrine only.
**Mission 1:** a fictionalized C-17 humanitarian airdrop from Hickam to Luzon, modeled on the pattern of Operation Damayan (2013).

## Status

`packages/org-doctrine-model` is scaffolded and validated: JSON Schema for `Organization`, `Role`, `C2Node`, `DoctrineProcess`, `Mission`, plus a seed USAF dataset and the Mission 1 scenario record. `packages/federation-kernel` has a Maven scaffold for the Portico/HLA integration but no federate code yet. Nothing else is started.

## Getting started

```
just validate-org-doctrine
```

validates the seed dataset. See `docs/architecture/portico-setup.md` before attempting `just setup-portico` — it has open TODOs that must be confirmed against the live Portico repo first.

## Layout

See `docs/architecture/ARCHITECTURE.md` Section 8 for the full monorepo structure and what's built vs. planned.
