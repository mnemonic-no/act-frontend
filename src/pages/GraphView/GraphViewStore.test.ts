import { highlights, selectedNodeIds, selectionToCytoscapeNodeId } from './GraphViewStore';
import { actObject, fact } from '../../core/testHelper';

it('can highlight single fact', () => {
  expect(highlights([], {})).toEqual([]);

  expect(
    highlights(['someFactId'], {
      someFactId: fact({
        id: 'someFactId',
        timestamp: '2019-05-14T12:12:30.000Z',
        lastSeenTimestamp: '2019-05-14T12:12:30.000Z'
      })
    })
  ).toEqual([{ value: new Date('2019-05-14T12:12:30.000Z') }]);

  expect(highlights(['someFactId'], {})).toEqual([]);
});

it('can highlight multiple facts', () => {
  expect(
    highlights(['fact1', 'fact2'], {
      fact1: fact({
        id: 'fact1',
        timestamp: '2019-01-01T01:01:01.000Z',
        lastSeenTimestamp: '2019-02-02T02:02:00.000Z'
      }),
      fact2: fact({
        id: 'fact2',
        timestamp: '2019-04-04T04:04:04.000Z',
        lastSeenTimestamp: '2019-05-05T05:05:00.000Z'
      })
    })
  ).toEqual([{ value: new Date('2019-01-01T01:01:01.000Z') }, { value: new Date('2019-05-05T05:05:00.000Z') }]);
});

it('can convert selection to cytoscape node id', () => {
  expect(selectionToCytoscapeNodeId({ kind: 'object', id: 'x' })).toEqual('x');
  expect(selectionToCytoscapeNodeId({ kind: 'fact', id: 'x' })).toEqual('edge-x');
});

it('can convert list of selections to cytoscape node ids', () => {
  expect(selectedNodeIds([], { objects: {}, facts: {} })).toEqual(new Set([]));

  const fact1 = fact({ id: 'fact1' });
  const object1 = actObject({ id: 'object1' });

  expect(
    selectedNodeIds([{ kind: 'fact', id: fact1.id }, { kind: 'object', id: object1.id }], {
      objects: { [object1.id]: object1 },
      facts: { [fact1.id]: fact1 }
    })
  ).toEqual(new Set(['object1', 'edge-fact1']));
});

it('selections include any objects pointed to by selected one-legged facts ', () => {
  const object1 = actObject({ id: 'object1' });
  const nameFact = fact({ id: 'fact1', sourceObject: object1, destinationObject: undefined });

  expect(
    selectedNodeIds([{ kind: 'fact', id: nameFact.id }], {
      objects: { [object1.id]: object1 },
      facts: { [nameFact.id]: nameFact }
    })
  ).toEqual(new Set(['object1', 'edge-fact1']));
});
