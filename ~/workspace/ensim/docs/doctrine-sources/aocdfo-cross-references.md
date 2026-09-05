# Cross-references from AOC-DFO and GMNS (2026-09-05, updated same day)

**Provenance note:** this file started from a shared Claude chat transcript on a different Anthropic account (a project referred to as **AOC-DFO**), which was secondhand and unverified. Kevin then uploaded the actual AOC-DFO spec files (`requirements.md`, `design.md`, `tasks.md`, `corpus-registry.yaml` — now in `docs/external/aocdfo/`), and this ENSIM session fetched and read **AFMAN 13-1AOC Vol 3** directly from `https://static.e-publishing.af.mil/production/1/af_a3/publication/afman13-1aocv3/afman13-1aocv3_.pdf`. Everything below marked "confirmed firsthand" reflects that direct read. Anything still marked as relayed/unverified has not been independently checked.

## What AOC-DFO is

A separate project (not part of this monorepo) building a BFO/CCO ontology of USAF Air Operations Center data flows: every message into, out of, and within the AOC modeled as a typed Information Bearing Entity, mapped to Common Core Ontology (CCO) classes, with SHACL shapes, competency-question validation, and a tiered, provenance-tracked source corpus (37 sources at last count). It uses the Kiro spec format (requirements.md/design.md/tasks.md with EARS acceptance criteria).

This overlaps with ENSIM's `org-doctrine-model` more than it first appears — AOC-DFO's "doctrine layer" (Organization/Role/Act/Directive as CCO classes) is modeling the same real-world thing as ENSIM's `Organization`/`Role`/`C2Node`/`DoctrineProcess` JSON Schema entities, just with a heavier, ontology-first methodology. See Section 12 of `ARCHITECTURE.md` for the resulting open decision.

## GMNS is bigger than what this repo has seen directly

Two other local sessions on this Mac ("Global Mobile Network Sim SISO integration" and "Global Mobile Network data layer plan") showed GMNS as a MATLAB discrete-event network/ICAM/security simulation. The AOC-DFO chat reveals GMNS also has its own BFO/CCO ontology (`gmns.ttl`, `gmns-shapes.ttl`, `ontology-conformance-spec.md`) and **a Kiro spec underway to port GMNS from MATLAB to Python**, with amendments for a uv-workspace monorepo layout and for demoting the MATLAB version to a frozen comparison baseline.

This is relevant to ENSIM's federation plans (see the earlier conversation about GMNS as a network-layer HLA federate): a Python GMNS is a much easier integration target than a MATLAB one. ENSIM's `federation-kernel` boundary is already designed as JSON-over-stdio/HTTP rather than JNI (`docs/architecture/tech-stack.md`), which is a natural fit for a Python peer — no MATLAB↔Java bridge needed if the port completes.

## Doctrine citations to verify/add

Not yet in ENSIM's dataset, but relevant if `org-doctrine-model` grows into targeting/ISR territory: **AFDP 3-60** (Targeting, reported dated 1 May 2026), **AFDP 3-52** (reported dated 26 Sep 2025), and **JP 2-01 retired in favor of JP 2-0**. ENSIM's existing AFDP 3-0.1 citation (superseding AFDP 3-30) matches what the AOC-DFO research independently found — worth treating as cross-validation, not just a coincidence.

**AFMAN 13-1AOC Vol 3** (25 Jun 2024, no releasability restrictions, "Operational Procedures—Air Operations Center (AOC)/Operations Center (OC)") has now been fetched and read directly (confirmed firsthand). It gives the real internal AOC division structure — five divisions, not the "IRD" abbreviation guessed from a Vol 2 reference in the secondhand chat:

- **Strategy Division (SRD)** — long-range/near-term strategy guidance; produces JAOP, AOD, operational assessment report (§2.3.4)
- **Combat Plans Division (CPD)** — near-term planning (≤48h before ATO execution); **builds** the ATO/ATONEWS, ACO, ACP, JIPTL, SPINS (§2.3.5)
- **Combat Operations Division (COD)** — **executes** the current ATO/ACO during its 24-hour execution window (§2.3.6)
- **Intelligence, Surveillance, and Reconnaissance Division (ISRD)** — not "IRD"; assesses adversary activity, plans ISR ops, dynamic targeting (§2.3.7)
- **Air Mobility Division (AMD)** — plans/coordinates/tasks/executes air mobility missions in a process parallel to and integrated with the main ATO cycle; coordinates intertheater airlift directly with the **618 AOC/TACC** (§2.3.8)

This directly confirmed and corrected ENSIM's data: the `combat-operations-division-duty-officer` role previously (incorrectly) described COD as building the ATO — that's CPD's job. Both roles, the `ato-cycle` process, and the HA/DR flow's tasking step were corrected on 2026-09-05 (see `roles.json`, `c2nodes.json`, `doctrine-processes.json`). The AMD confirmation also resolved which C2Node should actually own DIRMOBFOR and Mission 1's airlift tasking — it's AMD, not the generic placeholder node ENSIM had been using.

This is a genuinely useful, unprompted validation of the AOC-DFO project's own methodology, incidentally: its corpus registry flagged this exact document as "the single richest Tier 1 source... ingest first," and that held up under direct verification.

## KRADOS reference (for the future `c2-interfaces` package)

Per the other session's research (Kessel Run public releases, not independently verified here), KRADOS is Kessel Run's AOC Block 20 backbone, comprising nine apps:

| App | Function |
|---|---|
| Slapshot | Builds the MAAP (Master Air Attack Plan) |
| Triton | Consumes the other apps' output to generate the ATO |
| Spacer | Airspace management — coordinates and deconflicts airspace |
| Jigsaw | Tanker planning |
| Mai Tai | Asset availability |
| KRID | Authentication (not a data-flow transport — attaches as a system property, not a flow) |
| Rebel Alliance | Inter-app eventing (internal plumbing, not a data-flow transport) |
| Skyhook | Unknown — no public description found |
| Direct | Unknown — no public description found |

TBMCS remains, per Kessel Run's own public material, the system of record for force-level theater battle management and ATO/ACO generation/dissemination/execution, with KRADOS positioned as its successor. This is exactly the kind of public, unclassified, named-system detail ENSIM's Section 3 principle ("interfaces are representative, not classified-replica") calls for — it's a much more concrete reference set for `c2-interfaces` than the generic Open-Arsenal UCI/OMS design philosophy currently cited in Section 5, and it's specific to the tasking/ATO function that `aoc-tasking-node` already models.
