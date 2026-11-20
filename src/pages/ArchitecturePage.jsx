import { Tag, StructuredListWrapper, StructuredListHead, StructuredListBody, StructuredListRow, StructuredListCell } from '@carbon/react';
import MermaidDiagram from '../components/MermaidDiagram.jsx';
import architectureSource from '../../ARQUITECTURE_3.md?raw';

const BASE = import.meta.env.BASE_URL;

const TAG_TYPE = { Built: 'green', Simulated: 'purple', 'Not connected': 'red', 'Out of scope': 'gray' };

// What actually exists today, stated plainly.
const DEPLOYED = [
  ['This demo web app', 'Built', 'Static pages on GitHub Pages. Runs in the browser with no server.'],
  ['Evidence package and JSON export', 'Built', 'Created in the browser from the simulated checks.'],
  ['IBM watsonx Assistant for Z', 'Simulated', 'Scripted messages. The product is not installed or called.'],
  ['IBM ADDI for IBM Z', 'Simulated', 'Precomputed fictional lineage. The product is not installed or called.'],
  ['Db2 for z/OS and z/OS storage', 'Not connected', 'No bank system is touched. The 222 image copies are synthetic (seed 42).'],
  ['REST APIs and watsonx.ai', 'Out of scope', 'Not used anywhere in this demo.'],
];

export default function ArchitecturePage() {
  return (
    <main className="page">
      <h1>Architecture</h1>
      <p className="lead">
        How one request flows. The two IBM Z products are shown as simulated screens, and no bank system is connected.
      </p>

      <figure className="diagram diagram--mermaid">
        <MermaidDiagram
          id="arch-diagram"
          source={architectureSource}
          label="IBM watsonx Assistant for Z, simulated. An audit analyst asks in plain language. The assistant runs four steps: catalog lookup, lineage when the catalog is empty, locate and validate, and seal evidence. IBM ADDI for IBM Z supplies simulated lineage. A fictional IBM Z estate holds the Db2 catalog, batch jobs and z/OS storage. A DBA reviews the evidence package."
        />
      </figure>

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
      <figure className="diagram">
        <img
          id="conclusion-diagram"
          src={`${BASE}diagrams/conclusion.svg`}
          width="1536"
          height="1024"
          alt="Conclusion and next steps with the client. This demo shows the flow, not the products. Still to prove: under 15 minutes with 100 percent auditable traceability, simulated and illustrative. Next: 1 agree the scope in Sprint 0, 2 to 3 days; 2 confirm what is possible; 3 measure today; 4 run the pilot in weeks 1 to 4. The bank provides a Db2 and z/OS DBA, a mainframe application owner, an internal audit reviewer and read-only access. Goal: validate value with real data and define the path to scale."
        />
      </figure>
    </main>
  );
}
