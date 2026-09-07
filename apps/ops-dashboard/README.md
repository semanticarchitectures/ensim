# ops-dashboard

Process/status view of a mission's C2 tasking sequence — see `docs/architecture/ARCHITECTURE.md` Section 10.

## Scope: static reader, no live connection

Reads `c2-interfaces`' message data and `sim-services`' `RunResult` output directly as static JSON — same pattern as `apps/model-explorer`, no backend, no live subscription to a running federation. "For a running federation" (the phrase Section 10 uses) is a genuine v2 target — it would need a bridge server around `federation-kernel`'s stdio protocol that doesn't exist yet — deliberately deferred rather than built speculatively now.

## What it shows, per mission

- **ATO state** — the latest `ATOLine` message, if any: tasked unit, tasking summary, effective date, who issued it.
- **C2 node hand-offs** — every `c2-interfaces` message for the mission (`TaskingRequest` → `ValidationRecord` → `ATOLine` → `ExecutionStatus` → `MissionReport`), in chronological order, with the producing role/C2-node/organization resolved to a real name via `org-doctrine-model` (falls back to "External / not tracked" for messages with no `producedBy`, e.g. the initial host-nation request).
- **Mission timeline** — the latest `sim-services` `RunResult`'s executed steps, if a run exists.

This is a different lens than `model-explorer`'s Mission detail page: `model-explorer` is an entity browser (org/doctrine data first, mission results as one entity type among five); `ops-dashboard` is one page per mission focused specifically on the C2 message flow and process state.

## Development

```
npm install   # from repo root
npm run dev --workspace=@ensim/ops-dashboard
npm run typecheck --workspace=@ensim/ops-dashboard
```

## Status

Built and verified against real Mission 1 data (`c2-interfaces`' 7 example messages, the committed `sim-services` run) — correct actor-name resolution, correct chronological ordering, zero console errors.
