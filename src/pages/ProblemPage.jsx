import { InlineNotification, Tile, Tag } from '@carbon/react';
import { WarningAlt, Time, UserMultiple, DocumentUnknown } from '@carbon/icons-react';
import KPICard from '../components/KPICard.jsx';

const PAIN = [
  'The audit asked for a three-year-old Db2 backup. The catalog only keeps limited history, so the record was gone.',
  'The search moved to application developers, who had to read job logs and source to reconstruct what ran and where it went.',
  'Developer capacity was pulled away from planned work, and the audit response was late.',
  'There was no single, repeatable evidence trail an auditor could accept as complete.',
];

export default function ProblemPage() {
  return (
    <main className="page">
      <h1>What went wrong in the audit</h1>
      <p className="lead">A bank could not trace a three-year-old Db2 backup. The finding was not that the backup was missing, but that nobody could show where it was.</p>
      <InlineNotification kind="warning" lowContrast hideCloseButton title="Illustrative figures"
        subtitle="Durations below describe the scenario shape and are illustrative, not measurements from any client." />

      <div className="kpi-grid">
        <KPICard title="Time to locate a backup" value="Days" note="Manual search by developers (illustrative)" icon={Time} tone="danger" />
        <KPICard title="Who does the search" value="Developers" note="Not DBAs or the audit team" icon={UserMultiple} tone="warning" />
        <KPICard title="Evidence trail" value="Ad hoc" note="Emails, screenshots, job logs" icon={DocumentUnknown} tone="danger" />
        <KPICard title="Audit outcome" value="Failed" note="Backup could not be traced in time" icon={WarningAlt} tone="danger" />
      </div>

      <h2>How it played out</h2>
      <ul className="pain-list">
        {PAIN.map((p) => <li key={p}>{p}</li>)}
      </ul>

      <h2>The target</h2>
      <Tile>
        <p>
          Locate and validate the backup in <strong>under 15 minutes</strong> instead of days, with <strong>100% auditable traceability</strong>:
          every step recorded with its source system and timestamp, so an auditor can re-check the answer without asking a developer.
        </p>
        <p style={{ marginTop: '1rem' }}>
          <Tag type="red">Today: days</Tag> <Tag type="green">Target: under 15 minutes</Tag> <Tag type="gray">Target, to be proven in a pilot</Tag>
        </p>
      </Tile>
    </main>
  );
}
