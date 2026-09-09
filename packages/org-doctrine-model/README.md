# org-doctrine-model

The foundation package (Section 6 of `docs/architecture/ARCHITECTURE.md`). Every other ENSIM package depends on this one — it is built first.

## Contents

`schema/` — JSON Schema (2020-12) definitions for eight entity types: `Organization`, `Role`, `C2Node`, `DoctrineProcess`, `Mission` (the org/doctrine hierarchy), plus `System`, `Interaction`, and `Decision` (the mission execution interaction network — personnel and equipment as nodes, who/what interacts with who/what and how, and the choice points a Role actually has to make, at a finer grain than `DoctrineProcess`'s organizational tasking flow). Shared definitions live in `common.schema.json`, including the `doctrineSource` citation object required on every record and the `participant` reference (`{kind, id}`, where `kind` is `role`/`c2node`/`organization`/`system`) that `Interaction.from`/`.to` and `Decision.informedBy` all use. `Role` also has an optional `training` field (formal qualification pipeline) — populated for the Loadmaster so far, not retroactively filled in for every role.

`data/` — the USAF seed dataset: `organizations.json` (9 records), `roles.json` (13 records), `c2nodes.json` (10 records), `doctrine-processes.json`, `systems.json` (9 records), `interactions.json` (24 records), `decisions.json` (6 records: 4 for `loadmaster`, 2 for `flight-nurse-medical-crew-director`), and `data/missions/` (three missions: `001-hickam-luzon-airdrop.json`, `002-c5isr-airdrop.json`, `003-luzon-aeromedical-evacuation.json`). `systems.json`/`interactions.json`/`decisions.json` are structural, not mission-scoped — a role or system's interactions/decisions accumulate across every mission that uses it, which is why the Loadmaster's page in `model-explorer` shows both Mission 1's and Mission 2's records together.

Mission 1 (Hickam-Luzon CDS Airdrop) models the tasked C-17 crew, Air Traffic Control, the Drop Zone Support Team Leader, and the Mission Commander, interacting with each other and with representative systems: the aircraft, an identity/access-control system, the CDS airdrop release mechanism, and two distinct communications systems (a UHF/VHF voice radio net used only for safety-of-flight traffic, and a separate ATAK-class digital situational-awareness capability flagged as plausible-but-unconfirmed for this specific mission type). The Loadmaster's Mission 1 record is the most fully modeled: information inputs (`Interaction` records with `interactionType: "Informs"`), decisions (e.g. release execution gated on the Aircraft Commander's verbal command), the specific DZST-to-aircraft-to-Loadmaster relay chain and its radio doctrine (limited to safety-of-flight traffic, mandatory for IMC/AWADS drops — see `dz-safety-of-flight-radio-net`), and identity/access-control interactions (`AuthenticatesTo` the representative ICAM system for weight-and-balance/load-planning tools) — plus real training-pipeline research (`roles.json`'s `training` field: the 344th Training Squadron initial course and Altus AFB C-17-specific qualification).

Mission 2 (C5ISR Airdrop) is a fictionalized companion mission supporting the same relief effort: instead of CDS bundles, the tasked crew air-launches long-endurance ISR/comms-relay UAVs using a Rapid Dragon-class palletized-effects deployment system (`rapid-dragon-palletized-effects-system`, type `AirdropMechanism`), forming a distributed sensor network (`long-endurance-isr-uav`, type `Aircraft`, deliberately generic per AGENTS.md Section 3). The drop-zone coordination role is a TOC-L (Tactical Operations Center-Light) — a real, current (2025) USAF portable C2/sensor-fusion kit, modeled as both a `C2Node` (`toc-l`) and a `Role` (`toc-l-coordinator`) — which produces the UAV flight plan and issues launch instructions to the Loadmaster (`Informs`, `CoordinatesWith`), who then verifies pallet configuration against that flight plan before release (`decisions.json`'s `loadmaster-uav-pallet-configuration-verification`). Every claim distinguishes what's real and documented (TOC-L's data-fusion role; Rapid Dragon/AFRL's own public statements that Palletized Effects is expanding to ISR platforms and humanitarian aid) from what's this mission's own fictional extension (TOC-L producing UAV flight plans specifically; the UAV platform's specific characterization) — see each record's `doctrineSource.note`.

Mission 3 (Luzon Aeromedical Evacuation) is a different kind of variant: instead of cargo or UAVs, the tasked aircraft evacuates injured disaster-relief personnel and casualties to a higher level of care, exercising the Mission schema's new optional `patients` field (a sibling to `cargo`, added for this mission — `cargo` and Missions 1-2 are untouched) and a new System `type`, `MedicalEquipment`. New entities: the 18th Aeromedical Evacuation Squadron (`18th-aeromedical-evacuation-squadron`, real — the sole AE unit in INDOPACOM, Kadena AB) and USTRANSCOM (`ustranscom`), a Theater Patient Movement Requirements Center `C2Node` (`tpmrc`) that validates Patient Movement Requests and coordinates with the Flight Nurse/Medical Crew Director (`flight-nurse-medical-crew-director`) and Aeromedical Evacuation Technician (`aeromedical-evacuation-technician`) roles — the AE mission's analogues to the Loadmaster and the TOC-L Coordinator. The MCD's decisions (`decisions.json`'s `mcd-inflight-patient-status-decision` and `mcd-manifest-verification`) are grounded in real NATO/STANAG patient precedence categories (Urgent/Urgent-Surg/Priority/Routine/Convenience) and patient types (Litter/Ambulatory). No new `interactionType` was needed — `Operates`, `Informs`, and `CoordinatesWith` all carried over from Missions 1-2.

## Rules for adding or editing data

Every record needs a `doctrineSource` citing a real, unclassified publication. If a fact can't be verified, add it anyway but note the gap in the citation's `note` field rather than omitting the citation or guessing — see `pacaf-theater-aoc` in `organizations.json` for an example (the AOC construct is confirmed doctrine; the specific numbered-AOC designation is flagged as unverified). This mirrors the AGENTS.md convention at the repo root.

Two variants of that same discipline, both used in this dataset: (1) an official publication cited but its exact section number not independently verified because the primary source (`static.e-publishing.af.mil` or any other `.mil` domain) is network-blocked from this development environment — e.g. `air-traffic-controller`, `drop-zone-support-team-leader`; (2) a non-official secondary source (an enthusiast/educational site, not a government publication) cited for a specific procedural detail with no accessible official source, explicitly flagged as such rather than presented as doctrine — e.g. the `loadmaster-release-execution` Decision's citation of c17pilot.com. Both are honest about what's actually verified; neither omits the citation or silently upgrades a secondary source into an official one.

## Validate

```
npm install
npm run validate
```

This checks every record in `data/` against its schema using ajv. Run it after any edit to `data/` or `schema/`.

## Types

`types/` holds TypeScript interfaces generated from `schema/` — never hand-write a type here or elsewhere that duplicates a schema (AGENTS.md Section 5). Consumers (e.g. `apps/model-explorer`) import them as `@ensim/org-doctrine-model` or `@ensim/org-doctrine-model/types`. Regenerate after any schema change:

```
npm run generate-types
```
