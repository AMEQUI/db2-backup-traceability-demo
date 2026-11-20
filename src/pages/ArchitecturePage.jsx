import { Tag, Tile, OrderedList, ListItem, StructuredListWrapper, StructuredListHead, StructuredListBody, StructuredListRow, StructuredListCell } from '@carbon/react';

// Plain flow: one request, five steps. `status` drives the tag colour.
const STEPS = [
  { n: 1, title: 'Ask', who: 'IBM watsonx Assistant for Z', what: 'The audit analyst asks in plain language where a three-year-old backup is.', status: 'Simulated' },
  { n: 2, title: 'Check the catalog', who: 'Db2 catalog (SYSCOPY)', what: 'Finds nothing: history older than the retention window is gone.', status: 'Synthetic data' },
  { n: 3, title: 'Find the lineage', who: 'IBM ADDI for IBM Z', what: 'Shows which batch job and program wrote that backup, and where.', status: 'Simulated' },
  { n: 4, title: 'Locate and validate', who: 'z/OS catalog, HSM, virtual tape', what: 'Finds the dataset and checks that the copy is readable and complete.', status: 'Synthetic data' },
  { n: 5, title: 'Seal the evidence', who: 'Evidence package', what: 'Every check is recorded with its source system and time. Exportable as JSON.', status: 'Built' },
];

const TAG_TYPE = { Built: 'green', Simulated: 'purple', 'Synthetic data': 'cool-gray', 'Not connected': 'red', 'Out of scope': 'gray' };

// What actually exists today, stated plainly.
const DEPLOYED = [
  ['This demo web app', 'Built', 'Static pages on GitHub Pages. Runs in the browser with no server.'],
  ['Evidence package and JSON export', 'Built', 'Created in the browser from the simulated checks.'],
  ['IBM watsonx Assistant for Z', 'Simulated', 'Scripted messages. The product is not installed or called.'],
  ['IBM ADDI for IBM Z', 'Simulated', 'Precomputed fictional lineage. The product is not installed or called.'],
  ['Db2 for z/OS and z/OS storage', 'Not connected', 'No bank system is touched. The 222 image copies are synthetic (seed 42).'],
  ['REST APIs and watsonx.ai', 'Out of scope', 'Not used anywhere in this demo.'],
];

const NEXT = [
  ['Agree the scope (Sprint 0, 2 to 3 days)', 'One Db2 subsystem, the named applications to scan in ADDI, and 10 real historical backup requests to trace.'],
  ['Confirm what is possible', 'Verify ADDI and Assistant for Z capabilities and prerequisites with the product teams. Agree read-only access and security approvals.'],
  ['Measure today', 'Time how long a three-year-old backup takes to locate and validate now, and how many developer hours it uses. This is the baseline.'],
  ['Run the pilot (weeks 1 to 4)', 'Connect the real products on non-production data first, trace the 10 requests, and report against the success criteria.'],
];

export default function ArchitecturePage() {
  return (
    <main className="page">
      <h1>Architecture</h1>
      <p className="lead">
        One request, five steps. The two IBM Z products are shown as simulated screens, and no bank system is connected. This page says
        plainly what exists today and what a pilot would add.
      </p>

      <h2>How one request flows</h2>
      <ol className="arch-flow" aria-label="Request flow in five steps">
        {STEPS.map((s) => (
          <li key={s.n} className="arch-step">
            <span className="arch-step__n" aria-hidden="true">{s.n}</span>
            <h3 className="arch-step__title">{s.title}</h3>
            <p className="arch-step__who">{s.who}</p>
            <p>{s.what}</p>
            <Tag size="sm" type={TAG_TYPE[s.status]}>{s.status}</Tag>
          </li>
        ))}
      </ol>

      <h2>What is deployed today</h2>
      <StructuredListWrapper aria-label="What is deployed today">
        <StructuredListHead>
          <StructuredListRow head>
            <StructuredListCell head>Item</StructuredListCell>
            <StructuredListCell head>Status</StructuredListCell>
            <StructuredListCell head>In plain terms</StructuredListCell>
          </StructuredListRow>
        </StructuredListHead>
        <StructuredListBody>
          {DEPLOYED.map(([item, status, note]) => (
            <StructuredListRow key={item}>
              <StructuredListCell noWrap>{item}</StructuredListCell>
              <StructuredListCell><Tag size="sm" type={TAG_TYPE[status]}>{status}</Tag></StructuredListCell>
              <StructuredListCell>{note}</StructuredListCell>
            </StructuredListRow>
          ))}
        </StructuredListBody>
      </StructuredListWrapper>

      <h2>Conclusion and next steps with the client</h2>
      <Tile className="conclusion">
        <p>
          <strong>What this demo shows:</strong> the flow, not the products. A three-year-old Db2 backup can be located and validated as one
          traceable conversation, and a backup that cannot be proven is reported as a finding, with the evidence.
        </p>
        <p>
          <strong>What we still have to prove:</strong> the target of under 15 minutes with 100% auditable traceability. The times shown here are
          simulated and illustrative, not measured.
        </p>
        <h3>What happens next</h3>
        <OrderedList>
          {NEXT.map(([t, d]) => (
            <ListItem key={t}><strong>{t}.</strong> {d}</ListItem>
          ))}
        </OrderedList>
        <h3>What we need from the bank</h3>
        <p>
          A Db2 / z/OS DBA, a mainframe application owner, an internal audit reviewer, read-only access, and a decision on which backups to
          trace first. Outcome in 3 to 4 weeks: measured results against the agreed criteria, with a go or no-go for wider rollout.
        </p>
      </Tile>
    </main>
  );
}
