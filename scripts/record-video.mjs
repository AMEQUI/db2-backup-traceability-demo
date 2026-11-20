// Records the walkthrough video of the built demo, with on-screen caption notes.
//   npm run video          -> SILENT WebM:   video/db2-backup-traceability-demo.webm (+ captions.srt)
//   npm run video:voice    -> NARRATED MP4:  video/db2-backup-traceability-demo-narrated.mp4 (+ captions-narrated.srt)
// Run `npm run build` first. Fails (exit 1) on any console error, uncaught exception, failed request or unstyled Carbon.
// Narration (NARRATE=1) uses the offline Windows voice via scripts/synth-voice.ps1 and needs an ffmpeg with libx264 + aac
// (e.g. `winget install Gyan.FFmpeg`; set FFMPEG=<path> if it is not on PATH). Each scene is held until its sentence finishes.
import { chromium } from 'playwright-core';
import { preview } from 'vite';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync, readdirSync, readFileSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const NARRATE = process.env.NARRATE === '1' || process.argv.includes('--narrate');

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const executablePath = CANDIDATES.find((p) => existsSync(p));
if (!executablePath) { console.error('No Chrome/Edge found. Set CHROME_PATH.'); process.exit(2); }

// ---------------------------------------------------------------- scenes: [title, caption text, minimum hold in ms]
const S = {
  scenario: ['Scenario', 'A bank failed an audit: a three-year-old Db2 backup could not be traced. The synthetic estate here holds 222 month-end image copies for six objects.', 7000],
  dashboard: ['Dashboard', 'The Db2 catalog only keeps limited history, so older backups vanish from it. Teal bars are recoverable only through ADDI lineage. Red marks two true gaps.', 8000],
  problem: ['The problem', 'The search fell to developers, took days, pulled capacity from planned work, and left no repeatable evidence trail for the auditor.', 8000],
  target: ['The target', 'Locate and validate the backup in under 15 minutes, with 100% auditable traceability. Durations shown are illustrative.', 5500],
  solution: ['Solution', 'Pick a preset scenario. Nobody types. The audit analyst asks for the general ledger backup of 30 November 2023.', 4500],
  assistant: ['IBM watsonx Assistant for Z (simulated)', 'The assistant interprets the request, checks the Db2 catalog, finds no row, and says why: history older than the retention window is gone.', 5500],
  addi: ['IBM ADDI for IBM Z (simulated)', 'ADDI lineage identifies the COPY job that ran that night. The dataset is located on virtual tape with its volume serial.', 5500],
  evidence: ['Evidence', 'Integrity and a simulated recoverability dry run pass. The evidence package is sealed, every check with its source system and timestamp. Total: about five simulated minutes, well under the 15-minute target.', 8000],
  honest: ['An honest answer', 'Not every question has a happy ending. For this object the job ran, but its dataset is missing everywhere.', 5000],
  auditable: ['Auditable either way', 'The tool does not invent a backup. It documents the gap with full evidence, so the audit conversation starts from facts, in minutes.', 7000],
  results: ['Results (illustrative targets)', 'From days of developer effort to a repeatable, auditable trace by the audit or DBA team. Targets to be proven in a pilot, not measured results.', 8000],
  architecture: ['Architecture', 'Conversation on top, ADDI lineage in the middle, the Db2 and z/OS estate underneath, and an evidence package at the end. No REST API and no watsonx.ai: both IBM products are simulated screens.', 9000],
  next: ['Next step', 'A Client Engineering pilot connects this flow to the bank’s real ADDI project and Db2 subsystem in 3 to 4 weeks. Built with IBM Bob. Synthetic data only.', 6000],
};

// How the text is pronounced by the voice (captions keep the written form).
const SPEECH = [
  [/Db2/g, 'D B 2'], [/ADDI/g, 'A D D I'], [/z\/OS/g, 'z O S'], [/watsonx/g, 'watson X'], [/\bCOPY\b/g, 'copy'],
  [/\bDBA\b/g, 'D B A'], [/’/g, "'"], [/\bIBM Z\b/g, 'IBM Z'],
];
const spoken = (t) => SPEECH.reduce((s, [re, to]) => s.replace(re, to), t);

