import { pluralize, sanitizeCsvValue } from './util';

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
