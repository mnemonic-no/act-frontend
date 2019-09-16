import { isMetaFact, isRetracted, isRetraction, objectIdToFacts } from './domain';
import { actObject, fact, factTypes, objectTypes } from './testHelper';

it('can check if fact is retracted', () => {
  expect(isRetracted(fact({}))).toBeFalsy();
  expect(isRetracted(fact({ flags: ['Retracted'] }))).toBeTruthy();
});

it('can check if fact is a retraction', () => {
  expect(isRetraction(fact({}))).toBeFalsy();
  expect(isRetraction(fact({ type: factTypes.retraction }))).toBeTruthy();
});

it('can check if fact is metafact', () => {
  expect(isMetaFact(fact({ sourceObject: actObject({ id: 'x', type: objectTypes.report }) }))).toBeFalsy();
  expect(
    isMetaFact(
      fact({
        sourceObject: undefined,
        destinationObject: undefined,
        inReferenceTo: { id: 'something', type: factTypes.alias }
      })
    )
  ).toBeTruthy();
});

it('can create objectIdToFacts mapping', () => {
  expect(objectIdToFacts([])).toEqual({});

  const alias = fact({
    type: { id: 'a', name: 'alias' },
    sourceObject: actObject({ id: 'threatActor1', type: objectTypes.threatActor }),
    destinationObject: actObject({ id: 'threatActor2', type: objectTypes.threatActor })
  });

  expect(objectIdToFacts([alias])).toEqual({ threatActor1: [alias], threatActor2: [alias] });

  const mentions = fact({
    type: factTypes.mentions,
    sourceObject: actObject({ id: 'report1', type: objectTypes.report }),
    destinationObject: actObject({ id: 'threatActor1', type: objectTypes.threatActor })
  });

  expect(objectIdToFacts([alias, mentions])).toEqual({
    threatActor1: [alias, mentions],
    threatActor2: [alias],
    report1: [mentions]
  });
});
