import { fileTimeString, pluralize, replaceAllInObject, sanitizeCsvValue, setSymmetricDifference } from './util';

it('can santize CSV value', () => {
  expect(sanitizeCsvValue('some;with;commas')).toEqual('"some;with;commas"');
  expect(sanitizeCsvValue('some"with"double"quotes')).toEqual('"some""with""double""quotes"');
  expect(sanitizeCsvValue('WITH \nLINE BREAK')).toEqual('"WITH \nLINE BREAK"');
});

it('can pluralize', () => {
  expect(pluralize(0, 'fact')).toEqual('0 facts');
  expect(pluralize(1, 'fact')).toEqual('1 fact');
  expect(pluralize(1, 'object')).toEqual('1 object');
  expect(pluralize(2, 'object')).toEqual('2 objects');
});

it('can find symmetric difference between sets', () => {
  expect(setSymmetricDifference(new Set(), new Set())).toEqual(new Set());
  expect(setSymmetricDifference(new Set([1, 2]), new Set([2, 1]))).toEqual(new Set([]));
  expect(setSymmetricDifference(new Set([1, 2]), new Set([]))).toEqual(new Set([1, 2]));
  expect(setSymmetricDifference(new Set([]), new Set([1, 2]))).toEqual(new Set([1, 2]));
  expect(setSymmetricDifference(new Set([1, 2]), new Set([2, 3]))).toEqual(new Set([1, 3]));
});

it('can replace items in an object', () => {
  expect(replaceAllInObject({}, {})).toEqual({});

  expect(
    replaceAllInObject(
      {
        typeOfObject: ':objectType',
        valueOfObject: ':objectValue',
        doNotReplace: 1234
      },
      { ':objectType': 'threatActor', ':objectValue': 'replacementValue' }
    )
  ).toEqual({ typeOfObject: 'threatActor', valueOfObject: 'replacementValue', doNotReplace: 1234 });
});

it('can make file time string', () => {
  expect(fileTimeString(new Date(2000, 1, 1, 10, 11, 12))).toEqual('2000-02-01T09-11-12');
});
