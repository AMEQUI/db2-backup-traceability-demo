import { InlineNotification, Tile, Tag } from '@carbon/react';
import ChartPanel from '../components/ChartPanel.jsx';
import { IBM_COLORS } from '../utils/formatters.js';

// Illustrative targets for pilot discussion. Minutes are used so both sides share one axis.
const COMPARISON = [
  { metric: 'Locate and validate a 3-year-old backup', before: 'Days', after: 'Under 15 min', note: 'Target to prove in a pilot' },
  { metric: 'Who does the work', before: 'Developers', after: 'Audit / DBA team', note: 'Developer capacity returned to delivery' },
  { metric: 'Evidence for the auditor', before: 'Ad hoc', after: '100% auditable', note: 'Every check: source system + timestamp' },
  { metric: 'Backup that cannot be proven', before: 'Found late', after: 'Reported with evidence', note: 'Gaps are findings, not surprises' },
];

// Illustrative: 2 working days = 960 minutes of effort-days compressed for the chart.
const CHART = [
  { group: 'Today (illustrative)', key: 'Time to answer (min)', value: 2880 },
  { group: 'Target', key: 'Time to answer (min)', value: 15 },
];

export default function ResultsPage() {
  return (
    <main className="page">
      <h1>What good looks like</h1>
      <p className="lead">Before and after for the audit question that failed.</p>
      <InlineNotification kind="warning" lowContrast hideCloseButton title="Illustrative, not measured"
        subtitle="Targets for pilot discussion. “Days” is shown as 2 days (2,880 minutes) for the chart only. Nothing here is a measured result." />

      <h2>Before / after</h2>
      <div className="compare-grid">
        {COMPARISON.map((c) => (
          <Tile key={c.metric} className="compare-card">
            <h3>{c.metric}</h3>
            <dl className="compare-card__row">
              <div><dt>Today</dt><dd>{c.before}</dd></div>
              <div><dt>With ADDI + Assistant for Z (target)</dt><dd>{c.after}</dd></div>
            </dl>
            <p className="muted">{c.note} <Tag size="sm" type="gray">illustrative</Tag></p>
          </Tile>
        ))}
      </div>

      <h2>Time to answer</h2>
      <ChartPanel
        type="groupedBar"
        title="Minutes to locate and validate a backup (lower is better)"
        data={CHART}
        height="320px"
        colors={{ 'Today (illustrative)': IBM_COLORS.purple, Target: IBM_COLORS.teal }}
        options={{ axes: { left: { mapsTo: 'value', title: 'minutes' }, bottom: { mapsTo: 'key', scaleType: 'labels' } } }}
      />
    </main>
  );
}
