import { selectedNodeIds, selectionToCytoscapeNodeId } from './GraphViewStore';
import { actObject, fact } from '../../../core/testHelper';

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
