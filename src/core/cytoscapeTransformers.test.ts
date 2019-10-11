import { oneLeggedFactToCytoscapeEdge } from './cytoscapeTransformers';
import { fact } from './testHelper';

it('can transform one-legged fact to cytoscape node', () => {
  const theFact = fact({
    id: 'theFact',
    type: { id: 'abc', name: 'alias' },
    value: 'some value',
    sourceObject: { id: 'xyz', name: 'the source object' },
    destinationObject: undefined
  });
  expect(oneLeggedFactToCytoscapeEdge(theFact)).toEqual({
    group: 'edges',
    data: {
      factId: theFact.id,
      id: 'edge-' + theFact.id,
      isBiDirectional: false,
      isFact: true,
      label: 'alias: some value',
      oneLegged: true,
      source: 'xyz',
      target: 'xyz'
    }
  });
});
