# SYNAPSE Loop Architecture
## Collective Predictive Development — From Stack to Loop

**Document status:** New concept document (v1.0). Supersedes the four-layer stack formalized in `SYNAPSE_ArchitectureDesign.md`, which remains valid as the historical record of the prior architecture and of the two-value framework it established.

**Scope:** NV-2026 Vehicle Development Intelligence Portal (SYNAPSE). This document defines the revised conceptual architecture resulting from (1) the critical cross-industry re-examination (game pipelines, VFX/USD, shipbuilding, medical devices, defense/MBSE, urban twins, F1, CERN), and (2) the adoption of the Collective Predictive Coding (CPC) hypothesis and Metropolis–Hastings naming game (MHNG) as the theoretical basis for consensus formation.

---

## 0. Executive Summary

SYNAPSE is redefined from a **four-layer stack** to a **predictive development loop**: a continuous cycle of *propose → compose → predict → measure error → update*, executed across federated engineering domains.

The prior four layers do not disappear. They are **re-seated as four roles within one loop**, joined by a fifth element that the stack could not express (domain-internal latent models, *z*). The loop is grounded in the CPC generative structure — observations (*o*), domain-internal representations (*z*), and shared external representations (*w*) — which gives the architecture a single mathematical backbone:

> **The anchor is not a 3D model. It is a shared latent variable (*w*), continuously sampled through structured proposal–acceptance dynamics, kept honest by measured divergence from physical reality.**

Four hardening features are built into the loop as first-class structure, not afterthoughts: the **collapse operator** (gates as annealing steps), **staleness decay** (freshness-weighted confidence), **append-only observation wiring** (structural prevention of self-confirming twins), and **role-rotation with acceptance auditing** (protocol-level defense against cadence politics).

---

## 1. Why the Stack Was Superseded

The four-layer stack (Digital Twin / Digital Thread / Gateway / Predictive Risk) served well as a discovery-phase organizing device. Critical re-examination exposed three structural failures:

1. **Layers imply static infrastructure; the findings describe dynamics.** Every surviving insight — "the anchor is constructed through agreement, not discovered," "risk is active correlation management, not an emergent output," "SSOT must be a federation, not a monolith" — describes a *process*, not a *tier*. A stack cannot represent a process that cycles.

2. **The "emergence" premise of Layer 4 failed scrutiny.** F1 correlation practice and ISO 14971 risk-management discipline both show that prediction/risk is never an emergent byproduct of integration; it requires a dedicated owner, a trace structure, and an explicit measurement process. In a loop, this is naturally expressed as the *error signal* — a required step, not a hoped-for output.

3. **The pharma-style Gateway contradicted automotive iteration speed.** The stack froze "Gateway" as a heavyweight tier. The loop re-expresses gating as *cadence and temperature* of the consensus process (§5), which cleanly accommodates daily integration gates, milestone reviews, and irreversibility deadlines within one formalism.

The stack's genuine virtue — communicating build order to management — is preserved by the **maturity spiral** (§7), which replaces "build layer N" with "close loop iteration N at higher fidelity."

---

## 2. Theoretical Backbone: The CPC Generative Structure

CPC (Taniguchi, 2024) models symbol emergence as decentralized Bayesian inference over a shared latent variable. Mapped to vehicle development:

| CPC element | SYNAPSE realization | Sovereignty |
|---|---|---|
| **o** — observations | Each domain's private data: CAD geometry, test results, cost actuals, styling intent, supplier data | Domain-owned (federated ASoT; System of Record per domain) |
| **z** — internal representations | Each domain's interpretive models: CAE models, styling interpretation frameworks, cost models, tacit expertise | Domain-private; only its *predictions* are shared |
| **w** — shared external representations | The anchor complex: persistent IDs + composition state, living glossary, part classifications (new / carry-over / partially modified), risk severities, schema conventions | Collectively sampled; no single domain owns *w* |

**Consensus, formally:** agreement on *w* is not unanimity on a single value. It is sampling from the *joint posterior* over *w* conditioned on all domains' observations. This licenses **multimodal consensus** — stable coexistence of multiple interpretations — as a healthy state *until* an irreversibility deadline forces collapse (§5.2).

**The anchor, formally:** the clickable 3D vehicle model is one *rendering* of *w*, not *w* itself. Anchor identity across phases (concept sketch → class-A surface → production CAD) is carried by persistent IDs plus USD-style composition discipline (non-destructive overrides, variants for carry-over/modified parts), and is *renegotiated* — the living anchor — through the same proposal–acceptance dynamics that govern every other component of *w*.

