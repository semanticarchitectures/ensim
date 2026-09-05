# org-doctrine-model

The foundation package (Section 6 of `docs/architecture/ARCHITECTURE.md`). Every other ENSIM package depends on this one — it is built first.

## Contents

`schema/` — JSON Schema (2020-12) definitions for the five core entity types: `Organization`, `Role`, `C2Node`, `DoctrineProcess`, `Mission`, plus shared definitions (`common.schema.json`) including the `doctrineSource` citation object required on every record.

`data/` — the USAF seed dataset: `organizations.json`, `roles.json`, `c2nodes.json`, `doctrine-processes.json`, and `data/missions/001-hickam-luzon-airdrop.json` (Mission 1).

## Rules for adding or editing data

Every record needs a `doctrineSource` citing a real, unclassified publication. If a fact can't be verified, add it anyway but note the gap in the citation's `note` field rather than omitting the citation or guessing — see `pacaf-theater-aoc` in `organizations.json` for an example (the AOC construct is confirmed doctrine; the specific numbered-AOC designation is flagged as unverified). This mirrors the AGENTS.md convention at the repo root.

## Validate

```
npm install
npm run validate
```

This checks every record in `data/` against its schema using ajv. Run it after any edit to `data/` or `schema/`.
