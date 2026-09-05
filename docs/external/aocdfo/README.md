# AOC-DFO reference material (external project)

These four files (`requirements.md`, `design.md`, `tasks.md`, `corpus-registry.yaml`) are the actual spec set from **AOC-DFO** (AOC Data Flow Ontology), a separate project built in a different Claude account, shared with this ENSIM session by Kevin on 2026-09-05. They are **not part of ENSIM's build** — no ENSIM code should import or depend on anything here. They're kept for two reasons:

1. **`corpus-registry.yaml` has real, citable doctrine sources** that upgraded several ENSIM records from "unverified" to grounded — see the `doctrineSource` entries citing AFMAN 13-1AOC Vol 3 in `packages/org-doctrine-model/data/c2nodes.json` and `roles.json`, added 2026-09-05. This registry is a better-curated source list than ENSIM's own ad hoc citations in several places (exact editions, dates, tier classification, verification status).
2. **The open decision in `ARCHITECTURE.md` Section 12** (JSON Schema vs. BFO/CCO) is about whether ENSIM should eventually align with this project's approach. Having the actual spec here means that decision can be evaluated against what AOC-DFO actually does, not a secondhand summary.

AOC-DFO models the same real-world AOC that ENSIM's `org-doctrine-model` does, but as a BFO/CCO ontology (OWL/RDF, SHACL shapes, competency questions) rather than JSON Schema, and its scope is broader — full message-element-level modeling (USMTF, Link 16 J-series, VMF), not just the org/tasking layer ENSIM needs for Mission 1. See `requirements.md` and `design.md` for what it actually specifies.

If ENSIM ever adopts BFO/CCO per the Section 12 decision, `design.md` §9 (D-1 through D-5) and §10 (OD-1 through OD-4) are the design decisions and open questions to reconcile with ENSIM's own choices rather than duplicate independently.
