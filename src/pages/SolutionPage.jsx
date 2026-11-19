import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Tag, Tile, InlineNotification, ProgressIndicator, ProgressStep, StructuredListWrapper, StructuredListBody, StructuredListRow, StructuredListCell } from '@carbon/react';
import { Play, Renew, Download, CheckmarkFilled, WarningFilled, ErrorFilled, CircleDash, SkipForwardFilled } from '@carbon/icons-react';
import { SCENARIOS, resolveScenario, fmtElapsed, longDate, TARGET_SECONDS } from '../data/scenarios.js';
import { downloadBlob } from '../utils/formatters.js';

const STEP_MS = 1500; // real time per check; the clock shows simulated time
const SKIP_MS = 500;

const ICON = { ok: CheckmarkFilled, warn: WarningFilled, fail: ErrorFilled, skipped: SkipForwardFilled, pending: CircleDash };

export default function SolutionPage() {
  const [params] = useSearchParams();
  const initial = SCENARIOS.find((s) => s.id === params.get('scenario')) || SCENARIOS[0];
  const [scenarioId, setScenarioId] = useState(initial.id);
  const [step, setStep] = useState(0); // number of completed checks
  const [running, setRunning] = useState(false);
  const [sim, setSim] = useState(0);
  const stepStart = useRef(0);
  const chatEnd = useRef(null);

  const sc = SCENARIOS.find((s) => s.id === scenarioId);
  const result = useMemo(() => resolveScenario(sc), [sc]);
  const total = result.checks.length;
  const done = step >= total;
  const cumPrev = step === 0 ? 0 : result.checks[step - 1].cumulative;

  const reset = useCallback((id) => {
    setRunning(false); setStep(0); setSim(0);
    if (id) setScenarioId(id);
  }, []);

  const start = useCallback(() => {
    setStep(0); setSim(0); stepStart.current = Date.now(); setRunning(true);
  }, []);

  // advance one check at a time
  useEffect(() => {
    if (!running || step >= total) { if (running && step >= total) setRunning(false); return undefined; }
    stepStart.current = Date.now();
    const dur = result.checks[step].seconds === 0 ? SKIP_MS : STEP_MS;
    const t = setTimeout(() => setStep((s) => s + 1), dur);
    return () => clearTimeout(t);
  }, [running, step, total, result]);

  // smooth simulated clock
  useEffect(() => {
    if (!running) { if (done) setSim(result.totalSeconds); return undefined; }
    const iv = setInterval(() => {
      const c = result.checks[step];
      if (!c) return;
      const dur = c.seconds === 0 ? SKIP_MS : STEP_MS;
      const f = Math.min(1, (Date.now() - stepStart.current) / dur);
      setSim(Math.round(cumPrev + f * c.seconds));
    }, 80);
    return () => clearInterval(iv);
  }, [running, step, done, result, cumPrev]);

  // ?autorun=1 lets the video recorder start the trace without a click
  useEffect(() => {
    if (params.get('autorun') === '1') { const t = setTimeout(start, 600); return () => clearTimeout(t); }
    return undefined;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleChecks = result.checks.slice(0, step);

  // keep the newest assistant message in view
  useEffect(() => {
    const el = chatEnd.current;
    if (el && el.parentElement) el.parentElement.scrollTop = el.parentElement.scrollHeight;
  }, [step]);
  const clockTone = done ? (result.totalSeconds <= TARGET_SECONDS ? 'ok' : 'bad') : '';
  const gap = result.outcome === 'gap';

  const exportEvidence = () => {
    const pkg = {
      _synthetic: true,
      evidenceId: result.evidenceId,
      request: sc.question,
      outcome: result.outcome,
      elapsed: fmtElapsed(result.totalSeconds),
      backup: result.backup,
      checks: result.checks.map(({ id, system, label, detail, status, startedAt, elapsed }) => ({ id, system, label, detail, status, startedAt, elapsed })),
    };
    downloadBlob(JSON.stringify(pkg, null, 2), `${result.evidenceId}-synthetic.json`, 'application/json');
  };

  return (
    <main className="page">
      <h1>Locate and validate the backup</h1>
      <p className="lead">
        An auditor asks for a three-year-old Db2 backup. The assistant answers in conversation, ADDI supplies the lineage the
        catalog no longer has, and every check lands in an evidence package. Pick a scenario and run it. No typing needed.
      </p>

      <ProgressIndicator className="trace-progress" currentIndex={Math.min(step, total - 1)} spaceEqually aria-label="Trace progress">
        {result.checks.map((c, i) => (
          <ProgressStep key={c.id} label={c.label} secondaryLabel={c.system} complete={step > i} />
        ))}
      </ProgressIndicator>

      <div className="solution-grid">
        {/* Column 1: scenario + clock */}
        <section aria-label="Scenario">
          <div className="scenario-list" role="group" aria-label="Preset scenarios">
            {SCENARIOS.map((s) => (
              <button key={s.id} type="button" className="scenario-btn" aria-pressed={s.id === scenarioId}
                onClick={() => reset(s.id)} disabled={running}>
                <strong>{s.title}</strong>
                <span>{s.blurb}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button renderIcon={Play} onClick={start} disabled={running}>{done ? 'Run again' : 'Run trace'}</Button>
            <Button kind="tertiary" renderIcon={Renew} onClick={() => reset()} disabled={running || step === 0}>Reset</Button>
          </div>

          <div className={`clock ${clockTone ? `clock--${clockTone}` : ''}`} role="timer" aria-live="off" aria-label="Elapsed time, simulated">
            <span className="clock__value">{fmtElapsed(sim)}</span>
            <span className="clock__label">
              simulated elapsed time · target under 15:00 · today: days
            </span>
          </div>

        </section>

        {/* Column 2: watsonx Assistant for Z (mock chat) */}
        <section aria-label="watsonx Assistant for Z">
          <h2 style={{ marginTop: 0 }}>IBM watsonx Assistant for Z <Tag size="sm" type="cool-gray">simulated</Tag></h2>
          <div className="chat" role="log" aria-live="polite" aria-label="Assistant conversation">
            <div className="chat__msg chat__msg--user">
              <span className="chat__msg__who">Audit analyst (fictional)</span>
              {sc.question}
            </div>
            {visibleChecks.filter((c) => c.chat).map((c) => (
              <div key={c.id} className={`chat__msg ${c.status === 'warn' ? 'chat__msg--warn' : ''} ${c.status === 'fail' ? 'chat__msg--fail' : ''}`}>
                <span className="chat__msg__who">Assistant · {c.system} · {c.startedAt} UTC</span>
                {c.chat}
              </div>
            ))}
            {done ? (
              <div className={`chat__msg ${gap ? 'chat__msg--fail' : ''}`}>
                <span className="chat__msg__who">Assistant · summary</span>
                {result.summary}
              </div>
            ) : null}
            <div ref={chatEnd} />
            {!running && step === 0 ? <p className="muted">Press “Run trace” to start the conversation.</p> : null}
          </div>
        </section>

        {/* Column 3: ADDI + checks + evidence */}
        <section aria-label="Traceability evidence">
          <h2 style={{ marginTop: 0 }}>IBM ADDI for IBM Z + evidence <Tag size="sm" type="cool-gray">simulated</Tag></h2>
          {step === 0 ? (
            <div className="empty-state" role="status">
              <strong>No trace yet</strong>
              <p>Each check will appear here with its source system, time and result.</p>
            </div>
          ) : (
            <ol className="checks" aria-label="Checks performed">
              {visibleChecks.map((c) => {
                const I = ICON[c.status];
                return (
                  <li key={c.id} className={`check check--${c.status}`}>
                    <I size={20} aria-label={c.status} />
                    <div>
                      <strong>{c.label}</strong>
                      <span className="check__sys">{c.system}</span>
                      <span className="check__detail">{c.detail}</span>
                    </div>
                    <span className="check__time">{c.startedAt}</span>
                  </li>
                );
              })}
            </ol>
          )}

          {step >= 3 ? (
            <Tile className="lineage">
              <strong>ADDI discovery</strong>
              <p className="muted" style={{ margin: '0.25rem 0 0.5rem' }}>
                Programs that read or write <code>{sc.ts}</code> (illustrative):
              </p>
              <div>{result.programs.map((p) => <Tag key={p} type="blue" size="sm">{p}</Tag>)}</div>
            </Tile>
          ) : null}

          {done ? (
            <Tile className={`evidence ${gap ? 'evidence--gap' : ''}`}>
              <Tag type={gap ? 'red' : 'green'}>{gap ? 'Gap documented' : 'Validated'}</Tag>{' '}
              <Tag type="gray">{fmtElapsed(result.totalSeconds)} elapsed (simulated)</Tag>
              <p style={{ marginBlockStart: '0.75rem' }}>
                Evidence package <span className="evidence__id">{result.evidenceId}</span> sealed: {total} checks, each with source system and timestamp.
              </p>
              <StructuredListWrapper isCondensed aria-label="Evidence summary">
                <StructuredListBody>
                  <StructuredListRow><StructuredListCell noWrap>Object</StructuredListCell><StructuredListCell>{sc.ts}</StructuredListCell></StructuredListRow>
                  <StructuredListRow><StructuredListCell noWrap>As of</StructuredListCell><StructuredListCell>{longDate(sc.date)}</StructuredListCell></StructuredListRow>
                  <StructuredListRow><StructuredListCell noWrap>Dataset</StructuredListCell><StructuredListCell><code>{result.backup.dataset}</code></StructuredListCell></StructuredListRow>
                  <StructuredListRow><StructuredListCell noWrap>Location</StructuredListCell><StructuredListCell>{gap ? 'Not found' : `${result.backup.tier}, volume ${result.backup.volser}`}</StructuredListCell></StructuredListRow>
                </StructuredListBody>
              </StructuredListWrapper>
              <div className="evidence__actions">
                <Button kind="tertiary" size="sm" renderIcon={Download} onClick={exportEvidence}>Export evidence (JSON)</Button>
              </div>
            </Tile>
          ) : null}
        </section>
      </div>

      {done && gap ? (
        <InlineNotification kind="warning" lowContrast hideCloseButton title="Honest outcome"
          subtitle="The trace could not prove a valid backup here. It still delivered a complete, auditable explanation in minutes instead of leaving the question open." />
      ) : null}
    </main>
  );
}
