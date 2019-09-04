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

export const arrayToObjectWithIds = (inputArray: Array<any>) => {
  return inputArray.reduce(
    (acc, curr) => ({
      ...acc,
      [curr.id]: curr
    }),
    {}
  );
};

export const pluralize = (itemCount: number, suffix: string) => {
  return itemCount === 1 ? `${itemCount} ${suffix}` : `${itemCount} ${suffix}s`;
};

export const modifierKeysUsed = (event: MouseEvent) => {
  return event && (event.altKey || event.shiftKey || event.ctrlKey || event.metaKey);
};

/**
 * Batch and delay calls to a batchFn.
 *
 * Returns a function that takes a single item and will eventually call the batchFn with items from previously
 * invoked calls.
 *
 * @param batchFn  Function that handles a batch of T
 * @param delay    milliseconds to delay before calling the batchFn
 */
export const createBatcherFn = <T>(batchFn: (batch: Array<T>) => void, delay: number) => {
  let currentBatch: Array<T> = [];

  return (item: T) => {
    if (currentBatch.length === 0) {
      setTimeout(() => {
        batchFn(currentBatch);
        currentBatch = [];
      }, delay);
    }
    currentBatch.push(item);
  };
};