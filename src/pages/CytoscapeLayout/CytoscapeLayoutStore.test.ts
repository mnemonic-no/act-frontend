import CytoscapeLayoutStore from './CytoscapeLayoutStore';

it('defaults are read from localStorage', () => {
  const noStore = new CytoscapeLayoutStore({ getItem: () => 'false' });
  expect(noStore.graphOptions.showFactEdgeLabels).toBeFalsy();
  expect(noStore.graphOptions.showRetractions).toBeFalsy();

  const yesStore = new CytoscapeLayoutStore({ getItem: () => 'true' });
  expect(yesStore.graphOptions.showFactEdgeLabels).toBeTruthy();
  expect(yesStore.graphOptions.showRetractions).toBeTruthy();
});

it('can change graph options', () => {
  const store = new CytoscapeLayoutStore({ getItem: () => null });
  expect(store.graphOptions.showFactEdgeLabels).toBeFalsy();
  store.toggleShowFactEdgeLabels();
  expect(store.graphOptions.showFactEdgeLabels).toBeTruthy();
});
