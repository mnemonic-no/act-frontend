import * as sut from './WorkingHistoryStore';
import {
  MultiObjectTraverseSearch,
  ObjectFactsSearch,
  ObjectTraverseSearch,
  WorkingHistoryItem
} from '../../../core/types';
import { factColor } from '../../../util/util';
import { actObject, objectTypes } from '../../../core/testHelper';

const item = (args: { [key: string]: any }): WorkingHistoryItem => {
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
  expect(sut.stateExport([item({ id: 'Axiom', factTypeName: 'alias', kind: 'singleFact' })], new Set())).toEqual({
    version: '2.0.0',
    searches: [],
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
      [item({ search: objectFactsSearch }), item({ search: traverseSearch }), item({ search: filteredSearch })],
      new Set(['abcd', 'efgh'])
    )
  ).toEqual({
    version: '2.0.0',
    searches: [objectFactsSearch, traverseSearch, filteredSearch],
    prunedObjectIds: ['abcd', 'efgh']
  });

  const multiObjectTraverseSearch: MultiObjectTraverseSearch = {
    kind: 'multiObjectTraverse',
    objectType: 'threatActor',
    objectIds: ['x', 'y', 'z'],
    query: "g.in('resolvesTo').hasLabel('fqdn')"
  };

  expect(sut.stateExport([item({ search: multiObjectTraverseSearch })], new Set())).toEqual({
    version: '2.0.0',
    searches: [multiObjectTraverseSearch],
    prunedObjectIds: []
  });
});

it('can import working history', () => {
  expect(() => sut.parseStateExport(JSON.stringify({ version: '2.0.0', searches: [] }))).toThrow(
    "Validation failed: history export has no 'searches' property"
  );

  expect(() => sut.parseStateExport(JSON.stringify({ version: '2.0.0', searches: [{ bad: 'data' }] }))).toThrow(
    'Unsupport search found: {"bad":"data"}'
  );

  expect(
    sut.parseStateExport(
      JSON.stringify({
        version: '1.0.0',
        queries: [{ objectType: 'threatActor', objectValue: 'Axiom' }]
      })
    )
  ).toEqual({ version: '2.0.0', searches: [{ kind: 'objectFacts', objectType: 'threatActor', objectValue: 'Axiom' }] });

  expect(
    sut.parseStateExport(
      JSON.stringify({
        version: '2.0.0',
        searches: [
          {
            kind: 'multiObjectTraverse',
            objectType: 'threatActor',
            objectIds: ['x', 'y', 'z'],
            query: "g.in('resolvesTo').hasLabel('fqdn')"
          }
        ]
      })
    )
  ).toEqual({
    version: '2.0.0',
    searches: [
      {
        kind: 'multiObjectTraverse',
        objectType: 'threatActor',
        objectIds: ['x', 'y', 'z'],
        query: "g.in('resolvesTo').hasLabel('fqdn')"
      }
    ]
  });
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
      item({
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
      item({
        search: { kind: 'objectTraverse', objectType: 'threatActor', objectValue: 'Sofacy', query: 'a custom query' }
      }),
      predefinedQueryToName
    )
  ).toEqual({ kind: 'label-text', label: 'Query:', text: 'a custom query' });

  expect(
    sut.itemDetails(
      item({
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

  expect(sut.itemActions(item({}), removeFn, copyFn)).toEqual([
    { icon: 'remove', tooltip: 'Remove', onClick: removeFn }
  ]);

  expect(
    sut.itemActions(
      item({ search: { kind: 'objectTraverse', objectType: 'threatActor', objectValue: 'a', query: 'q' } }),
      removeFn,
      copyFn
    )
  ).toEqual([
    { icon: 'copy', tooltip: 'Copy query to clipboard', onClick: copyFn },
    { icon: 'remove', tooltip: 'Remove', onClick: removeFn }
  ]);

  expect(
    sut.itemActions(
      item({
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
