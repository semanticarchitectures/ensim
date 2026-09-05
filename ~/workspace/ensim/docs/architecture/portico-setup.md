# Portico Setup

**Status:** Documented 2026-08-14. Verified facts are marked; unverified items are marked explicitly rather than guessed.

## Why this needs a doc

Portico (github.com/openlvc/portico) is **not published to Maven Central or any public package registry** — confirmed by web search on 2026-08-14. There is no `mvn install org.openlvc:portico` that just works. It has to be built from source (or obtained as a distribution) and vendored into a local Maven repository. An AI coding tool will not know this unless it's written down, so it's written down here.

## What is verified

- Repository: https://github.com/openlvc/portico
- License: CDDL (Common Distribution and Developer License) — see `LICENSE.portico` in the repo. Modifications to Portico's *own* files must be shared back; code that merely depends on it is not required to be CDDL.
- Supports HLA 1.3, IEEE 1516, and IEEE 1516e, with Java and C++ APIs.
- The project shows real 2025 activity (a milestone of 26 issues closed May 2025), so it is not abandoned.
- No open-source RTI, including Portico, supports IEEE 1516-2025 ("HLA 4") yet — this was already factored into the RTI decision.

## What is NOT verified (confirm before pinning)

GitHub was unreachable from this environment during this session, so the **exact current release tag/version and its download/build instructions could not be directly confirmed**. The last tagged release visible via search was old (`portico-2.0.1`, 2014); given confirmed 2025 issue activity, there is very likely more recent work on `master` that hasn't been cut into a tagged release, or a newer tag this search didn't surface. **Before doing the setup below, check https://github.com/openlvc/portico/tags and the repo's own README/build docs directly, and pin an exact commit hash — do not float on `master`.**

## Setup procedure

1. Clone the repo and check out a specific, pinned commit or tag (not `master`):
   ```
   git clone https://github.com/openlvc/portico.git
   cd portico
   git checkout <pinned-commit-or-tag>   # confirm this exists before use
   ```
2. Build per the repo's own instructions in `codebase/` (historically Ant-based; confirm current build tooling in the repo at setup time, it may have changed).
3. Locate the resulting `portico.jar` (and native libraries under the C++ path, only if `entity-gateway`/DIS work in v2 needs them — not required for Mission 1 v1).
4. Install into a **repo-local** Maven repository so `packages/federation-kernel/pom.xml` can depend on it without touching every developer's global `~/.m2`:
   ```
   mvn deploy:deploy-file \
     -Dfile=portico.jar \
     -DgroupId=org.openlvc -DartifactId=portico -Dversion=<pinned-version> \
     -Dpackaging=jar \
     -Durl=file://$(pwd)/vendor/maven-repo -DrepositoryId=vendor-local
   ```
5. Record the exact commit hash, build date, and license file location in `vendor/portico/PROVENANCE.md` (create this file as part of setup — it does not exist yet).
6. Do not commit the built `.jar` to git unless your org's policy allows vendoring binaries — prefer each developer/CI running `scripts/setup-portico.sh` to build it locally, or use Git LFS if a binary must be committed.

See `scripts/setup-portico.sh` for an automatable skeleton of the above — it has TODOs at the two steps (exact tag, exact build command) that need confirming against the live repo before the script will run unattended.
