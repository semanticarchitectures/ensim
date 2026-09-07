# c2-interfaces

Representative, unclassified C2 message schemas for ENSIM's tasking sequence (`docs/architecture/ARCHITECTURE.md` Sections 3, 5, 8). **Schema-only in v1 — no UI components.** ops-dashboard (not started) is the intended future consumer.

## Why schema-only

Every other data-carrying package in this repo (`org-doctrine-model`, `sim-services`) was built schema-first, with real seed/example data proving the schema out, before anything rendered it. `c2-interfaces` follows the same order: define what a C2 message actually *is* here, grounded and validated, before building any component that displays one. Building UI now would mean guessing at a shape `ops-dashboard` hasn't actually needed yet.

## Message types

Five message types, covering ENSIM's representative tasking sequence (`ARCHITECTURE.md` Section 3: request → validate → ATO line → execution → report). Each is grounded directly in an artifact already named in `org-doctrine-model`'s `hadr-request-and-tasking-flow` doctrine process or Mission 1's timeline — none of these are invented:

| Schema | Grounded in |
|---|---|
| `TaskingRequest` | doctrine step 1 — "Assistance request" |
| `ValidationRecord` | doctrine steps 2–4 — "Validated requirement" / "Approved tasking authority" / "JTF stand-up order" (one schema; `recordType` distinguishes which) |
| `ATOLine` | doctrine step 5 — "ATO line". Deliberately representative, not a real USMTF/fixed-column ATO format — see AGENTS.md Section 3, the classification boundary. |
| `ExecutionStatus` | Mission 1 timeline step 7 — discrete sortie states only, no telemetry (matches Mission 1 v1's no-flight-dynamics scope) |
| `MissionReport` | Mission 1 timeline step 8 — closes the loop |

Every message carries a common envelope (`schema/common.schema.json`): `id`, `messageType`, `timestamp`, `missionId`, `doctrineProcessStep`, an optional `producedBy` actor (`roleId`/`c2NodeId`/`organizationId` — mirrors `DoctrineProcess` step's `actorRoleId`/`actorC2NodeId`/`actorOrganizationId` pattern), and a required `doctrineSource` citation array. That last one isn't optional style — AGENTS.md Section 2 explicitly names "a C2 interface" alongside the org/doctrine model and mission scenarios as needing citation discipline.

`data/` has one real, validated example per message type for Mission 1, cross-referencing real `org-doctrine-model` ids (`dirmobfor`, `aoc-air-mobility-division`, `535th-airlift-squadron`, etc.) — not placeholder data.

## Deliberately not addressed here

`producedBy`/`taskedOrganizationId` reference ids are checked to resolve into `org-doctrine-model` (`scripts/check-refs.mjs`), but this package's schema `$id`s are self-contained (not `$ref`'d against `org-doctrine-model`'s `common.schema.json`) — a tiny, stable definition duplicated once rather than a cross-package schema coupling. No pub/sub bus, no message ordering/sequencing enforcement, no UCI/OMS "tiered compliance level" modeling yet — those are real UCI/OMS concepts (Section 5) not needed until there's an actual consumer exercising them.

## Validate

```
npm install
npm run validate
```

Checks every record in `data/` against its schema (ajv) and every id reference into `org-doctrine-model` resolves (`check-refs.mjs`, mirrors `org-doctrine-model`'s own script — JSON Schema alone doesn't catch a typo'd id).

## Types

`types/` holds TypeScript interfaces generated from `schema/` — never hand-write one (AGENTS.md Section 5). Regenerate after any schema change:

```
npm run generate-types
```

## Status

Schemas, generated types, validation, and real Mission-1-grounded example data are built and pass. `ops-dashboard` (the intended consumer) is not started.
