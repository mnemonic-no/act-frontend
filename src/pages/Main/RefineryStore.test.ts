import {
  filterFactsByObjectTypes,
  filterFactsByPrunedObjects,
  filterByTime,
  handleRetractions,
  refineResult
} from './RefineryStore';
import { actObject, fact, factTypes, objectTypes } from '../../core/testHelper';

it('can handle retractions', () => {
  expect(handleRetractions({}, false)).toEqual({});
  expect(handleRetractions({}, true)).toEqual({});

  const retraction = fact({ type: factTypes.retraction });
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
  expect(filterFactsByObjectTypes({}, [])).toEqual({});

  const threatActorFact = fact({
    sourceObject: actObject({ value: 'Something', type: { id: 'tId', name: 'threatActor' } })
  });

  expect(
    filterFactsByObjectTypes({ [threatActorFact.id]: threatActorFact }, [
      { id: 'tId', name: 'threatActor', checked: false }
    ])
  ).toEqual({});

  expect(
    filterFactsByObjectTypes({ [threatActorFact.id]: threatActorFact }, [
      { id: 'tId', name: 'threatActor', checked: true }
    ])
  ).toEqual({ [threatActorFact.id]: threatActorFact });
});

it('can prune by objectIds', () => {
  expect(filterFactsByPrunedObjects({}, new Set())).toEqual({});

  const shouldBePrunedFact = fact({
    id: 'toBePruned',
    sourceObject: actObject({ id: 'pruneMe', value: 'Something', type: objectTypes.threatActor })
  });

  const threatActorFact = fact({
    id: 'keepMe',
    sourceObject: actObject({ id: 'keepMe', value: 'Something', type: objectTypes.threatActor })
  });

  expect(
    filterFactsByPrunedObjects(
      { [threatActorFact.id]: threatActorFact, [shouldBePrunedFact.id]: shouldBePrunedFact },
      new Set(['pruneMe'])
    )
  ).toEqual({ [threatActorFact.id]: threatActorFact });
});

it('can refine search results', () => {
  expect(
    refineResult({
      searchResult: { facts: {}, objects: {} },
      objectTypeFilters: [],
      endTimestamp: 'Any time',
      prunedObjectIds: new Set()
    })
  ).toEqual({ facts: {}, objects: {} });

  const nowFact = fact({ id: 'nowFact', timestamp: new Date() });
  const someFact = fact({
    id: 'someFact',
    type: factTypes.alias,
    timestamp: new Date(2018, 10, 1),
    sourceObject: actObject({ id: 'theSource', value: 'Something', type: objectTypes.threatActor }),
    destinationObject: actObject({ id: 'theDest', value: 'Something', type: objectTypes.threatActor })
  });

  expect(
    refineResult({
      searchResult: { facts: { [nowFact.id]: nowFact, [someFact.id]: someFact }, objects: {} },
      objectTypeFilters: [],
      endTimestamp: '24 hours ago',
      prunedObjectIds: new Set()
    })
  ).toEqual({
    facts: { [someFact.id]: someFact },
    objects: {
      [someFact.sourceObject ? someFact.sourceObject.id : '']: someFact.sourceObject,
      [someFact.destinationObject ? someFact.destinationObject.id : '']: someFact.destinationObject
    }
  });
});

it('can refine search results with objects', () => {
  const someFact = fact({
    id: 'someFact',
    type: factTypes.alias,
    timestamp: new Date(2018, 10, 1),
    sourceObject: actObject({ id: 'theSource', value: 'Something', type: objectTypes.threatActor }),
    destinationObject: actObject({ id: 'theDest', value: 'Something', type: objectTypes.threatActor })
  });

  const stayObject = actObject({ id: 'shouldStay', value: 'Something', type: objectTypes.threatActor });

  expect(
    refineResult({
      searchResult: {
        facts: { [someFact.id]: someFact },
        objects: {
          shouldStay: stayObject,
          shouldBePruned: actObject({
            id: 'shouldBePruned',
            value: 'Something',
            type: objectTypes.threatActor
          })
        }
      },
      objectTypeFilters: [],
      endTimestamp: 'Any time',
      prunedObjectIds: new Set(['shouldBePruned'])
    })
  ).toEqual({
    facts: { [someFact.id]: someFact },
    objects: {
      theSource: someFact.sourceObject,
      theDest: someFact.destinationObject,
      shouldStay: stayObject
    }
  });
});

it('can filter orphans', () => {
  const orphan = actObject({ id: 'anOrphan', type: objectTypes.threatActor });

  const alias = fact({
    type: factTypes.alias,
    sourceObject: { id: 'x', type: objectTypes.threatActor },
    destinationObject: { id: 'y', type: objectTypes.threatActor }
  });

  const refineResultArgs = {
    includeOrphans: false,
    searchResult: { facts: { [alias.id]: alias }, objects: { [orphan.id]: orphan } },
    objectTypeFilters: [],
    endTimestamp: 'Any time',
    prunedObjectIds: new Set([])
  };

  expect(refineResult(refineResultArgs)).toEqual({
    facts: { [alias.id]: alias },
    objects: { x: alias.sourceObject, y: alias.destinationObject }
  });

  expect(refineResult({ ...refineResultArgs, includeOrphans: true })).toEqual({
    facts: { [alias.id]: alias },
    objects: {
      [orphan.id]: orphan,
      x: alias.sourceObject,
      y: alias.destinationObject
    }
  });
});
