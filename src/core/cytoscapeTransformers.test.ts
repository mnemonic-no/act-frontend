import * as sut from './cytoscapeTransformers';
import { actObject, fact, objectTypes } from './testHelper';

it('can transform one-legged fact to cytoscape node', () => {
  const theFact = fact({
    id: 'theFact',
    type: { id: 'abc', name: 'alias' },
    value: 'some value',
    sourceObject: { id: 'xyz', name: 'the source object' },
    destinationObject: undefined
  });
  expect(sut.oneLeggedFactToCytoscapeEdge(theFact)).toEqual({
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

it('object and facts to cytoscape elements ', () => {
  expect(
    sut.objectFactsToElements({
      facts: [],
      objects: [],
      objectLabelFromFactType: null,
      shortenObjectLabels: true
    })
  ).toEqual([]);

  expect(
    sut.objectFactsToElements({
      facts: [],
      objects: [
        actObject({ id: 'abc', type: objectTypes.threatActor, value: 'Some very long name will be shortened' })
      ],
      objectLabelFromFactType: null,
      shortenObjectLabels: true
    })
  ).toEqual([
    {
      classes: 'threatActor',
      group: 'nodes',
      data: {
        id: 'abc',
        isFact: false,
        label: 'Some very long n…',
        type: 'threatActor',
        value: 'Some very long name will be shortened'
      }
    }
  ]);
});
