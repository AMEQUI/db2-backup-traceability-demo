// Compliance gate for this mock-only static demo. Usage: npm run check
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

let failed = 0;
const check = (name, ok, detail = '') => { if (!ok) failed++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' - ' + detail : ''}`); };

for (const f of ['README.md', 'DEMO-SCRIPT.md', 'ARCHITECTURE.md', 'PILOT_PLAN.md', '.env.example', '.gitignore', 'data/README.md',
  'ARQUITECTURE_2.md', 'ARQUITECTURE_3.md', 'public/diagrams/conclusion.svg',
  'data/backups.json', 'video/db2-backup-traceability-demo.webm', 'video/captions.srt',
  'video/db2-backup-traceability-demo-narrated.mp4', 'video/captions-narrated.srt', 'public/video/db2-backup-traceability-demo-narrated.mp4',
  '.github/workflows/pages.yml']) {
  check(`exists: ${f}`, existsSync(f));
}

const walk = (d) => readdirSync(d).flatMap((n) => {
  if (['node_modules', 'dist', '.git', 'video', 'screenshots', 'public'].includes(n)) return [];
  const p = join(d, n);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const files = walk('.').filter((p) => /\.(jsx?|mjs|scss|md|json|html|yml|example)$/.test(p) && !p.endsWith('package-lock.json'));
const text = files.map((p) => [p, readFileSync(p, 'utf8')]);

const bad = (re) => text.filter(([p, t]) => p !== 'scripts\\check-compliance.mjs' && p !== 'scripts/check-compliance.mjs' && re.test(t)).map(([p]) => p);

const unsafe = bad(/\beval\(|dangerouslySetInnerHTML/).filter((p) => /\.(jsx?|mjs)$/.test(p));
check('no eval() / dangerouslySetInnerHTML in source', unsafe.length === 0, unsafe.join(', '));
check('no hardcoded secrets', bad(/(api[_-]?key|secret|password|token)\s*[:=]\s*['"][A-Za-z0-9_\-]{12,}/i).length === 0);
const emails = text.flatMap(([p, t]) => (t.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || []).filter((e) => !/@(example\.com|demo\.ibm\.com)$/.test(e)).map((e) => `${p}: ${e}`));
check('only example.com / demo.ibm.com emails', emails.length === 0, emails.slice(0, 3).join('; '));

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
check('@carbon/react in dependencies', !!pkg.dependencies['@carbon/react']);
check('all dependency versions pinned', Object.values({ ...pkg.dependencies, ...pkg.devDependencies }).every((v) => /^\d/.test(v)));

const banner = readFileSync('src/components/DemoBanner.jsx', 'utf8');
check('DemoBanner has synthetic-data disclaimer', /All data is synthetic/.test(banner));
check('footer present', /uses synthetic data/.test(readFileSync('src/App.jsx', 'utf8')));
check('data file flagged synthetic', JSON.parse(readFileSync('data/backups.json', 'utf8'))._synthetic === true);
check('no API / watsonx.ai usage (out of scope)', bad(/axios|fetch\(|ibm-watsonx-ai|\/ml\/v1/).length === 0, bad(/axios|fetch\(|ibm-watsonx-ai|\/ml\/v1/).join(', '));
check('.env not committed', !existsSync('.env'));
check('.gitignore covers .env and node_modules', /\.env/.test(readFileSync('.gitignore', 'utf8')) && /node_modules/.test(readFileSync('.gitignore', 'utf8')));
check('no competitor names', bad(/\b(Splunk|Datadog|Dynatrace|CA Technologies|BMC|Broadcom)\b/).length === 0);
check('no "Powered by Watson"', bad(/Powered by Watson/i).length === 0);

console.log(failed ? `\n${failed} check(s) failed` : '\nAll compliance checks passed');
process.exit(failed ? 1 : 0);
