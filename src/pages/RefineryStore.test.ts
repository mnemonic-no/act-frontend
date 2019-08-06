import { filterByObjectTypes, filterByTime, handleRetractions, refineResult } from './RefineryStore';
import { actObject, fact } from '../core/testHelper';

it('can handle retractions', () => {
  expect(handleRetractions({}, false)).toEqual({});
  expect(handleRetractions({}, true)).toEqual({});

  const retraction = fact({ type: { id: 'x', name: 'Retraction' } });
  const someFact = fact({});

  expect(handleRetractions({ [retraction.id]: retraction, [someFact.id]: someFact }, true)).toEqual({
    [someFact.id]: someFact
  });

  expect(handleRetractions({ [retraction.id]: retraction, [someFact.id]: someFact }, true)).toEqual({
    [retraction.id]: retraction,
    [someFact.id]: someFact
  });
});

it('can filter by time', () => {
  expect(filterByTime({}, 'Any time')).toEqual({});

  const nowFact = fact({ id: 'nowFact', timestamp: new Date() });
  const oldFact = fact({ id: 'oldFact', timestamp: new Date(2018, 10, 1) });

  expect(filterByTime({ [nowFact.id]: nowFact }, '24 hours ago')).toEqual({});
  expect(filterByTime({ [oldFact.id]: oldFact, [nowFact.id]: nowFact }, '24 hours ago')).toEqual({
    [oldFact.id]: oldFact
  });
});

it('can filter by object types', () => {
  expect(filterByObjectTypes({}, [])).toEqual({});

  const threatActorFact = fact({
    sourceObject: actObject({ value: 'Something', type: { id: 'tId', name: 'threatActor' } })
  });

  expect(
    filterByObjectTypes({ [threatActorFact.id]: threatActorFact }, [{ id: 'tId', name: 'threatActor', checked: false }])
  ).toEqual({});

  expect(
    filterByObjectTypes({ [threatActorFact.id]: threatActorFact }, [{ id: 'tId', name: 'threatActor', checked: true }])
  ).toEqual({ [threatActorFact.id]: threatActorFact });
});

it('can refine query results', () => {
  expect(refineResult({ facts: {}, objects: {} }, [], 'Any time', true)).toEqual({ facts: {}, objects: {} });

  const nowFact = fact({ id: 'nowFact', timestamp: new Date() });
  const someFact = fact({
    id: 'someFact',
    type: { id: 'alias', name: 'alias' },
    timestamp: new Date(2018, 10, 1),
    sourceObject: actObject({ id: 'theSource', value: 'Something', type: { id: 'tId', name: 'threatActor' } }),
    destinationObject: actObject({ id: 'theDest', value: 'Something', type: { id: 'tId', name: 'threatActor' } })
  });

  expect(
    refineResult({ facts: { [nowFact.id]: nowFact, [someFact.id]: someFact }, objects: {} }, [], '24 hours ago', false)
  ).toEqual({
    facts: { [someFact.id]: someFact },
    objects: {
      [someFact.sourceObject ? someFact.sourceObject.id : '']: someFact.sourceObject,
      [someFact.destinationObject ? someFact.destinationObject.id : '']: someFact.destinationObject
    }
  });
});
