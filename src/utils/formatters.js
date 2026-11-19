export const IBM_COLORS = {
  blue: '#0f62fe',
  purple: '#6929c4',
  teal: '#005d5d',
  magenta: '#9f1853',
  red: '#fa4d56',
  green: '#198038',
  yellow: '#f1c21b',
};

export function toCsv(rows, columns) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [columns.map((c) => esc(c.header)).join(','), ...rows.map((r) => columns.map((c) => esc(r[c.key])).join(','))].join('\n');
}

export function downloadBlob(text, filename, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
