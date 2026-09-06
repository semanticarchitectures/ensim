# federation-kernel

Java module wrapping Portico (HLA RTI). This is the **only** Java package in the monorepo — everything else is TypeScript (see `docs/architecture/tech-stack.md`).

## Before building

Run `scripts/setup-portico.sh` to vendor Portico 2.1.4 into `vendor/maven-repo` — the release is pinned and the script runs unattended now (see `docs/architecture/portico-setup.md` for how the pin was confirmed against the live repo). `pom.xml`'s `portico.version` is already set to match.

## Role in the architecture

This package is what every other simulation component (org-doctrine-model consumers, mission runners, future study federates) talks to instead of talking to each other directly. It joins the HLA federation via Portico and exposes a narrow JSON-based local interface (stdio or local HTTP/gRPC — not decided yet, not JNI) so the TypeScript packages never need an embedded JVM. See `docs/architecture/ARCHITECTURE.md` Section 4a for why this composition layer matters.

## Status

Scaffold only. No federate implementation yet — this package currently contains build configuration and this README, nothing runnable.
