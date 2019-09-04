import SelectionStore from './SelectionStore';

it('can set single selection', () => {
  const store = new SelectionStore();
  expect(store.currentlySelected).toEqual({});
  store.setCurrentSelection({ id: 'a', kind: 'object' });
  expect(store.currentlySelected).toEqual({ a: { id: 'a', kind: 'object' } });
});

it('can set selection', () => {
  const store = new SelectionStore();
  expect(store.currentlySelected).toEqual({});
  store.setCurrentlySelected({
    a: { id: 'a', kind: 'object' },
    b: { id: 'b', kind: 'fact' },
    c: { id: 'c', kind: 'fact' }
  });
  expect(store.currentlySelected).toEqual({
    a: { id: 'a', kind: 'object' },
    b: { id: 'b', kind: 'fact' },
    c: { id: 'c', kind: 'fact' }
  });
});

it('can clear selection', () => {
  const store = new SelectionStore();
  store.setCurrentSelection({ id: 'a', kind: 'object' });
  store.clearSelection();
  expect(store.currentlySelected).toEqual({});
});

it('can remove from selection', () => {
  const store = new SelectionStore();
  expect(store.currentlySelected).toEqual({});
  store.setCurrentlySelected({
    a: { id: 'a', kind: 'object' },
    b: { id: 'b', kind: 'fact' },
    c: { id: 'c', kind: 'fact' }
  });

  store.removeFromSelection({ id: 'b', kind: 'fact' });
  store.removeFromSelection({ id: 'c', kind: 'fact' });

  expect(store.currentlySelected).toEqual({
    a: { id: 'a', kind: 'object' }
  });
});

it('can remove subset from selection', () => {
  const store = new SelectionStore();
  expect(store.currentlySelected).toEqual({});
  store.setCurrentlySelected({
    a: { id: 'a', kind: 'object' },
    b: { id: 'b', kind: 'fact' },
    c: { id: 'c', kind: 'fact' }
  });

  store.removeAllFromSelection([{ id: 'b', kind: 'fact' }, { id: 'c', kind: 'fact' }]);

  expect(store.currentlySelected).toEqual({
    a: { id: 'a', kind: 'object' }
  });
});

it('can toggle selection', () => {
  const store = new SelectionStore();
  expect(store.currentlySelected).toEqual({});
  store.toggleSelection({ id: 'a', kind: 'fact' });
  expect(store.currentlySelected).toEqual({
    a: { id: 'a', kind: 'fact' }
  });
  store.toggleSelection({ id: 'a', kind: 'fact' });
  expect(store.currentlySelected).toEqual({});
});
