// @ts-ignore
import { saveAs } from 'file-saver';
import { ActObject } from '../pages/types';
import config from '../config';
import * as _ from 'lodash/fp';

export const objectTypeToColor = (objectType: string) => config.objectColors[objectType] || 'inherit';

export const factColor = '#F84';

export const truncateText = (text: string, maxLength = 16) => {
  if (text.length > maxLength) {
    return `${text.substring(0, maxLength)}…`;
  }
  return text;
};

// If object.value is <sha256sum> (placeholder), show <object type>
export const renderObjectValue = (object: ActObject, maxLength = 16) => {
  if (object.value.match(/^\[placeholder\[[a-z0-9]{64}\]\]$/)) {
    return `<${object.type.name}>`;
  }
  return truncateText(object.value, maxLength);
};

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

export const fileTimeString = (dt: Date) => {
  return dt
    .toISOString()
    .replace(/:/g, '-')
    .substr(0, 19);
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

export const setUnion = <T>(a: Set<T>, b: Set<T>): Set<T> => {
  const unionized = new Set(a);
  for (const elem of b) {
    unionized.add(elem);
  }
  return unionized;
};

export const setSymmetricDifference = <T>(a: Set<T>, b: Set<T>) => {
  let diff = new Set(a);
  for (let elem of b) {
    if (diff.has(elem)) {
      diff.delete(elem);
    } else {
      diff.add(elem);
    }
  }
  return diff;
};

export function notUndefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}

export function isTruthy<T>(x: T | undefined | null): x is T {
  return Boolean(x);
}

export const byTypeThenName = (a: ActObject, b: ActObject) =>
  a.type.name + '' + a.value > b.type.name + '' + b.value ? 1 : -1;

export const replaceAll = (s: string, replacements: { [key: string]: string }) => {
  return Object.entries(replacements).reduce((acc: string, [searchFor, replaceWith]: [string, string]) => {
    return acc.replace(searchFor, replaceWith);
  }, s);
};

export const replaceAllInObject = (
  obj: { [key: string]: any } | undefined,
  replacements: { [key: string]: string }
) => {
  if (!obj) {
    return obj;
  }

  return _.mapValues(v => (typeof v === 'string' ? replaceAll(v, replacements) : v))(obj);
};

/**
 * The new clipboard API is currently only supported in Firefox and Chrome, so use the old
 * execCommand technique for now.
 *
 * @param text The text to copy to the clipboard
 */
export function copyToClipBoard(text: string) {
  const tempTextArea = document.createElement('textarea');

  tempTextArea.style.position = 'fixed';
  tempTextArea.style.top = '0';
  tempTextArea.style.left = '-10em';
  tempTextArea.style.width = '1em';
  tempTextArea.style.height = '1em';
  tempTextArea.style.background = 'transparent';
  tempTextArea.textContent = text;

  document.body.appendChild(tempTextArea);
  tempTextArea.select();
  document.execCommand('copy');
  document.body.removeChild(tempTextArea);
}
