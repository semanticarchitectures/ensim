# federation-kernel

Java module wrapping Portico (HLA RTI). This is the **only** Java package in the monorepo — everything else is TypeScript (see `docs/architecture/tech-stack.md`).

## Before building

Run `scripts/setup-portico.sh` to vendor Portico 2.1.4 into `vendor/maven-repo` — the release is pinned and the script runs unattended now (see `docs/architecture/portico-setup.md` for how the pin was confirmed against the live repo). `pom.xml`'s `portico.version` is already set to match.

## Role in the architecture

This package is what every other simulation component (org-doctrine-model consumers, mission runners, future study federates) talks to instead of talking to each other directly. It joins the HLA federation via Portico and exposes a narrow JSON-over-stdio local interface so the TypeScript packages never need an embedded JVM. See `docs/architecture/ARCHITECTURE.md` Section 4a for why this composition layer matters.

## What's implemented

`OrgDoctrineFederate` is a minimal federate that connects to Portico, creates/joins the `org-doctrine-model` federation using the FOM at `standards/hla-fom/org-doctrine-model.xml`, and can publish and subscribe org-doctrine-model records as HLA object instances. It deliberately does **not** implement time management or synchronization points — Mission 1 v1 is a discrete-event simulation intended to be driven by `sim-services` (not built yet), not by this federate.

`StdioBridge` is the JSON-over-stdio entry point (`dev.ensim.federationkernel.StdioBridge`, packaged as the runnable jar's main class via `mvn package`). One JSON object per line in, one per line out:

```
in:  {"cmd":"connect","federationName":"...","federateName":"..."}
in:  {"cmd":"publish","entityType":"Organization","entityId":"pacaf","record":{...}}
in:  {"cmd":"subscribe"}
in:  {"cmd":"tick","timeoutSeconds":0.5}
in:  {"cmd":"resign"}
out: {"cmd":"...","ok":true,...}
out: {"cmd":"...","ok":false,"error":"..."}
```

`tick` additionally returns `"records": [{"entityId":...,"entityType":...,"record":{...}}, ...]` for anything reflected from other federates since the previous tick. Run it directly with `java -jar target/federation-kernel-0.1.0-SNAPSHOT.jar` after `mvn package`.

The FOM (`standards/hla-fom/org-doctrine-model.xml`) carries every org-doctrine-model record as a single `Record` object instance with three attributes — `EntityId`, `EntityType`, `RecordJson` (the record's full JSON payload). It's deliberately *not* modeled attribute-by-attribute per entity type: that would duplicate `packages/org-doctrine-model/schema` as a second, hand-maintained type definition, exactly what AGENTS.md Section 5 warns against. The JSON Schema stays the one canonical definition of what a record contains; this FOM only changes if a new *entity type* is added.

## Operational notes (both found empirically against portico-2.1.4, see git history for the debugging trail)

- **Stagger federate startup.** A federate that creates a fresh federation should settle for a few seconds before another federate joins it. Two federates calling `connect`/`create`/`join` at nearly the same instant can trigger a `NullPointerException` deep in Portico's own JGroups coordinator (`Manifest.federateJoined`) trying to reconcile which federate is the coordinator. Not a bug in this package's code — a real Portico race condition. `CrossFederatePublishSubscribeTest` encodes a working stagger (~3s) as a template.
- **Subscribing doesn't replay history.** Standard HLA semantics, not a bug: a federate that subscribes to an object class after another federate already published an update only gets a `discoverObjectInstance` callback for the existing instance, not that historical `reflectAttributeValues`. It only receives *future* updates. Subscribe before the data you care about is published.
- **String attributes use plain UTF-8, not Portico's `HLAunicodeString`.** Portico 2.1.4's `HLAunicodeString` encode/decode round-trip is broken — confirmed by `EncodingRoundTripTest`, which decodes to an empty string even in a pure in-process test with no federation or network involved at all, via both the `decode(byte[])` and `decode(ByteWrapper)` entry points. Since both ends of every string attribute here are this package's own code, standards-compliant wire format isn't required — only round-trip correctness — so `OrgDoctrineFederate.encodeString`/`decodeString` use `String.getBytes(UTF_8)` directly instead.

## Tests

`mvn test` runs `EncodingRoundTripTest` (the UTF-8 codec regression guard) and `CrossFederatePublishSubscribeTest` (launches two real `java -jar` processes over an actual Portico federation and asserts the subscriber correctly reflects the publisher's record). The cross-federate test needs the jar already built — `mvn test` alone on a clean checkout runs before `package` in Maven's default lifecycle, so run `mvn package` once first; the test skips (via `Assumptions.assumeTrue`, not a failure) if the jar isn't there yet.

## Status

Minimal federate implemented and verified: connect, create/join federation, publish, subscribe, receive reflects, resign — proven end-to-end across two separate JVM processes, not just unit-tested in isolation. `sim-services` (the thing that will actually drive this for Mission 1) doesn't exist yet.
