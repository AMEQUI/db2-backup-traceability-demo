import { useEffect, useMemo, useState } from 'react';
import { Tag } from '@carbon/react';
import { DataBackup, Time, Folder, WarningAlt } from '@carbon/icons-react';
import KPICard from '../components/KPICard.jsx';
import ChartPanel from '../components/ChartPanel.jsx';
import DataTableView from '../components/DataTableView.jsx';
import { BACKUPS, MONTHLY, AS_OF, RETENTION_DAYS, longDate } from '../data/scenarios.js';
import { IBM_COLORS } from '../utils/formatters.js';

const COLUMNS = [
  { key: 'copyDate', header: 'Copy date' },
  { key: 'tablespace', header: 'Object' },
  { key: 'jobName', header: 'Job' },
  { key: 'dataset', header: 'Dataset' },
  { key: 'tier', header: 'Tier' },
  { key: 'volser', header: 'Volume' },
  { key: 'evidenceSource', header: 'Evidence source' },
  { key: 'status', header: 'Status' },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  // Mock mode: data is bundled; a short delay exercises the loading state honestly.
  useEffect(() => { const t = setTimeout(() => setLoading(false), 350); return () => clearTimeout(t); }, []);

  const stats = useMemo(() => {
    const inCatalog = BACKUPS.filter((b) => b.evidenceSource === 'SYSCOPY').length;
    const viaAddi = BACKUPS.filter((b) => b.evidenceSource === 'ADDI lineage' && b.status !== 'gap').length;
    const gaps = BACKUPS.filter((b) => b.status === 'gap').length;
    return { total: BACKUPS.length, inCatalog, viaAddi, gaps };
  }, []);

  const rows = useMemo(() => [...BACKUPS].sort((a, b) => a.copyDate.localeCompare(b.copyDate)).map((b) => ({ ...b })), []);

  return (
    <main className="page">
      <h1>Backup traceability</h1>
      <p className="lead">
        Month-end Db2 image copies for six core objects of a fictional bank, as of {longDate(AS_OF)}.
        Only {RETENTION_DAYS} days of history remain in the Db2 catalog, so older backups are no longer visible there.
      </p>

      <div className="kpi-grid">
        <KPICard title="Image copies tracked" value={stats.total} note="37 month-ends x 6 objects (synthetic)" icon={DataBackup} />
        <KPICard title="Visible in Db2 catalog" value={stats.inCatalog} note={`Within ${RETENTION_DAYS}-day retention (illustrative)`} icon={Folder} tone="warning" />
        <KPICard title="Recovered via ADDI lineage" value={stats.viaAddi} note="Older than the catalog history" icon={Time} />
        <KPICard title="Gaps (cannot be proven)" value={stats.gaps} note="Job ran, dataset missing. Reported, not hidden" icon={WarningAlt} tone="danger" />
      </div>

      <div className="two-col">
        <ChartPanel
          type="stackedBar"
          title="Where the evidence for each month-end comes from"
          loading={loading}
          data={MONTHLY}
          height="340px"
          colors={{
            'Db2 catalog (SYSCOPY)': IBM_COLORS.blue,
            'Recovered via ADDI lineage': IBM_COLORS.teal,
            'Gap (not provable)': IBM_COLORS.red,
          }}
          options={{ axes: { left: { mapsTo: 'value', stacked: true, title: 'objects' }, bottom: { mapsTo: 'key', scaleType: 'labels' } }, legend: { alignment: 'center', truncation: { type: 'none' } } }}
        />
        <div>
          <h2 style={{ marginTop: 0 }}>Reading this chart</h2>
          <p className="muted">
            Blue is what the Db2 catalog can still prove on its own. Teal is what is only recoverable by tracing job and
            program lineage with IBM Application Discovery and Delivery Intelligence (ADDI). Red marks the two cases in this
            dataset where nothing can be proven, which the demo reports as findings.
          </p>
          <Tag type="cool-gray" size="md">Synthetic data, seed 42</Tag>
        </div>
      </div>

      <h2>Image copy inventory</h2>
      <DataTableView
        title="Db2 image copy inventory"
        description="Search by object, job, dataset or status."
        columns={COLUMNS}
        rows={rows}
        loading={loading}
        pageSize={8}
        csvName="db2-image-copy-inventory-synthetic.csv"
      />
    </main>
  );
}
