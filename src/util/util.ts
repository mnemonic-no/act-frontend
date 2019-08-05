// @ts-ignore
import { saveAs } from 'file-saver';

export const sanitizeCsvValue = (v: any): string => {
  const input = v === null ? '' : v.toString();
  let result = input.replace(/"/g, '""');
  if (result.search(/([;"\n])/g) >= 0) {
    result = '"' + result + '"';
  }
  return result;
};

export const toCsvString = (rows: string[][]) => {
  return rows
    .map(row => row.map(sanitizeCsvValue))
    .map(row => row.join(';'))
    .join('\n');
};

export const exportToCsv = (filename: string, rows: string[][]) => {
  const CSV = toCsvString(rows);
  const blob = new window.Blob(['\uFEFF' + CSV], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, filename);
};

export const exportToJson = (filename: string, data: any) => {
  const blob = new window.Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  saveAs(blob, filename);
};
