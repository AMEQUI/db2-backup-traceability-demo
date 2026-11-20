# ARQUITECTURE 2: architecture and conclusion narration

Source text for the last three scenes of **both** videos (silent `.webm` and narrated `.mp4`). `scripts/record-video.mjs` reads this file, so editing the text here changes the videos and their subtitle files (`captions.srt`, `captions-narrated.srt`) on the next recording.

Illustrative demo built with IBM Bob. All data is synthetic. IBM watsonx Assistant for Z and IBM Application Discovery and Delivery Intelligence (ADDI) for IBM Z are simulated screens. No REST API and no watsonx.ai.

Format of each scene: `### key | On-screen title`, then the sentence that is spoken (narrated) or shown (silent).

## Scenes

### architecture | Architecture
A person asks in plain language. The simulated IBM watsonx Assistant for Z runs four steps: look up the catalog, find lineage when the catalog is empty, locate and validate the backup, and seal the evidence. The simulated ADDI supplies the lineage. A DBA reviews the evidence package.

### deployed | What is deployed today
Only the demo web app and the evidence export are built. Assistant for Z and ADDI are simulated, no bank system is connected, and there is no REST API or watsonx.ai.

### next | Conclusion and next steps
This demo shows the flow, not the products. The target of under 15 minutes with 100 percent auditable traceability is still to be proven. Next: agree the scope in a short Sprint 0, confirm what is possible with the product teams, measure today's baseline, then run a three to four week pilot on the bank's real systems. We need a DBA, an application owner, an audit reviewer and read-only access. The goal is to validate value with real data and define the path to scale.

## Diagrams used

| Scene | Image (editable SVG) | What it shows |
|---|---|---|
| architecture | `public/diagrams/architecture.svg` | Users, conversation layer (Assistant for Z, simulated), the four steps, discovery layer (ADDI, simulated), evidence package, fictional IBM Z estate |
| next | `public/diagrams/conclusion.svg` | What the demo shows, what is still to prove, four next steps, what we need from the bank, goal |

## The four steps in the diagram

1. **Catalog lookup:** look up catalog information (Db2 SYSCOPY, limited history).
2. **Lineage when catalog is empty:** find related objects and lineage (ADDI, simulated).
3. **Locate and validate:** locate in the IBM Z estate (z/OS catalog, HSM, virtual tape) and validate.
4. **Seal evidence:** create the evidence package with source and timestamp per check.

## Status, stated plainly

| Item | Status |
|---|---|
| Demo web app, evidence export | Built |
| IBM watsonx Assistant for Z | Simulated |
| IBM ADDI for IBM Z | Simulated |
| Db2 for z/OS, z/OS storage | Not connected (synthetic data, seed 42) |
| REST APIs, watsonx.ai | Out of scope |

Capabilities of the two IBM products are not verified against product documentation; confirm with the product teams before any commitment.
