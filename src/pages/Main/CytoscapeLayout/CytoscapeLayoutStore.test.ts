import CytoscapeLayoutStore from './CytoscapeLayoutStore';

it('defaults are read from localStorage', () => {
  const noStore = new CytoscapeLayoutStore({ getItem: () => 'false', setItem: () => {} });
  expect(noStore.showFactEdgeLabels).toBeFalsy();

  const yesStore = new CytoscapeLayoutStore({ getItem: () => 'true', setItem: () => {} });
  expect(yesStore.showFactEdgeLabels).toBeTruthy();
});

it('can change options', () => {
  const store = new CytoscapeLayoutStore({ getItem: () => null, setItem: () => {} });
  expect(store.showFactEdgeLabels).toBeFalsy();
  store.toggleShowFactEdgeLabels();
  expect(store.showFactEdgeLabels).toBeTruthy();
});
