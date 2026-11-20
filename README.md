# Db2 Backup Traceability: find and prove a three-year-old backup in minutes, not days

Illustrative demo built with IBM Bob — uses synthetic data. Product screens are simulated; no IBM service is called.

**Value statement:** an auditor's question about an old Db2 backup is answered with a complete, repeatable evidence trail in under 15 minutes (target), without pulling developers off planned work.

## Audience and scenario

- **Audience:** bank audit and compliance leads, DBAs and mainframe application owners; also IBM Z account teams.
- **Story:** a bank failed an audit because limited Db2 catalog history meant a three-year-old backup could not be traced. The search fell to developers, delayed the response and used scarce capacity. This demo shows the target flow with **IBM Application Discovery and Delivery Intelligence (ADDI) for IBM Z** and **IBM watsonx Assistant for Z**: the assistant takes the question, ADDI lineage supplies what the catalog no longer has, and every check lands in an evidence package.
- **Client code:** `DEMO-BANK-001` (fictional bank "Meridian Financial"; no real client).

## Deliverables

| File | What it is |
|---|---|
| `video/db2-backup-traceability-demo-narrated.mp4` | **Narrated** walkthrough, about 4 min 1 s, 1920x1080, H.264 + AAC, voice only (no on-screen caption bar; the notes are in `captions-narrated.srt`). The voice is the offline Windows text-to-speech voice (Microsoft Zira): clear but synthetic, not studio quality. |
| `video/db2-backup-traceability-demo.webm` | **Silent** walkthrough, about 2 min, 1920x1080, no audio track. Notes appear as on-screen captions. |
| `video/captions.srt`, `video/captions-narrated.srt` | The same notes as subtitles for each version (for editing or a sidecar track). |
| `ARQUITECTURE_2.md` | Source text for the architecture, deployed-today and conclusion scenes of **both** videos. Edit it and re-record to change them. |
| `public/diagrams/architecture.svg`, `conclusion.svg` | The two IBM-format diagrams shown on the Architecture page and in both videos (editable SVG, no photo, no logo). |
| `DEMO-SCRIPT.md` | Run of show for the video (what appears on screen, in order). No presenter notes. |
| Live app | `https://amequi.github.io/db2-backup-traceability-demo/` once deployed (see below). Both videos are under `./video/` on the same site. |

## Prerequisites

- Node.js 20 or later (built and verified on Node 24) and npm.
- Google Chrome or Microsoft Edge, only if you want to re-record the video.
- A GitHub account (`AMEQUI`) to publish. No IBM credentials, API keys or network access are needed to run the demo.

## Setup and run

```bash
npm ci
npm run dev          # http://localhost:5173
```

Build and preview the static site:

```bash
npm run build
npm run preview      # http://localhost:4173
```

Regenerate the synthetic data (fixed seed 42, identical every run):

```bash
npm run data
```

Re-record the silent video (needs `npm run build` first; also runs 31 checks and fails on any console error or unstyled Carbon):

```bash
npm run build
npx playwright-core install ffmpeg   # one time, downloads Playwright's recorder
npm run video
```

Re-record the narrated MP4 (Windows only: it uses the built-in `System.Speech` voices; also needs a full ffmpeg with libx264 and AAC, for example `winget install Gyan.FFmpeg`, or set `FFMPEG=<path to ffmpeg.exe>`; takes about 5 minutes because it records in real time):

```bash
npm run build
npm run video:voice
```

Optional: `VOICE_NAME=David` picks another installed Windows voice. On macOS or Linux, record a voice-over yourself from `video/captions.srt` and mux it onto the silent video.

If Chrome or Edge is not found, set `CHROME_PATH` (see `.env.example`).

Run the compliance gate:

```bash
npm run check
```

## Deploy to GitHub Pages (AMEQUI)

Target: `https://github.com/AMEQUI/db2-backup-traceability-demo`, served at `https://amequi.github.io/db2-backup-traceability-demo/`.

```bash
git init -b main
git add .
git commit -m "Db2 backup traceability mock demo"
git remote add origin https://github.com/AMEQUI/db2-backup-traceability-demo.git
git push -u origin main
```

Then in the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**. The workflow in `.github/workflows/pages.yml` builds and publishes on every push to `main`. The app uses relative asset paths and hash routing, so it works under the `/db2-backup-traceability-demo/` sub-path without server rewrites.

## What to show

Follow the run of show in [`DEMO-SCRIPT.md`](DEMO-SCRIPT.md). In short: Dashboard (the visibility gap), Problem, Solution (validated trace, then the honest gap), Results (illustrative targets), Architecture.

## Known limitations

- **Everything is mocked.** watsonx Assistant for Z and ADDI are simulated screens with scripted output. No product is called, there is no REST API and no watsonx usage (out of scope by request).
- **Synthetic data only:** 222 month-end image copies for six objects of a fictional bank, fictional dataset names and volume serials, seed 42. See `data/README.md`.
- **The elapsed time is simulated.** The clock counts scripted seconds per check. "Under 15 minutes" and "100% auditable" are targets to prove in a pilot, not measured results. The demo's own traces take about 3 to 5 simulated minutes.
- **Retention (365 days) and the catalog behaviour are illustrative.** Real Db2 for z/OS history depends on the bank's `MODIFY RECOVERY` and housekeeping policy. Verify with the client's DBAs before presenting specifics.
- **Not verified against product docs:** the exact ADDI and watsonx Assistant for Z capabilities used (lineage from job to Db2 object, conversational lookup). The IBM documentation index available to Bob did not include dedicated ADDI or Assistant for Z libraries, so confirm the claims with the product teams before a client session.
- **"Recoverability dry run" is a concept** shown as simulated and non-destructive; it is not a documented ADDI feature.
- **Carbon MCP was unavailable during the build** (placeholder token in `.bob/mcp.json`). Carbon components were written following the patterns already used in this workspace's sibling demo and verified by a clean build and a headless render, but their props were **not re-checked against the Carbon MCP**.
