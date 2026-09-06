# Portico Setup

**Status:** Pinned and confirmed against the live repo 2026-09-06. The two TODOs that previously blocked `scripts/setup-portico.sh` (exact release, build/vendor method) are resolved below.

## Why this needs a doc

Portico (github.com/openlvc/portico) is **not published to Maven Central or any public package registry** — re-confirmed 2026-09-06 via `search.maven.org` (zero results for group `org.openlvc`). There is no `mvn install org.openlvc:portico` that just works. It has to be obtained as a distribution (or built from source) and vendored into a local Maven repository. An AI coding tool will not know this unless it's written down, so it's written down here.

## What is verified (2026-09-06, via the GitHub API against the live repo)

- Repository: https://github.com/openlvc/portico, default branch `master`, not archived.
- **Pinned release: `portico-2.1.4`**, tag commit `337d309d949774c594cf12d3ff1109659dfc0825`, tagged 2026-03-02. This supersedes the 2026-08-14 session's assumption that the last tag was the 2014 `portico-2.0.1` — that was a stale search result, not the actual repo state. Full tag history, newest first: `portico-2.1.4` (2026-03-02), `portico-2.1.3` (2025-05-04), `portico-2.1.0` (2016-05-04), `portico-2.0.3`, `portico-2.0.2` (2015-12-30), `portico-2.0.1`, `portico-2.0.0`. The project is actively maintained — `pushed_at` on the repo is 2026-03-02, matching the latest tag.
- License: **CDDL** (Common Distribution and Developer License v1.0). Confirmed both in the repo's `README.md` and in `codebase/LICENSE.portico` at the pinned tag. Modifications to Portico's own files must be shared back; code that merely depends on it (federation-kernel) is not required to be CDDL.
- Minimum Java version: **11** (per README "Getting Started" — federation-kernel's `pom.xml` already targets 17, which satisfies this).
- Supports HLA 1.3, IEEE 1516, and IEEE 1516e, with Java and C++ APIs. No open-source RTI, including Portico, supports IEEE 1516-2025 ("HLA 4") yet — already factored into the RTI decision (ARCHITECTURE.md Section 4a).
- Build tooling at `codebase/`: still **Ant** (`build.xml`, `ant`/`ant.bat` wrapper) — confirmed unchanged from the 2026-08-14 assumption, not migrated to Maven/Gradle.
- Pre-built binaries **are** published as GitHub release assets for `portico-2.1.4`: `portico-2.1.4-linux64.tar.gz`, `-win32.exe`, `-win64.exe`. **No macOS asset exists.**

## Recommended vendoring method: extract the jar, don't build from source

`portico.jar` (the piece `federation-kernel` actually depends on) is plain Java bytecode — platform-independent. The native libraries in the release archives (`lib/gcc8` for Linux, `vc14_3` DLLs for Windows) are only needed for **C++** federates, which is out of scope per `tech-stack.md` (federation-kernel is Java-only; Portico's C++ API is never used here). That means:

- Building from source via the Ant `codebase/` build is **not required** just to get `portico.jar`.
- The `linux64` release asset can be used as the extraction source **regardless of the developer's own OS** (including macOS) — only `lib/portico.jar` is taken from it, nothing platform-specific.
- This avoids requiring an Ant toolchain and a from-source Portico build merely to obtain a dependency jar.

Building from source remains documented as a fallback (e.g., if a future need for the native C++ interface arises for `entity-gateway` in v2) — see "Fallback: build from source" below.

## Setup procedure (pre-built jar extraction — default)

1. Download the pinned release asset and verify it, don't float on `master` or `latest`:
   ```
   curl -fsSL -o portico-2.1.4-linux64.tar.gz \
     https://github.com/openlvc/portico/releases/download/portico-2.1.4/portico-2.1.4-linux64.tar.gz
   ```
2. Extract only `lib/portico.jar` from the archive.
3. Install into a **repo-local** Maven repository so `packages/federation-kernel/pom.xml` can depend on it without touching every developer's global `~/.m2`:
   ```
   mvn deploy:deploy-file \
     -Dfile=portico.jar \
     -DgroupId=org.openlvc -DartifactId=portico -Dversion=2.1.4 \
     -Dpackaging=jar \
     -Durl=file://$(pwd)/vendor/maven-repo -DrepositoryId=vendor-local
   ```
4. Record the exact tag, commit hash, download date, archive SHA-256, and license file location in `vendor/portico/PROVENANCE.md` (created by `scripts/setup-portico.sh`).
5. Do not commit the downloaded archive or the built `.jar` to git — `vendor/` is gitignored (see repo root `.gitignore`). Each developer/CI runs `scripts/setup-portico.sh` locally instead.

`scripts/setup-portico.sh` automates steps 1–4 above and is no longer a skeleton — it runs unattended now that the tag is pinned.

## Fallback: build from source (only if the native C++ interface is ever needed)

1. Clone and check out the pinned tag:
   ```
   git clone https://github.com/openlvc/portico.git
   cd portico
   git checkout portico-2.1.4
   ```
2. Build via the Ant wrapper in `codebase/`: `cd codebase && ./ant` (see `codebase/build.xml` for targets; not exercised as part of this pass — confirm the exact target name before relying on it).
3. Locate the resulting `portico.jar` plus native libraries under the C++ path, and proceed from step 3 of the setup procedure above.
