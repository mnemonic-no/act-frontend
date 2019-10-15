import { factTypeDetailsString } from './Timeline';

it('can make fact type details string', () => {
  expect(factTypeDetailsString([])).toEqual('');
  expect(factTypeDetailsString([{ kind: 'c' }, { kind: 'a' }, { kind: 'a' }, { kind: 'a' }, { kind: 'b' }])).toEqual(
    '3 a,1 b,1 c'
  );
});
