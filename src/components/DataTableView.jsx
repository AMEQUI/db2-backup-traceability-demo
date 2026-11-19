import { useMemo, useState } from 'react';
import {
  DataTable, DataTableSkeleton, Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
  TableContainer, TableToolbar, TableToolbarContent, TableToolbarSearch, Pagination, Tag, Button,
  InlineNotification,
} from '@carbon/react';
import { Download } from '@carbon/icons-react';
import { toCsv, downloadBlob } from '../utils/formatters.js';

const STATUS_COLOR = { validated: 'green', located: 'teal', gap: 'red' };

/**
 * columns: [{ key, header, render?(value,row) }]; rows need a unique `id`.
 * A column with key 'status' (or listed in tagKeys) renders as a colored Tag.
 */
export default function DataTableView({
  title, description, columns, rows, loading, error, pageSize = 8, csvName = 'export.csv',
  tagKeys = ['status'], onRowClick, selectedId,
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows || [];
    return (rows || []).filter((r) => columns.some((c) => String(r[c.key] ?? '').toLowerCase().includes(q)));
  }, [rows, search, columns]);

  const pageRows = filtered.slice((page - 1) * size, page * size);
  const exportCsv = () => downloadBlob(toCsv(filtered, columns), csvName, 'text/csv;charset=utf-8');

  if (loading) return <DataTableSkeleton columnCount={columns.length} rowCount={5} showToolbar={false} />;
  if (error) return <InlineNotification kind="error" lowContrast hideCloseButton title="Could not load table" subtitle={String(error)} />;

  const headers = columns.map((c) => ({ key: c.key, header: c.header }));
  const tableRows = pageRows.map((r) => ({ ...r, id: String(r.id) }));

  return (
    <DataTable rows={tableRows} headers={headers} isSortable={false}>
      {({ rows: rs, headers: hs, getTableProps, getHeaderProps, getRowProps }) => (
        <TableContainer title={title} description={description}>
          <TableToolbar aria-label={`${title || 'Table'} toolbar`}>
            <TableToolbarContent>
              <TableToolbarSearch
                persistent
                placeholder="Search"
                onChange={(e) => { setSearch(e?.target?.value || ''); setPage(1); }}
              />
              <Button kind="ghost" size="sm" renderIcon={Download} onClick={exportCsv}>Export CSV</Button>
            </TableToolbarContent>
          </TableToolbar>
          <Table {...getTableProps()} size="md">
            <TableHead>
              <TableRow>
                {hs.map((h) => {
                  const { key, ...rest } = getHeaderProps({ header: h });
                  return <TableHeader key={key} {...rest}>{h.header}</TableHeader>;
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {rs.length === 0 ? (
                <TableRow><TableCell colSpan={columns.length}>No matching records.</TableCell></TableRow>
              ) : rs.map((row) => {
                const { key, ...rowProps } = getRowProps({ row });
                const src = pageRows.find((r) => String(r.id) === row.id) || {};
                return (
                  <TableRow
                    key={key}
                    {...rowProps}
                    className={selectedId === src.id ? 'row-selected' : ''}
                    onClick={onRowClick ? () => onRowClick(src) : undefined}
                    style={onRowClick ? { cursor: 'pointer' } : undefined}
                  >
                    {row.cells.map((cell) => {
                      const col = columns.find((c) => c.key === cell.info.header);
                      const raw = src[cell.info.header];
                      if (col?.render) return <TableCell key={cell.id}>{col.render(raw, src)}</TableCell>;
                      if (tagKeys.includes(cell.info.header)) {
                        return (
                          <TableCell key={cell.id}>
                            <Tag type={STATUS_COLOR[raw] || 'gray'} size="sm">{String(raw)}</Tag>
                          </TableCell>
                        );
                      }
                      return <TableCell key={cell.id}>{cell.value}</TableCell>;
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filtered.length > size ? (
            <Pagination
              page={page}
              pageSize={size}
              pageSizes={[5, 8, 10, 20]}
              totalItems={filtered.length}
              onChange={({ page: p, pageSize: s }) => { setPage(p); setSize(s); }}
            />
          ) : null}
        </TableContainer>
      )}
    </DataTable>
  );
}
