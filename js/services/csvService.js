// Xuất CSV phía client — không có backend, dữ liệu xuất ra chính là dữ liệu đang lọc trên
// dashboard (KPI/biểu đồ/bảng/CSV dùng chung một tập dữ liệu, không tạo số riêng cho file xuất).
function escapeCsvCell(value) {
  const s = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows, columns) {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(',');
  const lines = rows.map((row) => columns.map((c) => escapeCsvCell(typeof c.value === 'function' ? c.value(row) : row[c.key])).join(','));
  return [header, ...lines].join('\r\n');
}

/** Thêm BOM để Excel đọc đúng tiếng Việt có dấu. */
export function downloadCsv(filename, csvText) {
  const blob = new Blob([`﻿${csvText}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const CsvService = { toCsv, downloadCsv };
