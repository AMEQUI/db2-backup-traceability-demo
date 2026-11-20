# Demo Script: video with on-screen notes (silent and narrated versions)

**Formats:**
- **Narrated:** `video/db2-backup-traceability-demo-narrated.mp4`, about 4 min 1 s, 1920x1080, with a synthetic offline voice reading the same notes. Subtitles: `video/captions-narrated.srt`. Each scene holds until its sentence finishes, so its cue times differ from the table below.
- **Silent:** `video/db2-backup-traceability-demo.webm`, about 2 min, no audio. Notes are burned in as captions (`video/captions.srt`). The timings in the table below are for this version.

Use this script as the voice-over notes if you present it live instead of playing a video.

**Audience:** bank audit and compliance leads, DBAs, mainframe application owners.
**Key takeaway:** an old Db2 backup can be located and proven with a complete evidence trail in minutes, and a backup that cannot be proven is reported as a finding, not discovered late.

All figures are synthetic and illustrative. Product screens (IBM watsonx Assistant for Z, IBM ADDI for IBM Z) are simulated.

## Setup checklist

```bash
npm ci
npm run build
npm run preview        # open http://localhost:4173 at 1920x1080
```

- Browser at 1920x1080, full screen, dark theme as built.
- Or play `video/db2-backup-traceability-demo-narrated.mp4` (with sound) or `video/db2-backup-traceability-demo.webm` (no sound) in any player.

## Run of show (matches the video)

| Step | Time | What you do | What you say | What the audience should see |
|---|---|---|---|---|
| 1. Scenario | 0:03 to 0:10 | Dashboard open | "A bank failed an audit: a three-year-old Db2 backup could not be traced." | 4 KPI cards: 222 image copies tracked |
| 2. Dashboard | 0:10 to 0:18 | Point at the stacked bars | "The Db2 catalog keeps limited history. Teal months are only recoverable through ADDI lineage. Two red items are true gaps." | Blue (catalog), teal (ADDI), red (gap) bars |
| 3. Problem | 0:20 to 0:34 | Go to Problem | "The search fell to developers, took days and left no repeatable evidence. The target is under 15 minutes with 100% auditable traceability, to be proven in a pilot." | Pain list, "Days / Developers / Ad hoc / Failed" cards |
| 4. Solution, ask | 0:35 to 0:40 | Solution, general ledger preselected, press Run trace | "Nobody types. The analyst asks for the general ledger backup of 30 November 2023." | Preset scenarios, question in the chat |
| 5. Solution, Assistant and ADDI | 0:40 to 0:51 | Let the trace run | "The assistant checks the catalog, finds no row and says why, then ADDI lineage identifies the COPY job and the dataset is located on virtual tape." | Chat messages, checks appearing with timestamps, clock running |
| 6. Evidence | 0:52 to 1:00 | Scroll to evidence | "Integrity and a simulated recoverability dry run pass. The evidence package is sealed with every check, source system and timestamp. About five simulated minutes, well under the 15-minute target." | Green "Validated" tag, evidence ID, 7 checks |
| 7. Honest gap | 1:01 to 1:19 | Select Payment history, Run trace | "Not every question ends well. Here the job ran but its dataset is missing everywhere. The tool does not invent a backup; it documents the gap." | Red "Gap documented", skipped checks, "Honest outcome" notice |
| 8. Results | 1:20 to 1:28 | Go to Results | "From days of developer effort to a repeatable, auditable trace by the audit or DBA team. These are illustrative targets, not measured results." | Before and after cards, chart |
| 9. Architecture | after Results | Go to Architecture | "One request, five steps: ask, check the catalog, find the lineage in ADDI, locate and validate the copy, seal the evidence." | Five plain flow cards, each tagged Simulated, Synthetic data or Built |
| 10. What is deployed | next | Scroll to "What is deployed today" | "Only the demo web app and the evidence export are built. Assistant for Z and ADDI are simulated, no bank system is connected, no REST API or watsonx.ai." | Status table: Built, Simulated, Not connected, Out of scope |
| 11. Conclusion | last | Scroll to the conclusion | "This shows the flow, not the products. The 15-minute target is still to be proven. Next: agree the scope, confirm product capabilities, measure today, run a 3 to 4 week pilot on the bank's real systems." | Conclusion, four next steps, what we need from the bank |

## Talk track

Open with the audit failure: the backup probably existed, but nobody could prove where it was, and the proof depended on developers. Show that the catalog's limited history is the root cause (dashboard), then show the same question answered as a conversation with an evidence trail (solution). Spend time on the gap case: auditors trust a tool that reports what it cannot prove. Close on the pilot.

## Q&A prep

| Question | Answer |
|---|---|
| Is this real ADDI and Assistant for Z? | No. Both are simulated screens with scripted output. A pilot connects the real products. |
| Is "under 15 minutes" measured? | No, it is the target. The simulated traces take about 3 to 5 minutes. A pilot measures it on the bank's data. |
| Does ADDI recover backups? | Verify before presenting: the demo uses ADDI for discovery and lineage (which jobs and programs touch a Db2 object). Confirm exact capabilities with the ADDI product team. |
| What if the dataset is truly gone? | The demo shows this: the gap is documented with evidence. Whether recovery is possible is a separate question. |
| Does it need watsonx.ai or APIs? | Not in this demo. Both were out of scope. Verify before presenting what Assistant for Z needs in a real deployment. |

## Fallback plan

- Live app fails: play `video/db2-backup-traceability-demo-narrated.mp4` (or the silent `.webm`).
- Video will not play: open `screenshots/` (01 to 06) in order. They are generated by `npm run video`.
- No network: everything runs locally with `npm run preview`.

## Reset steps

Reload the page. State is not persisted. On the Solution page, press Reset, or select another scenario.
