# Tech Stack Decision

**Status:** Decided 2026-08-14

## Decision

**TypeScript / Node.js 20+** for every package except the federation kernel: `org-doctrine-model`, `c2-interfaces`, `sim-services`, `apps/ops-dashboard`, `apps/mission-planner`, and `tools/ai-agents`.

**Java 17+ (Maven)** for `packages/federation-kernel` only, because Portico's only supported language bindings are Java and C++, and Java has the more modern, better-documented build path of the two (see `portico-setup.md`).

**Monorepo tooling:** pnpm workspaces (`packages/*`, `apps/*`) for the TypeScript side. The Java module is *not* forced into the same package manager — a monorepo means one repo and coordinated builds, not one build tool. A root `Justfile` wires `pnpm` and `mvn` together (`just build`, `just test`, `just dev`) so a single command works across both.

**Data/message format:** JSON everywhere (decided previously), validated against JSON Schema (2020-12) using `ajv` on the TypeScript side. `federation-kernel` uses Jackson on the Java side to map the same JSON shapes to typed objects only at the point where Portico's API requires them — the canonical schema still lives in `packages/org-doctrine-model/schema`, not duplicated as Java POJOs by hand.

**Bridge between `federation-kernel` (Java) and everything else (TypeScript):** a narrow local interface — JSON over stdio or a local HTTP/gRPC endpoint — not JNI. This keeps the JVM contained to one package instead of embedding it in every process that needs federation access.

## Rationale

Schema-first JSON workflows (ajv, zod, json-schema-to-typescript) are well-supported in TypeScript and it's the ecosystem AI coding tools generate most reliably against for this kind of schema/UI/service work. Java is only pulled in because Portico requires it — isolating that to one package keeps the "AI-generated monorepo" surface area mostly single-language.

## Alternatives considered and rejected

A full Java monorepo was rejected: Java is heavier for schema-driven data modeling and UI work, and most of ENSIM isn't federation logic. Python bridging to the Java Portico jar via JPype/Py4J was rejected: it adds a fragile cross-runtime bridge for no benefit, since Portico already has a native Java API.

## Open item

pnpm + Maven is a reasonable pairing but hasn't been validated end-to-end with a real `just build` yet. Treat this as the plan going into the first build, not a proven CI pipeline.