// ---------------------------------------------------------------- narration prerequisites + synthesis
function findFfmpeg() {
  const ok = (p) => {
    const v = spawnSync(p, ['-hide_banner', '-encoders'], { encoding: 'utf8' });
    return v.status === 0 && /libx264/.test(v.stdout) && /\baac\b/.test(v.stdout);
  };
  if (process.env.FFMPEG && ok(process.env.FFMPEG)) return process.env.FFMPEG;
  if (ok('ffmpeg')) return 'ffmpeg';
  const root = process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Microsoft', 'WinGet', 'Packages');
  const hunt = (dir, depth) => {
    if (depth < 0 || !existsSync(dir)) return null;
    for (const n of readdirSync(dir)) {
      const p = join(dir, n);
      if (n.toLowerCase() === 'ffmpeg.exe' && ok(p)) return p;
      if (statSync(p).isDirectory()) { const r = hunt(p, depth - 1); if (r) return r; }
    }
    return null;
  };
  return root ? hunt(root, 4) : null;
}

function wavSeconds(file) {
  const b = readFileSync(file);
  let o = 12; let byteRate = 0;
  while (o + 8 <= b.length) {
    const id = b.toString('ascii', o, o + 4); const size = b.readUInt32LE(o + 4);
    if (id === 'fmt ') byteRate = b.readUInt32LE(o + 16);
    if (id === 'data') return size / byteRate;
    o += 8 + size + (size % 2);
  }
  throw new Error(`No data chunk in ${file}`);
}

let ffmpeg = null;
const audio = new Map(); // scene key -> { file, seconds }
const cues = []; // { file, at } filled while recording
if (NARRATE) {
  ffmpeg = findFfmpeg();
  if (!ffmpeg) { console.error('Narration needs ffmpeg with libx264 + aac. Install: winget install Gyan.FFmpeg (or set FFMPEG=<path>).'); process.exit(2); }
  mkdirSync('video/.tmp/audio', { recursive: true });
  const manifest = Object.entries(S).map(([k, [, text]]) => ({ file: resolve(`video/.tmp/audio/${k}.wav`), text: spoken(text) }));
  writeFileSync('video/.tmp/audio/manifest.json', JSON.stringify(manifest), 'utf8');
  const r = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'scripts/synth-voice.ps1', '-Manifest', resolve('video/.tmp/audio/manifest.json')], { encoding: 'utf8' });
  if (r.status !== 0) { console.error('Voice synthesis failed:', r.stderr || r.stdout); process.exit(2); }
  console.log(r.stdout.trim());
  for (const m of manifest) {
    const key = m.file.replace(/^.*[\\/]/, '').replace('.wav', '');
    audio.set(key, { file: m.file, seconds: wavSeconds(m.file) });
  }
  console.log(`Narration clips: ${audio.size}, total ${[...audio.values()].reduce((a, c) => a + c.seconds, 0).toFixed(1)} s`);
}

mkdirSync('video/.tmp', { recursive: true });
mkdirSync('screenshots', { recursive: true });
mkdirSync('public/video', { recursive: true });

const server = await preview({ preview: { port: 4173, strictPort: true, open: false } });
const BASE = 'http://localhost:4173/';

const browser = await chromium.launch({ executablePath, headless: true });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: { dir: 'video/.tmp', size: { width: 1920, height: 1080 } },
});
const page = await context.newPage();
const t0 = Date.now();

