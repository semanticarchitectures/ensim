# org-doctrine-model

The foundation package (Section 6 of `docs/architecture/ARCHITECTURE.md`). Every other ENSIM package depends on this one — it is built first.

## Contents

`schema/` — JSON Schema (2020-12) definitions for seven entity types: `Organization`, `Role`, `C2Node`, `DoctrineProcess`, `Mission` (the org/doctrine hierarchy), plus `System` and `Interaction` (the mission execution interaction network — personnel and equipment as nodes, who/what interacts with who/what, at a finer grain than `DoctrineProcess`'s organizational tasking flow). Shared definitions live in `common.schema.json`, including the `doctrineSource` citation object required on every record and the `participant` reference (`{kind, id}`, where `kind` is `role`/`c2node`/`organization`/`system`) `Interaction.from`/`.to` use.

`data/` — the USAF seed dataset: `organizations.json`, `roles.json`, `c2nodes.json`, `doctrine-processes.json`, `systems.json`, `interactions.json`, and `data/missions/001-hickam-luzon-airdrop.json` (Mission 1). `systems.json`/`interactions.json` model Mission 1's execution-level network: the tasked C-17 crew, Air Traffic Control, the Drop Zone Support Team Leader, and the Mission Commander, interacting with each other and with four representative systems (the aircraft, a tactical communications system, an identity/access-control system, and the CDS airdrop release mechanism). Every System is deliberately representative, not a real fielded system's specifications — see AGENTS.md Section 3.

## Rules for adding or editing data

Every record needs a `doctrineSource` citing a real, unclassified publication. If a fact can't be verified, add it anyway but note the gap in the citation's `note` field rather than omitting the citation or guessing — see `pacaf-theater-aoc` in `organizations.json` for an example (the AOC construct is confirmed doctrine; the specific numbered-AOC designation is flagged as unverified). This mirrors the AGENTS.md convention at the repo root.

## Validate

```
npm install
npm run validate
```

This checks every record in `data/` against its schema using ajv. Run it after any edit to `data/` or `schema/`.

## Types

`types/` holds TypeScript interfaces generated from `schema/` — never hand-write a type here or elsewhere that duplicates a schema (AGENTS.md Section 5). Consumers (e.g. `apps/model-explorer`) import them as `@ensim/org-doctrine-model` or `@ensim/org-doctrine-model/types`. Regenerate after any schema change:

```
npm run generate-types
```
