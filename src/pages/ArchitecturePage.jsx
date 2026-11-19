import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { StructuredListWrapper, StructuredListHead, StructuredListBody, StructuredListRow, StructuredListCell, InlineNotification } from '@carbon/react';

const DIAGRAM = `graph TB
  subgraph People["Users"]
    AUD["Audit analyst"]
    DBA["DBA / mainframe owner"]
  end
  subgraph Conv["Conversation layer"]
    WXA["IBM watsonx Assistant for Z<br/>(simulated in this demo)"]
  end
  subgraph Disc["Discovery layer"]
    ADDI["IBM Application Discovery and Delivery Intelligence for IBM Z<br/>(simulated: job to program to Db2 object lineage)"]
  end
  subgraph Z["IBM Z estate (fictional)"]
    SYSCOPY["Db2 catalog SYSCOPY<br/>limited history"]
    JOBS["Batch jobs and COPY utility runs"]
    STORE["z/OS catalog, HSM, virtual tape"]
  end
  subgraph Ev["Evidence"]
    PKG["Evidence package<br/>source + timestamp per check"]
  end
  AUD -->|asks in plain language| WXA
  DBA -->|reviews| PKG
  WXA -->|1. catalog lookup| SYSCOPY
  WXA -->|2. lineage when catalog is empty| ADDI
  ADDI --> JOBS
  WXA -->|3. locate and validate| STORE
  WXA -->|4. seal| PKG
  style WXA fill:#0f62fe,color:#fff
  style ADDI fill:#6929c4,color:#fff
  style PKG fill:#198038,color:#fff`;

const INVENTORY = [
  ['Carbon React UI', 'Dashboard, scenario runner, simulated assistant chat, evidence panel', 'Built (static, GitHub Pages)'],
  ['IBM watsonx Assistant for Z', 'Conversational entry point for the audit question', 'Simulated: scripted messages. No product call'],
  ['IBM ADDI for IBM Z', 'Lineage from batch job and program to Db2 object', 'Simulated: precomputed fictional output'],
  ['Db2 for z/OS catalog / z/OS storage', 'SYSCOPY history, dataset, HSM and tape locations', 'Synthetic data (seed 42), 222 image copies'],
  ['Evidence package', 'Per-check source system, timestamp, outcome; JSON export', 'Built (client-side)'],
  ['REST APIs / watsonx.ai', 'Out of scope for this demo', 'Not used'],
];

export default function ArchitecturePage() {
  const ref = useRef(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let live = true;
    mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'strict' });
    mermaid
      .render('arch-diagram', DIAGRAM)
      .then(({ svg }) => { if (live && ref.current) ref.current.innerHTML = svg; })
      .catch((e) => live && setErr(e.message));
    return () => { live = false; };
  }, []);

  return (
    <main className="page">
      <h1>Architecture</h1>
      <p className="lead">
        The target flow, with the two IBM Z products shown as simulated screens. A pilot would connect them to the bank&apos;s
        real ADDI project and Db2 subsystem; this demo does neither.
      </p>
      {err ? <InlineNotification kind="error" lowContrast hideCloseButton title="Diagram failed" subtitle={err} /> : null}
      <div className="mermaid-wrap" ref={ref} role="img" aria-label="Architecture diagram" />

      <h2>Component inventory</h2>
      <StructuredListWrapper aria-label="Component inventory">
        <StructuredListHead>
          <StructuredListRow head>
            <StructuredListCell head>Component</StructuredListCell>
            <StructuredListCell head>Role</StructuredListCell>
            <StructuredListCell head>Status in this demo</StructuredListCell>
          </StructuredListRow>
        </StructuredListHead>
        <StructuredListBody>
          {INVENTORY.map(([a, b, c]) => (
            <StructuredListRow key={a}>
              <StructuredListCell noWrap>{a}</StructuredListCell>
              <StructuredListCell>{b}</StructuredListCell>
              <StructuredListCell>{c}</StructuredListCell>
            </StructuredListRow>
          ))}
        </StructuredListBody>
      </StructuredListWrapper>
    </main>
  );
}
