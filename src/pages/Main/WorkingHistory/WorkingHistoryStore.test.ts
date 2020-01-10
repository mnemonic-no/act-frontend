import * as sut from './WorkingHistoryStore';
import { ObjectFactsSearch, ObjectTraverseSearch, WorkingHistoryItem } from '../../../core/types';
import { factColor } from '../../../util/util';
import { actObject, objectTypes } from '../../../core/testHelper';

const searchItem = (args: { [key: string]: any }): WorkingHistoryItem => {
  return {
    ...{
      id: '123',
      result: { facts: {}, objects: {} },
      search: { id: 'Axiom', factTypeName: 'alias', kind: 'singleFact' }
    },
    ...args
  };
};

it('can export query history', () => {
  expect(sut.stateExport([searchItem({ id: 'Axiom', factTypeName: 'alias', kind: 'singleFact' })], new Set())).toEqual({
    version: '1.0.0',
    queries: [],
    prunedObjectIds: []
  });

  const objectFactsSearch: ObjectFactsSearch = { objectType: 'threatActor', objectValue: 'Axiom', kind: 'objectFacts' };
  const traverseSearch: ObjectTraverseSearch = {
    kind: 'objectTraverse',
    objectType: 'threatActor',
    objectValue: 'Sofacy',
    query:
      "g.optional(emit().repeat(outE('alias').otherV()).until(cyclicPath())).repeat(inE('attributedTo').otherV()).times(2).inE('observedIn').otherV().hasLabel('content').outE('classifiedAs').otherV().where(outE().has('value','malware')).where(inE('classifiedAs').otherV().outE('observedIn').otherV().repeat(outE('attributedTo').otherV()).times(2).count().is(eq(1L))).optional(emit().repeat(outE('alias').otherV()).until(cyclicPath())).inE('classifiedAs').otherV().outE().hasLabel(within('at','connectsTo')).otherV().inE('componentOf').otherV().hasLabel(within('fqdn','ipv4','ipv6')).not(where(outE().has('value','sinkhole'))).path().unfold()"
  };
  const filteredSearch: ObjectFactsSearch = {
    kind: 'objectFacts',
    objectType: 'report',
    objectValue: 'abcdef',
    factTypes: ['mentions']
  };

  expect(
    sut.stateExport(
      [
        searchItem({ search: objectFactsSearch }),
        searchItem({ search: traverseSearch }),
        searchItem({ search: filteredSearch })
      ],
      new Set(['abcd', 'efgh'])
    )
  ).toEqual({
    version: '1.0.0',
    queries: [objectFactsSearch, traverseSearch, filteredSearch],
    prunedObjectIds: ['abcd', 'efgh']
  });
});

it('can import working history', () => {
  expect(() => sut.parseStateExport(JSON.stringify({ version: '1.0.0', queries: [] }))).toThrow(
    "Validation failed: history export has no 'queries'"
  );

  expect(() => sut.parseStateExport(JSON.stringify({ version: '1.0.0', queries: [{ bad: 'data' }] }))).toThrow(
    'Queries must have objectType and objectValue: {"bad":"data"}'
  );

  expect(
    sut.parseStateExport(
      JSON.stringify({
        version: '1.0.0',
        queries: [{ objectType: 'threatActor', objectValue: 'Axiom' }]
      })
    )
  ).toEqual({ version: '1.0.0', queries: [{ objectType: 'threatActor', objectValue: 'Axiom' }] });
});

it('working history item title', () => {
  expect(sut.itemTitle({ id: 'a', factTypeName: 'alias', kind: 'singleFact' })).toEqual([
    { text: 'Fact ', color: factColor },
    { text: 'alias' }
  ]);
  expect(sut.itemTitle({ objectType: 'threatActor', objectValue: 'Sofacy', kind: 'objectFacts' })).toEqual([
    { text: 'threatActor ', color: '#606' },
    { text: 'Sofacy' }
  ]);
  expect(
    sut.itemTitle({ kind: 'multiObjectTraverse', objectType: 'threatActor', objectIds: ['a', 'b'], query: 'something' })
  ).toEqual([{ text: 'threatActor ', color: '#606' }, { text: '2 objects' }]);
});

it('working history item details', () => {
  const predefinedQueryToName = { 'some query': 'tools' };
  expect(
    sut.itemDetails(
      searchItem({
        search: {
          objectType: 'threatActor',
          objectValue: 'Sofacy',
          query: 'some query',
          kind: 'objectTraverse'
        }
      }),
      predefinedQueryToName
    )
  ).toEqual({ kind: 'tag', label: 'Query:', text: 'tools' });

  expect(
    sut.itemDetails(
      searchItem({
        search: { kind: 'objectTraverse', objectType: 'threatActor', objectValue: 'Sofacy', query: 'a custom query' }
      }),
      predefinedQueryToName
    )
  ).toEqual({ kind: 'label-text', label: 'Query:', text: 'a custom query' });

  expect(
    sut.itemDetails(
      searchItem({
        search: {
          kind: 'multiObjectTraverse',
          objectType: 'threatActor',
          objectIds: ['a', 'b'],
          query: 'a custom query'
        }
      }),
      predefinedQueryToName
    )
  ).toEqual({ kind: 'label-text', label: 'Query:', text: 'a custom query' });
});

it('working history item actions', () => {
  const removeFn = () => {};
  const copyFn = () => {};

  expect(sut.itemActions(searchItem({}), removeFn, copyFn)).toEqual([
    { icon: 'remove', tooltip: 'Remove', onClick: removeFn }
  ]);

  expect(
    sut.itemActions(
      searchItem({ search: { kind: 'objectTraverse', objectType: 'threatActor', objectValue: 'a', query: 'q' } }),
      removeFn,
      copyFn
    )
  ).toEqual([
    { icon: 'copy', tooltip: 'Copy query to clipboard', onClick: copyFn },
    { icon: 'remove', tooltip: 'Remove', onClick: removeFn }
  ]);

  expect(
    sut.itemActions(
      searchItem({
        search: { kind: 'multiObjectTraverse', objectType: 'threatActor', objectIds: ['a', 'b'], query: 'something' }
      }),
      removeFn,
      copyFn
    )
  ).toEqual([
    { icon: 'copy', tooltip: 'Copy query to clipboard', onClick: copyFn },
    { icon: 'remove', tooltip: 'Remove', onClick: removeFn }
  ]);
});

it('search to selection', () => {
  expect(
    sut.searchToSelection({ kind: 'singleFact', id: 'Axiom', factTypeName: 'alias' }, { facts: {}, objects: {} })
  ).toEqual({ Axiom: { kind: 'fact', id: 'Axiom' } });

  expect(
    sut.searchToSelection(
      { objectType: 'threatActor', objectValue: 'Sofacy', kind: 'objectFacts' },
      { facts: {}, objects: { '123': actObject({ id: '123', type: objectTypes.threatActor, value: 'Sofacy' }) } }
    )
  ).toEqual({ '123': { kind: 'object', id: '123' } });
});