---

## 3. The Loop

```
        ┌──────────────────────────────────────────────────┐
        │                                                  │
        ▼                                                  │
   [ o: Federated Observation Plane ]                      │
        │  domains observe (test, measure, cost, style)    │
        ▼                                                  │
   [ z: Domain Latent Models ]                             │
        │  each domain interprets o through its own z      │
        ▼                                                  │
   [ Consensus Dynamics: propose / accept ]                │
        │  MHNG-style rounds update w                      │
        ▼                                                  │
   [ w: Shared Representation Plane ]                      │
        │  anchor complex renders; predictions generated   │
        ▼                                                  │
   [ Error Signal: Correlation Governance ]                │
        │  divergence(prediction, physical reality)        │
        └── error drives new proposals; NEVER rewrites o ──┘
```

One cycle: **propose → compose → predict → measure error → update.** Genchi Genbutsu (現地現物) is not a cultural obstacle to the digital twin — it *is* the observation step of the loop, the sole source of the error signal that keeps *w* honest. This resolves the cultural tension by construction rather than by persuasion.

---

## 4. The Five Elements

### 4.1 Federated Observation Plane (*o*) — 「観測」
*Plain name: the measurements.*

- Every domain's raw data remains in that domain's System of Record. SYNAPSE federates; it does not centralize. (MITRE ASoT doctrine: an authoritative source of truth is a federation of models, not one artifact.)
- **Wiring rule (hardening #3): *o* is append-only.** No path exists by which *w*, predictions, or error signals modify recorded observations. Write-back from *w* may generate *new proposals* and *new work orders* — never retroactive edits to what was observed. This structurally prevents the self-confirming twin, in which reality's record drifts toward the prediction.
- Provenance — which observation grounded which opinion on *w* — lives here. This is the re-seated Digital Thread: traceability is the audit trail of the loop, not a separate tier.

### 4.2 Domain Latent Models (*z*) — 「解釈」
*Plain name: each team's own model of the world.*

The stack had no place for *z*; the loop makes it explicit because it enables **disagreement diagnostics**:

- If two domains disagree on a *w* component, the loop distinguishes **o-divergence** (they are looking at different data → remedy: share or align observations) from **z-divergence** (they interpret the same data differently → remedy: correlation work on interpretive models, or accept multimodal *w* until collapse deadline).
- *z* is never shared or centralized. Only each domain's *predictions* (outputs of *z*) enter the loop. This preserves the boundary-object property (境界オブジェクト): weakly structured in common use, strongly structured in local use — the anchor must not over-constrain local interpretation.
- Supplier boundary design maps here: an external supplier is a domain whose *z* is maximally opaque and whose participation in consensus dynamics is contract-scoped.

### 4.3 Shared Representation Plane (*w*) — 「共通図」
*Plain name: what we have agreed to call things.*

The anchor's new home. Contents:

- **Persistent ID registry** — identity across phase transitions, with USD-style composition arcs (reference / variant / override) expressing carry-over, partial modification, and phase-specific opinion layers.
- **Living glossary** — cross-domain terminology with confidence scores (first PoC target).
- **Part classification state** — new / carry-over / partially modified, with verification-scope consequences attached.
- **Risk severity assignments** — jointly calibrated (§4.5).
- **Cross-domain schema conventions** — the ACES-analogue: agreed transforms and metadata handoffs between domains.
- **Confidence metadata per component (hardening #2):** every *w* component carries (a) a consensus-strength score derived from acceptance dynamics, and (b) a **staleness decay** term — confidence decays with time since last physical grounding. Digital predictions flow continuously; physical observations arrive in bursts. Without decay, *w* drifts confidently between prototype checkpoints. Staleness makes the value of Genchi Genbutsu *quantitative*: a physical check is precisely the act that resets decay.

### 4.4 Consensus Dynamics — 「合意の回し方」
*Plain name: how agreement is reached and recorded.*

The re-seated Gateway, generalized: **a family of proposal–acceptance protocols, differentiated by cadence and temperature.**

- **Protocol core (MHNG-derived):** a proposing domain samples a candidate (term, classification, ID mapping, severity) from its own posterior; an accepting domain accepts with probability grounded in how well the proposal predicts *its own* observations. Acceptance grounding must be **auditable** — document-predictive likelihood for terminology, historical prediction accuracy for risk severity — not self-reported willingness. This is the incentive-compatibility layer MHNG itself lacks.
- **Cadences:**
  - *Daily integration rounds* — high-frequency, low-cost sampling on active *w* components (game-dev trunk discipline: broken composition is everyone's blocker).
  - *Milestone reviews* — high-density rounds concentrating many proposals; human judgment central.
  - *Phase-transition negotiation* — the living-anchor renegotiation: structured rounds mapping persistent IDs onto new geometry, replacing ad-hoc meetings.
  - *External certification* — gatekeepers (type approval, regulatory) enter as domains with veto-weighted acceptance; parallel work below the gate proceeds (shipbuilding lesson).
- **Hardening #4 — protocol hygiene:** speaker/listener roles rotate as a protocol requirement; every proposal and acceptance is logged. **Acceptance-rate distributions are a loop health metric:** rates pinned near 1.0 or 0.0 indicate the mechanism has died into ritual (rubber-stamping or stonewalling), i.e., cadence politics has captured the agenda.
- **Cultural framing:** this is nemawashi (根回し), made visible and accelerated — not replaced. Adoption is won by value proposition (faster approvals, less rework), never by mandate (CERN lesson).

### 4.5 Error Signal: Correlation Governance — 「答え合わせ」
*Plain name: how far the predictions were from reality.*

The re-seated Layer 4, stripped of the "emergence" premise:

- A dedicated, owned process that measures **divergence between *w*-generated predictions and physical observations** (F1 correlation discipline: the transfer function between CFD / bench / prototype / vehicle is a managed artifact).
- Maintains the **risk trace matrix** (ISO 14971 analogue): every identified divergence traced to its *w* components, its proposals, and its mitigations.
- Feeds two things back into the loop: (1) new proposals (error → renegotiation of the affected *w* components), and (2) **historical prediction accuracy per domain**, which becomes the auditable acceptance weight in risk-severity consensus (§4.4) — closing the incentive gap with data rather than trust.
- Never writes to *o* (§4.1). The error signal changes *w* and future work; it does not change the record of what was measured.

---

## 5. The Collapse Operator — Gates as Annealing

The single most consequential hardening. It answers both "when must multimodal consensus end?" and "what is a gate, really?"

### 5.1 The problem
Multimodal consensus (§2) is healthy for glossaries and early-phase geometry. It is fatal for a released BOM. Two coexisting interpretations of a part classification cannot enter production. Manufacturing is a domain of forced unimodality.

### 5.2 The operator
- Certain *w* components carry an **irreversibility deadline**: tooling orders, homologation submissions, supplier contract locks, SOP itself.
- As the deadline approaches, the consensus protocol for that component **lowers its temperature**: acceptance thresholds tighten, proposal scope narrows, and the multimodal posterior is forced to collapse to a single mode by the deadline.
- **A gate is therefore redefined as an annealing step:** a scheduled, owned event that collapses the consensus distribution on a declared set of *w* components. Before the gate: exploration is legitimate (Toyota set-based concurrent engineering — keep the solution set wide while uncertainty is high). At the gate: collapse is mandatory and recorded. After the gate: reopening a collapsed component is an explicit, costed act (engineering change), not a drift.

### 5.3 What this resolves
- The pharma-gate critique, finally and precisely: pharma gates were wrong for automotive not because gates are wrong, but because they collapsed *everything* at *few* points. The loop collapses *each component* at *its own* irreversibility deadline — many small annealing events, few large ones.
- SBCE and gating cease to conflict: set-based exploration is simply the high-temperature regime; the gate is the cooling schedule.
- Carry-over classification gets a natural semantics: a carry-over part is a *w* component that enters the program *already collapsed*, and "partially modified" means selectively re-heating specific variant axes.

### 5.4 Carry-Over Parts: Pre-Collapsed Entrants and the Collapse Certificate

Carry-over parts (流用部品) extend the collapse operator across program generations: a carry-over part is a *w* component that was **annealed and collapsed in a predecessor program's loop**, entering the current loop already frozen. Its "death" did not occur here; it occurred in a prior generation's cycle. Three consequences follow:

- **Dual character.** In evidentiary terms, a carry-over part is the *most physically grounded* component of the anchor — it carries years of production, field, and quality error signals. In collapse terms, it is the *most frozen*. Carry-over risk is precisely the conflation of these two: mistaking richness of evidence for contextual validity. The part hasn't changed; the world conditioning its collapse (load cases, packaging, regulation, EV-specific environment) has. In staleness terms, a carry-over part can be simultaneously *evidence-fresh and applicability-stale* — a state the per-component staleness metadata (§4.3) must be able to represent.
- **Collapse certificate.** A carry-over part should enter the program carrying not only geometry and BOM linkage but a **collapse certificate**: the recorded conditions under which its collapse was frozen — design load assumptions, applicable regulations at freeze time, correlated predictions, supplier process state. Classification then becomes semi-computable as a **differential operation**: zero divergence between old collapse conditions and new program context → carry-over; divergence on specific axes → partially modified (re-heat exactly those axes); broad divergence → treat as new. The new/carry-over/partially-modified taxonomy reduces to a diff over collapse conditions.
- **Fossils.** A frozen component whose collapse conditions were never recorded (or have been lost) is a *fossil*: rigid, but no one can state why. Fossils are the highest-risk re-heat candidates, because reopening them means reconstructing the original collapse rationale from scratch — often under schedule pressure. An inventory of fossils in the carry-over portfolio is itself a risk artifact for Layer-role 5 (correlation governance).

---

## 6. Structural Mapping: Old Four Layers → Loop Roles

| Old layer (stack) | Fate in the loop | What changed |
|---|---|---|
| 1. Digital Twin (visual anchor) | One **rendering of *w*** (§4.3) | Demoted from "the anchor" to "a view of the anchor"; identity carried by persistent IDs + composition, not geometry |
| 2. Digital Thread (traceability) | **Provenance wiring of *o*** + proposal/acceptance audit logs (§4.1, §4.4) | From a tier to the loop's audit trail; append-only |
| 3. Gateway (cross-domain review) | **Consensus Dynamics** cadences + **Collapse Operator** (§4.4, §5) | From heavyweight stage gates to a protocol family with temperature; gates = annealing |
| 4. Predictive Risk Visualization | **Error Signal / Correlation Governance** (§4.5) | From "emergent output" to a required, owned loop step; source of acceptance weights |
| — (absent in stack) | **Domain Latent Models (*z*)** (§4.2) | New: enables o-divergence vs z-divergence diagnostics |

The **two value axes survive intact, re-grounded**: (A) object-anchor navigation = interaction with renderings of *w*; (B) cross-domain state integration = the federated sampling of *w* itself. The loop is what finally explains *why* A and B must co-exist: a rendering with no consensus process behind it is a picture; a consensus process with no shared rendering is a committee.

---

## 7. Maturity Spiral (Roadmap Language)

The loop replaces "build layer N" with "close the loop at fidelity N." Each revolution closes the full cycle on a narrow scope, then widens.

| Revolution | Loop scope | *w* components in play | Collapse events | Exit criterion |
|---|---|---|---|---|
| **R1 — Vocabulary loop** | 2 domains × ~20 contested terms | Living glossary only | None (glossary tolerates multimodality) | Acceptance-grounded consensus beats committee baseline on downstream rework; KL-stability within weekly cadence |
| **R2 — Classification loop** | Carry-over / new / partially-modified for one subsystem | + part classification, verification scope | First soft deadlines (verification planning freeze) | Classification disputes resolved via protocol, not escalation; audit log demonstrably used |
| **R3 — Geometry loop** | Phase transition for one part family | + persistent ID ↔ geometry mapping (living anchor) | ID-mapping collapse at phase gate | Non-destructive phase transition demonstrated (old opinions recoverable) |
| **R4 — Correlation loop** | One digital-physical divergence domain (e.g., NVH or range prediction) | + risk severities, transfer functions | Severity collapse at DR milestones | ≥30 prediction–actual pairs per participating domain; accuracy-weighted acceptance live |
| **R5 — Full loop** | All domains, program cadence | Full anchor complex | Full annealing schedule tied to program master schedule | Loop health metrics green (§8) across a complete phase |

Digital model → shadow → twin re-expresses as loop closure: R1–R3 are *shadow* (one-way: reality informs *w*); R4+ approaches *twin* status only in the governed sense — *w* generates work orders and proposals (never observation edits), under the write-back governance designed in R2–R3, before any bidirectional claim is made.

### 7.1 Generational Loop Chaining

The loop does not close at program boundaries. Program N's market phase — field data, warranty claims, quality history — is an error-signal stream whose natural consumer is **program N+1's observation plane**. Carry-over parts are the concrete carriers of this chaining: they arrive pre-collapsed (§5.4) *because* a prior generation's loop annealed them, and their accumulated field evidence is prior-generation error signal entering the current loop as observation. This is the automotive analogue of game development's live-ops loop (shipped-product telemetry feeding the next development cycle). Architecturally it means: (a) the observation plane's provenance model must distinguish *this-program* observations from *inherited* observations, since the two carry different applicability assumptions; (b) collapse certificates are the interface contract between generational loops — what program N must record so that program N+1 can compute carry-over differentials; and (c) SYNAPSE's scope decision ("one program" vs "a chain of programs") is a governance choice with data-architecture consequences, and should be made explicitly rather than defaulted.

---

## 8. Loop Health Metrics

A loop, unlike a stack, can be *dead while fully built*. Health is behavioral:

1. **Acceptance-rate distribution** per protocol and per domain-pair — alive means intermediate rates; pinned at ~1.0/~0.0 means ritual (§4.4).
2. **Staleness profile of *w*** — share of high-consequence components beyond their physical-grounding half-life.
3. **Error-signal latency** — time from physical observation to divergence registration to first resulting proposal.
4. **Collapse punctuality** — components reaching irreversibility deadlines still multimodal (late collapse = the pharma failure mode re-entering through the back door).
5. **Re-heat rate** — frequency of reopening collapsed components (high = collapsing too early; near-zero across a whole program = suspicious rubber-stamping).
6. **Shadow-IT index** — proxy measures of parallel Excel truth (export volumes, glossary bypass in documents). Rising index = the value proposition is failing, per the SSOT failure literature.
7. **z-diagnostic ratio** — of resolved disagreements, the share diagnosed as o-divergence vs z-divergence; a program that never finds z-divergence isn't looking.

---

## 9. Naming and Communication

- **Formal name:** SYNAPSE Loop Architecture — *Collective Predictive Development*.
- **Dual naming (hardening #7):** every element carries a plain engineering name for floor and management communication: 観測 (measurements) / 解釈 (each team's model) / 共通図 (the shared picture) / 合意の回し方 (how we agree) / 答え合わせ (checking against reality). The CPC vocabulary is load-bearing in design documents; it should never be required at a gate review.
- **One-line pitch:** *"SYNAPSE keeps one shared picture of the vehicle honest: every team proposes, every proposal is tested against real data, and every prediction gets checked against the physical car."*

## 10. Open Items

1. **Acceptance-grounding implementation** for R1: document-predictive likelihood via embedding-based approximation vs LLM-scored coherence — decide during PoC design; sycophancy countermeasures mandatory if LLM-scored.
2. **Collapse-schedule ownership:** which existing role (chief engineer office vs DR secretariat) owns the annealing calendar — organizational decision, prerequisite for R2.
3. **Supplier participation tiers** in consensus dynamics (opaque-*z* domains): contract language for proposal/acceptance rights at information boundaries.
4. **Multimodality budget:** explicit list of *w* component types where multimodal consensus is permitted indefinitely (glossary, styling intent descriptors) vs deadline-bound (BOM, classification, homologation-relevant IDs).
5. **Relationship of Predictive Risk *visualization*** (the UI value retained from the stack) to the error signal: the portal's risk view is now a rendering of correlation-governance state — spec update needed in the presentation materials and prototype (`Viewer3D.jsx` / `Dashboard.jsx` implications).
6. **Collapse-certificate schema design (§5.4):** minimum required fields (load assumptions, regulatory baseline, correlated predictions, supplier process state), storage location within the persistent-ID registry, and the diff algorithm that maps certificate-vs-context divergence onto the new/carry-over/partially-modified taxonomy. Includes a *fossil inventory* pass over the NV-2026 carry-over portfolio as an early risk artifact.
7. **Generational loop chaining (§7.1):** provenance flags separating this-program from inherited observations; the interface contract between program N's field data and program N+1's observation plane; and the explicit scope decision (single program vs program chain) with its data-architecture consequences.

---

*v1.1 — supersedes the four-layer structure of `SYNAPSE_ArchitectureDesign.md`; retains and re-grounds its two-value framework. v1.1 adds §5.4 (carry-over parts as pre-collapsed entrants, collapse certificates, fossils) and §7.1 (generational loop chaining). Companion documents: cross-industry critical review report; CPC/MHNG implementation feasibility report.*
