export function exportToJson<T>(data: T[], filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, `${filename}-${getDateString()}.json`);
}

export function exportToCsv<T>(
  data: T[],
  headers: { key: keyof T; label: string }[],
  filename: string
): void {
  const headerRow = headers.map((h) => h.label).join(',');
  const rows = data.map((item) =>
    headers
      .map((h) => formatCsvValue((item as Record<string, unknown>)[h.key as string]))
      .join(',')
  );
  const csv = [headerRow, ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `${filename}-${getDateString()}.csv`);
}

function formatCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function generateCsvContent<T>(
  data: T[],
  headers: { key: keyof T; label: string }[]
): string {
  const headerRow = headers.map((h) => h.label).join(',');
  const rows = data.map((item) =>
    headers
      .map((h) => formatCsvValue((item as Record<string, unknown>)[h.key as string]))
      .join(',')
  );
  return [headerRow, ...rows].join('\n');
}
