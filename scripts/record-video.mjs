// Records the silent walkthrough video (WebM, no audio track) of the built demo, with on-screen caption notes.
// Usage: npm run build && npm run video
// Output: video/db2-backup-traceability-demo.webm, video/captions.srt, screenshots/*.png
// Fails (exit 1) on any console error, uncaught exception, failed request or unstyled Carbon.
import { chromium } from 'playwright-core';
import { preview } from 'vite';
import { existsSync, mkdirSync, copyFileSync, readdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const executablePath = CANDIDATES.find((p) => existsSync(p));
if (!executablePath) { console.error('No Chrome/Edge found. Set CHROME_PATH.'); process.exit(2); }

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

async function caption(title, text, ms) {
  captions.push({ start: (Date.now() - t0) / 1000, end: (Date.now() - t0) / 1000 + ms / 1000, title, text });
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
  await wait(ms);
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

// ---------------------------------------------------------------- Scene 0: title card (inline, no navigation)
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
await caption('Scenario', 'A bank failed an audit: a three-year-old Db2 backup could not be traced. The synthetic estate here holds 222 month-end image copies for six objects.', 7000);
await caption('Dashboard', 'The Db2 catalog only keeps limited history, so older backups vanish from it. Teal bars are recoverable only through ADDI lineage. Red marks two true gaps.', 8000);

// ---------------------------------------------------------------- Problem
where = 'problem';
await goto('#/problem', '.pain-list');
await styled('problem');
await shot('02-problem');
await caption('The problem', 'The search fell to developers, took days, pulled capacity from planned work, and left no repeatable evidence trail for the auditor.', 8000);
await caption('The target', 'Locate and validate the backup in under 15 minutes, with 100% auditable traceability. Durations shown are illustrative.', 5500);

// ---------------------------------------------------------------- Solution A: ledger (validated)
where = 'solution-ledger';
await goto('#/solution', '.scenario-btn');
await styled('solution');
await page.evaluate(() => window.scrollTo(0, 0));
await caption('Solution', 'Pick a preset scenario. Nobody types. The audit analyst asks for the general ledger backup of 30 November 2023.', 4500);
await page.getByRole('button', { name: /Run trace/ }).click();
await caption('IBM watsonx Assistant for Z (simulated)', 'The assistant interprets the request, checks the Db2 catalog, finds no row, and says why: history older than the retention window is gone.', 5500);
await caption('IBM ADDI for IBM Z (simulated)', 'ADDI lineage identifies the COPY job that ran that night. The dataset is located on virtual tape with its volume serial.', 5500);
await page.waitForSelector('.evidence', { timeout: 30000 });
await wait(800);
await page.locator('.evidence').scrollIntoViewIfNeeded();
await page.evaluate(() => window.scrollBy(0, 200));
await wait(600);
check('ledger: 7 checks logged', (await page.locator('.checks .check').count()) === 7);
check('ledger: validated + evidence sealed', await page.locator('.evidence').innerText().then((t) => /Validated/.test(t) && /EVD-/.test(t)));
check('ledger: elapsed under 15:00', await page.locator('.clock--ok').count() === 1);
await shot('03-solution-validated');
await caption('Evidence', 'Integrity and a simulated recoverability dry run pass. The evidence package is sealed, every check with its source system and timestamp. Total: under three minutes.', 8000);

// ---------------------------------------------------------------- Solution B: payments (honest gap)
where = 'solution-gap';
await page.getByRole('button', { name: /Payment history/ }).click();
await wait(600);
await page.getByRole('button', { name: /Run trace/ }).click();
await caption('An honest answer', 'Not every question has a happy ending. For this object the job ran, but its dataset is missing everywhere.', 5000);
await page.waitForSelector('.evidence--gap', { timeout: 30000 });
await wait(800);
await page.locator('.evidence--gap').scrollIntoViewIfNeeded();
await page.evaluate(() => window.scrollBy(0, 200));
await wait(600);
check('payments: gap documented, not hidden', await page.locator('.evidence--gap').innerText().then((t) => /Gap documented/.test(t)));
await shot('04-solution-gap');
await caption('Auditable either way', 'The tool does not invent a backup. It documents the gap with full evidence, so the audit conversation starts from facts, in minutes.', 7000);

// ---------------------------------------------------------------- Results
where = 'results';
await page.evaluate(() => window.scrollTo(0, 0));
await goto('#/results', '.compare-card');
await styled('results');
check('results: charts drawn', (await page.locator('.chart-panel svg').count()) >= 1);
await shot('05-results');
await caption('Results (illustrative targets)', 'From days of developer effort to a repeatable, auditable trace by the audit or DBA team. Targets to be proven in a pilot, not measured results.', 8000);

// ---------------------------------------------------------------- Architecture
where = 'architecture';
await goto('#/architecture', '.mermaid-wrap svg');
await styled('architecture');
await shot('06-architecture');
await caption('Architecture', 'Conversation on top, ADDI lineage in the middle, the Db2 and z/OS estate underneath, and an evidence package at the end. No REST API and no watsonx.ai: both IBM products are simulated screens.', 9000);
await caption('Next step', 'A Client Engineering pilot connects this flow to the bank’s real ADDI project and Db2 subsystem in 3 to 4 weeks. Built with IBM Bob. Synthetic data only.', 6000);

check('no console errors / exceptions / failed requests', problems.length === 0, problems.slice(0, 5).join(' | '));

// ---------------------------------------------------------------- finalise video + captions
const video = page.video();
await page.close();
await context.close();
await browser.close();
await server.close();

const tmp = await video.path();
const out = 'video/db2-backup-traceability-demo.webm';
copyFileSync(tmp, out);
copyFileSync(tmp, 'public/video/db2-backup-traceability-demo.webm');
rmSync('video/.tmp', { recursive: true, force: true });

const ts = (s) => {
  const ms = Math.round(s * 1000);
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
writeFileSync('video/captions.srt', captions.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.title}: ${c.text}\n`).join('\n'));
writeFileSync('video/captions.json', JSON.stringify(captions, null, 2));

const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} checks passed; video: ${out}`);
process.exit(failed ? 1 : 0);
