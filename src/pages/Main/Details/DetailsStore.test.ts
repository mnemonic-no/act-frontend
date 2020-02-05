import * as sut from './DetailsStore';
import { fact, factTypes } from '../../../core/testHelper';

it('fact type links', () => {
  expect(sut.factTypeLinks([], () => {})).toEqual([]);

  const alias1 = fact({ id: 'a', type: factTypes.alias });
  const alias2 = fact({ id: 'b', type: factTypes.alias });
  const mentions = fact({ id: 'c', type: factTypes.mentions });
  const onClick = () => {};
  expect(sut.factTypeLinks([alias1, alias2, mentions], onClick).map(x => x.text)).toEqual(['2 alias', '1 mentions']);
});

it('can get contentsKind based on selection', () => {
  expect(sut.selectionToContentsKind({})).toEqual('empty');
  expect(sut.selectionToContentsKind({ a: { id: 'a', kind: 'fact' } })).toEqual('fact');
  expect(sut.selectionToContentsKind({ a: { id: 'a', kind: 'object' } })).toEqual('object');
  expect(sut.selectionToContentsKind({ a: { id: 'a', kind: 'object' }, b: { id: 'b', kind: 'fact' } })).toEqual(
    'multi'
  );
  expect(sut.selectionToContentsKind({ a: { id: 'a', kind: 'object' }, b: { id: 'b', kind: 'object' } })).toEqual(
    'multi'
  );
  expect(sut.selectionToContentsKind({ a: { id: 'a', kind: 'fact' }, b: { id: 'b', kind: 'fact' } })).toEqual('multi');
});