const problems = [];
const results = [];
const check = (name, ok, detail = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' - ' + detail : ''}`); };
let where = 'boot';
page.on('console', (m) => { if (m.type() === 'error') problems.push(`[${where}] console.error: ${m.text().slice(0, 300)}`); });
page.on('pageerror', (e) => problems.push(`[${where}] exception: ${e.message}`));
page.on('requestfailed', (r) => problems.push(`[${where}] request failed: ${r.url()}`));
page.on('response', (r) => { if (r.status() >= 400) problems.push(`[${where}] HTTP ${r.status()} ${r.url()}`); });

const wait = (ms) => page.waitForTimeout(ms);
const captions = [];

// Shows the caption for a scene; in narrated mode holds until the sentence has been spoken.
async function say(key) {
  const [title, text, minMs] = S[key];
  const startSec = (Date.now() - t0) / 1000;
  let hold = minMs;
  if (NARRATE) {
    const a = audio.get(key);
    hold = Math.max(minMs, Math.ceil(a.seconds * 1000) + 900);
    cues.push({ file: a.file, at: startSec + 0.3 });
  }
  captions.push({ start: startSec, end: startSec + hold / 1000, title, text });
  await page.evaluate(([ti, tx]) => {
    let el = document.getElementById('video-caption');
    if (!el) {
      el = document.createElement('div');
      el.id = 'video-caption';
      el.setAttribute('role', 'status'); document.body.style.paddingBottom = '150px';
      el.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:99999;padding:18px 48px 22px;background:rgba(22,22,22,.94);'
        + 'color:#f4f4f4;font-family:"IBM Plex Sans",sans-serif;border-top:4px solid #0f62fe;';
      document.body.appendChild(el);
    }
    el.innerHTML = '';
    const h = document.createElement('div');
    h.style.cssText = 'font-size:14px;letter-spacing:.32px;color:#78a9ff;margin-bottom:6px;text-transform:uppercase';
    h.textContent = ti;
    const p = document.createElement('div');
    p.style.cssText = 'font-size:26px;line-height:1.35;max-width:1700px';
    p.textContent = tx;
    el.append(h, p);
  }, [title, text]);
  await wait(hold);
}

const goto = async (hash, readySel) => {
  await page.evaluate((h) => { window.location.hash = h; }, hash);
  await page.waitForSelector(readySel, { timeout: 30000 });
  await wait(1500);
};
const shot = (name) => page.screenshot({ path: `screenshots/${name}.png` });

async function styled(name) {
  const info = await page.evaluate(async () => {
    await document.fonts.load('400 16px "IBM Plex Sans"');
    const cs = getComputedStyle(document.body);
    return {
      font: cs.fontFamily, bg: cs.backgroundColor, header: !!document.querySelector('.cds--header'),
      plex: [...document.fonts].filter((f) => f.family.replace(/"/g, '') === 'IBM Plex Sans' && f.status === 'loaded').length,
      banner: document.body.innerText.includes('Demonstration Environment'),
      footer: document.body.innerText.includes('uses synthetic data'),
    };
  });
  check(`${name}: Carbon styled (Plex, g90, header)`, /IBM Plex/i.test(info.font) && info.bg === 'rgb(38, 38, 38)' && info.header, `${info.font.slice(0, 24)} / ${info.bg}`);
  check(`${name}: Plex font files loaded`, info.plex >= 1, `${info.plex} face(s)`);
  check(`${name}: DemoBanner + footer`, info.banner && info.footer);
}

// ---------------------------------------------------------------- Dashboard
where = 'dashboard';
await page.goto(BASE + '#/', { waitUntil: 'load' });
await page.waitForSelector('.kpi-card');
await page.waitForSelector('tbody tr');
await wait(800);
check('dashboard: KPI cards render', (await page.locator('.kpi-card').count()) === 4);
check('dashboard: table has rows', (await page.locator('tbody tr').count()) >= 5);
check('dashboard: chart drawn', (await page.locator('.chart-panel svg').count()) >= 1);
check('dashboard: CSV export button', await page.getByRole('button', { name: /Export CSV/ }).isVisible());
await styled('dashboard');
await shot('01-dashboard');
await say('scenario');
await say('dashboard');

// ---------------------------------------------------------------- Problem
where = 'problem';
await goto('#/problem', '.pain-list');
await styled('problem');
await shot('02-problem');
await say('problem');
await say('target');

// ---------------------------------------------------------------- Solution A: ledger (validated)
where = 'solution-ledger';
await goto('#/solution', '.scenario-btn');
await styled('solution');
await page.evaluate(() => window.scrollTo(0, 0));
await say('solution');
await page.getByRole('button', { name: /Run trace/ }).click();
await say('assistant');
await say('addi');
await page.waitForSelector('.evidence', { timeout: 30000 });
await wait(800);
await page.locator('.evidence').scrollIntoViewIfNeeded();
await page.evaluate(() => window.scrollBy(0, 200));
await wait(600);
check('ledger: 7 checks logged', (await page.locator('.checks .check').count()) === 7);
check('ledger: validated + evidence sealed', await page.locator('.evidence').innerText().then((t) => /Validated/.test(t) && /EVD-/.test(t)));
check('ledger: elapsed under 15:00', await page.locator('.clock--ok').count() === 1);
const ledgerClock = await page.locator('.clock__value').innerText();
check('ledger: clock matches caption ("about five minutes")', /^05:\d\d$/.test(ledgerClock.trim()), ledgerClock.trim());
await shot('03-solution-validated');
await say('evidence');

// ---------------------------------------------------------------- Solution B: payments (honest gap)
where = 'solution-gap';
await page.getByRole('button', { name: /Payment history/ }).click();
await wait(600);
await page.getByRole('button', { name: /Run trace/ }).click();
await say('honest');
await page.waitForSelector('.evidence--gap', { timeout: 30000 });
await wait(800);
await page.locator('.evidence--gap').scrollIntoViewIfNeeded();
await page.evaluate(() => window.scrollBy(0, 200));
await wait(600);
check('payments: gap documented, not hidden', await page.locator('.evidence--gap').innerText().then((t) => /Gap documented/.test(t)));
await shot('04-solution-gap');
await say('auditable');

// ---------------------------------------------------------------- Results
where = 'results';
await page.evaluate(() => window.scrollTo(0, 0));
await goto('#/results', '.compare-card');
await styled('results');
check('results: charts drawn', (await page.locator('.chart-panel svg').count()) >= 1);
await shot('05-results');
await say('results');

// ---------------------------------------------------------------- Architecture
where = 'architecture';
await goto('#/architecture', '.mermaid-wrap svg');
await styled('architecture');
await shot('06-architecture');
await say('architecture');
await say('next');

check('no console errors / exceptions / failed requests', problems.length === 0, problems.slice(0, 5).join(' | '));

// ---------------------------------------------------------------- finalise
const video = page.video();
await page.close();
await context.close();
await browser.close();
await server.close();
const tmp = await video.path();

const ts = (s) => {
  const ms = Math.round(s * 1000);
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
const srt = captions.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.title}: ${c.text}\n`).join('\n');

