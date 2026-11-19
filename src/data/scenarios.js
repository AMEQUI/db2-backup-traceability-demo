// Scenario engine for the mock demo. Everything is derived from data/backups.json (SYNTHETIC, seed 42).
import raw from '../../data/backups.json';

export const AS_OF = raw.asOf;
export const BACKUPS = raw.backups;
export const MONTHLY = raw.monthly;
export const RETENTION_DAYS = raw.syscopyRetentionDays;
export const TARGET_SECONDS = 15 * 60;

export const SCENARIOS = [
  {
    id: 'ledger',
    ts: 'ACCTDB.ACCTLEDG',
    date: '2023-11-30',
    title: 'General ledger, Nov 2023',
    blurb: 'The audit request: a three-year-old backup the catalog has forgotten.',
    question: 'Which backup protected ACCTDB.ACCTLEDG on 30 Nov 2023, where is it now, and can you prove it is valid?',
  },
  {
    id: 'customer',
    ts: 'CUSTDB.CUSTMAST',
    date: '2023-11-30',
    title: 'Customer master, Nov 2023',
    blurb: 'Same question, different object. The answer is repeatable.',
    question: 'Which backup protected CUSTDB.CUSTMAST on 30 Nov 2023, where is it now, and can you prove it is valid?',
  },
  {
    id: 'payments',
    ts: 'PAYDB.PAYHIST',
    date: '2023-12-31',
    title: 'Payment history, Dec 2023 (known gap)',
    blurb: 'An honest "cannot prove it" outcome, with the evidence for why.',
    question: 'Which backup protected PAYDB.PAYHIST on 31 Dec 2023, where is it now, and can you prove it is valid?',
  },
];

// Fictional program names per object (illustrative ADDI discovery output).
const PROGRAMS = {
  'ACCTDB.ACCTLEDG': ['ACLGB010', 'ACLGB020', 'ACLGQ300'],
  'ACCTDB.ACCTMAST': ['ACMSB010', 'ACMSQ100'],
  'CUSTDB.CUSTMAST': ['CUMSB010', 'CUMSB045', 'CUMSQ200'],
  'PAYDB.PAYHIST': ['PYHSB010', 'PYHSB090'],
  'CARDDB.CARDTXN': ['CDTXB010', 'CDTXB070'],
  'RISKDB.RISKSCOR': ['RKSCB010'],
};

const hash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};
const fmtClock = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};
export const fmtElapsed = fmtClock;

export const longDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export function resolveScenario(sc) {
  const backup = BACKUPS.find((b) => b.tablespace === sc.ts && b.copyDate === sc.date);
  const gap = backup.status === 'gap';
  const viaCatalog = backup.evidenceSource === 'SYSCOPY';
  const h = hash(sc.id);
  const sec = (base) => base + (h % 17);
  const programs = PROGRAMS[sc.ts] || [];

  const checks = [
    {
      id: 'C1', system: 'watsonx Assistant for Z', label: 'Interpret request',
      detail: `Object ${sc.ts}, as of ${longDate(sc.date)}, evidence required`,
      status: 'ok', seconds: 6,
      chat: `Understood. I am looking for the Db2 image copy in force for ${sc.ts} on ${longDate(sc.date)}.`,
    },
    {
      id: 'C2', system: 'Db2 for z/OS catalog (SYSCOPY)', label: 'Catalog history lookup',
      detail: viaCatalog ? `Row found for ${backup.copyDate}` : `0 rows. History older than ${RETENTION_DAYS} days was cleaned up (illustrative retention)`,
      status: viaCatalog ? 'ok' : 'warn', seconds: sec(9),
      chat: viaCatalog
        ? 'Db2 catalog: image copy row found.'
        : `Db2 catalog (SYSCOPY): no row. History older than ${RETENTION_DAYS} days is gone, which is why the audit stalled. Switching to ADDI lineage.`,
    },
    {
      id: 'C3', system: 'IBM ADDI for IBM Z', label: 'Lineage: which job produced the copy',
      detail: `Job ${backup.jobName} step ${backup.jobStep}, run ${backup.copyDate} ${backup.copyTime} UTC, utility COPY on ${sc.ts}`,
      status: 'ok', seconds: sec(38),
      chat: `ADDI lineage: job ${backup.jobName} (step ${backup.jobStep}) ran the COPY utility on ${backup.copyDate} at ${backup.copyTime} UTC.`,
    },
    gap
      ? {
          id: 'C4', system: 'z/OS catalog, HSM and tape inventory', label: 'Locate the dataset',
          detail: `Expected ${backup.dataset}. Not found in the catalog, HSM or the virtual tape inventory`,
          status: 'fail', seconds: sec(52),
          chat: `Dataset ${backup.dataset} is not in the z/OS catalog, HSM or the virtual tape inventory.`,
        }
      : {
          id: 'C4', system: 'z/OS catalog, HSM and tape inventory', label: 'Locate the dataset',
          detail: `${backup.dataset} on ${backup.tier}, volume ${backup.volser}`,
          status: 'ok', seconds: sec(52),
          chat: `Located ${backup.dataset} on ${backup.tier}, volume ${backup.volser}.`,
        },
    gap
      ? { id: 'C5', system: 'Storage inventory', label: 'Integrity check', detail: 'Skipped: no dataset to check', status: 'skipped', seconds: 0, chat: null }
      : {
          id: 'C5', system: 'Storage inventory', label: 'Integrity check',
          detail: `Image copy header readable, size ${backup.sizeGb} GB matches the job record`,
          status: 'ok', seconds: sec(74),
          chat: `Integrity: header readable and size ${backup.sizeGb} GB matches the job record.`,
        },
    gap
      ? { id: 'C6', system: 'Db2 for z/OS', label: 'Recoverability dry run', detail: 'Skipped: no dataset to recover from', status: 'skipped', seconds: 0, chat: null }
      : {
          id: 'C6', system: 'Db2 for z/OS', label: 'Recoverability dry run (simulated)',
          detail: 'Non-destructive check that the copy can be used as a recovery base',
          status: 'ok', seconds: sec(96),
          chat: 'Recoverability dry run passed (simulated, non-destructive).',
        },
    {
      id: 'C7', system: 'Audit evidence store', label: 'Seal evidence package',
      detail: `Every check above recorded with source system, timestamp and operator ${gap ? '(gap documented for the auditor)' : ''}`.trim(),
      status: 'ok', seconds: 14,
      chat: gap ? 'Evidence package sealed, including the gap and why it cannot be closed.' : 'Evidence package sealed.',
    },
  ];

  let t = 0;
  const base = Date.UTC(2026, 10, 19, 9, 0, 0);
  const timed = checks.map((c) => {
    const startedAt = new Date(base + t * 1000).toISOString().slice(11, 19);
    t += c.seconds;
    return { ...c, startedAt, elapsed: fmtClock(t), cumulative: t };
  });

  const outcome = gap ? 'gap' : 'validated';
  return {
    scenario: sc,
    backup,
    outcome,
    checks: timed,
    totalSeconds: t,
    evidenceId: `EVD-${hash(sc.id + sc.ts + sc.date).toString(16).padStart(8, '0').toUpperCase()}`,
    programs,
    viaCatalog,
    summary: gap
      ? `Cannot prove a valid backup for ${sc.ts} on ${longDate(sc.date)}. The job ran, but its output dataset is missing. Escalated with full evidence in ${fmtClock(t)}.`
      : `Backup found and validated: ${backup.dataset} on ${backup.tier}, volume ${backup.volser}. Evidence package sealed in ${fmtClock(t)}.`,
  };
}
