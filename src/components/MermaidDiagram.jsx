import { useEffect, useId, useRef, useState } from 'react';
import { InlineLoading, InlineNotification } from '@carbon/react';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'base', flowchart: { useMaxWidth: true, htmlLabels: true } });

// Renders the first ```mermaid block of a markdown source (ARQUITECTURE_3.md) as an inline SVG.
export default function MermaidDiagram({ source, id, label }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const host = useRef(null);
  const [state, setState] = useState({ status: 'loading', error: '' });

  useEffect(() => {
    let live = true;
    const raw = /```mermaid\r?\n([\s\S]*?)```/.exec(source)?.[1];
    if (!raw) { setState({ status: 'error', error: 'No mermaid block found in the architecture file.' }); return undefined; }
    // Mermaid would read a label such as "1. Catalog lookup" as a markdown list; escape the dot (#46;) so it prints as text.
    const code = raw.replace(/"(\d+)\. /g, '"$1#46; ');
    mermaid.render(`m${uid}`, code)
      .then(({ svg }) => {
        if (!live || !host.current) return;
        // Attach parsed DOM nodes (no innerHTML): mermaid output is sanitised by securityLevel "strict".
        const el = new DOMParser().parseFromString(svg, 'text/html').querySelector('svg');
        if (!el) throw new Error('Mermaid returned no SVG.');
        host.current.replaceChildren(document.importNode(el, true));
        setState({ status: 'ready', error: '' });
      })
      .catch((e) => { if (live) setState({ status: 'error', error: String(e.message || e) }); });
    return () => { live = false; };
  }, [source, uid]);

  return (
    <>
      {state.status === 'error' && (
        <InlineNotification kind="error" title="Diagram unavailable" subtitle={state.error} hideCloseButton lowContrast />
      )}
      {state.status === 'loading' && <InlineLoading description="Rendering diagram" />}
      <div ref={host} id={id} className="mermaid-diagram" role="img" aria-label={label} hidden={state.status !== 'ready'} />
    </>
  );
}