let out;
if (!NARRATE) {
  out = 'video/db2-backup-traceability-demo.webm';
  copyFileSync(tmp, out);
  copyFileSync(tmp, 'public/video/db2-backup-traceability-demo.webm');
  writeFileSync('video/captions.srt', srt);
  writeFileSync('video/captions.json', JSON.stringify(captions, null, 2));
} else {
  out = 'video/db2-backup-traceability-demo-narrated.mp4';
  const args = ['-hide_banner', '-loglevel', 'error', '-y', '-i', tmp];
  cues.forEach((c) => args.push('-i', c.file));
  const delays = cues.map((c, i) => `[${i + 1}:a]adelay=${Math.round(c.at * 1000)}:all=1[a${i}]`);
  const mix = `${cues.map((_, i) => `[a${i}]`).join('')}amix=inputs=${cues.length}:duration=longest:normalize=0,aresample=44100,volume=1.6[aout]`;
  args.push('-filter_complex', `${delays.join(';')};${mix}`, '-map', '0:v', '-map', '[aout]',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '27', '-pix_fmt', 'yuv420p', '-r', '25',
    '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', out);
  const m = spawnSync(ffmpeg, args, { encoding: 'utf8' });
  if (m.status !== 0) { console.error('ffmpeg mux failed:\n', m.stderr); process.exit(1); }
  copyFileSync(out, 'public/video/db2-backup-traceability-demo-narrated.mp4');
  writeFileSync('video/captions-narrated.srt', srt);
}
rmSync('video/.tmp', { recursive: true, force: true });

const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} checks passed; video: ${out}`);
process.exit(failed ? 1 : 0);
