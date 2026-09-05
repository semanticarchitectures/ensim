# federation-kernel

Java module wrapping Portico (HLA RTI). This is the **only** Java package in the monorepo — everything else is TypeScript (see `docs/architecture/tech-stack.md`).

## Before building

1. Run `scripts/setup-portico.sh` (after filling in its two TODOs — see `docs/architecture/portico-setup.md`) to vendor Portico into `vendor/maven-repo`.
2. Set `portico.version` in `pom.xml` to the version you actually installed.

## Role in the architecture

This package is what every other simulation component (org-doctrine-model consumers, mission runners, future study federates) talks to instead of talking to each other directly. It joins the HLA federation via Portico and exposes a narrow JSON-based local interface (stdio or local HTTP/gRPC — not decided yet, not JNI) so the TypeScript packages never need an embedded JVM. See `docs/architecture/ARCHITECTURE.md` Section 4a for why this composition layer matters.

## Status

Scaffold only. No federate implementation yet — this package currently contains build configuration and this README, nothing runnable.
