# AGENTS.md — conventions for AI coding tools working in this repo

This repo (ENSIM) is intended to be built entirely by AI coding tools (Claude Code, Cursor, Kiro). These conventions exist because that only works reliably if generation is grounded and bounded — read this before generating or editing anything.

## 1. Read the architecture doc first

`docs/architecture/ARCHITECTURE.md` is the source of truth for what this system is and why. If a task seems to conflict with it, stop and flag the conflict rather than silently deviating. Key decisions already made and not open for re-litigation without an explicit human request: RTI = Portico, messages = JSON (not XML), Mission 1 v1 = data/process simulation only (no flight dynamics, no DIS/entity-gateway), stack = TypeScript everywhere except `packages/federation-kernel` (Java, because Portico requires it).

## 2. Ground doctrine and organizational facts — never invent them

Anything touching the org/doctrine model (`packages/org-doctrine-model`), a mission scenario (`missions/`), or a C2 interface must be traceable to a real, unclassified, public source: a doctrine publication (AFDP, JP, DAFMAN, DoDD), a public unit fact sheet, or reporting on a real precedent operation. Every record in `org-doctrine-model/data` has a `doctrineSource` field for this reason — it is required by schema, not optional style. If you can't verify a specific fact (a unit designation, a process detail), still add the record if the general concept is doctrinally sound, but say so explicitly in the citation's `note` field. See `organizations.json`'s `pacaf-theater-aoc` record for the pattern: the AOC construct is confirmed, the specific numbered-AOC designation is flagged as unverified. Do not silently guess and present it as fact — that's the single most damaging failure mode for this project, more damaging than an incomplete dataset.

## 3. The classification boundary is a hard line, not a style preference

Nothing in this repo may require, encode, approximate, or reference classified or CUI information — no real system names presented as authentic (TBMCS, GCCS-J, JADOCS, or similar), no data or interface details that aren't independently available from a public source. Section 3 of `ARCHITECTURE.md` calls this out explicitly: ENSIM's C2 interfaces are *representative*, built from public doctrine, structurally similar to real systems (same roles, same message types, same tasking sequence) but never styled or named to resemble an actual fielded system's UI. If a task description asks you to replicate a specific real system's interface, screens, or exact message formats, treat that as a request that needs a public source cited before you proceed — if none exists, build a representative equivalent instead and say why.

## 4. Mission scenarios are fictionalized unless stated otherwise

Mission 1 and any future mission are fictionalized scenarios *inspired by* real doctrine and, where noted, real precedent operations (e.g., Mission 1 is modeled on the pattern of Operation Damayan, 2013). They are not depictions of actual missions. Every `Mission` record has a `fictionalized` boolean for this reason — it should be `true` unless a human explicitly instructs otherwise for a specific, deliberate reason.

## 5. Schema-first, not schema-optional

`packages/org-doctrine-model/schema` is canonical. Don't add fields to data files that aren't in the schema (schemas use `additionalProperties: false` on purpose), and don't hand-write duplicate type definitions elsewhere (e.g., a separate Java POJO or TS interface that silently drifts from the JSON Schema) — generate or derive them from the schema instead. Run `npm run validate` in `packages/org-doctrine-model` after any change to `schema/` or `data/`.

## 6. License provenance

Content inspired by or adapted from Open-Arsenal (UCI/OMS — see `ARCHITECTURE.md` Section 5) is marked "Government Owned," not a standard OSI license, and this has not been independently verified in detail. Cite it as inspiration where used (e.g., in `c2-interfaces` design comments); don't copy schema fragments verbatim without flagging the provenance question to a human first.

## 7. Package boundaries

`org-doctrine-model` has no dependencies on other ENSIM packages — everything else depends on it, never the reverse. `federation-kernel` is the only package allowed to depend on Portico/Java; keep that dependency contained there, exposed to the rest of the system only through its JSON-based local interface (see `packages/federation-kernel/README.md`). `entity-gateway` (DIS/RPR-FOM) does not exist yet and is out of scope until a v2 fidelity increment is explicitly requested — do not add real-time entity state, geospatial, or physics code to Mission 1 v1 work.

## 8. When in doubt

Ask, or leave a clearly marked TODO/note citing what's uncertain (see the pattern used throughout `org-doctrine-model/data`), rather than filling a gap with a plausible-sounding invention. That applies to doctrine facts, to license terms, and to architectural decisions not already settled in `ARCHITECTURE.md`.
