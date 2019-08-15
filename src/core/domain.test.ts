import { isMetaFact, isRetracted, isRetraction } from './domain';
import { actObject, fact } from './testHelper';

it('can check if fact is retracted', () => {
  expect(isRetracted(fact({}))).toBeFalsy();
  expect(isRetracted(fact({ flags: ['Retracted'] }))).toBeTruthy();
});

it('can check if fact is a retraction', () => {
  expect(isRetraction(fact({}))).toBeFalsy();
  expect(isRetraction(fact({ type: { id: 'something', name: 'Retraction' } }))).toBeTruthy();
});

it('can check if fact is metafact', () => {
  expect(isMetaFact(fact({ sourceObject: actObject({ id: 'x', type: { id: 'y', name: 'report' } }) }))).toBeFalsy();
  expect(
    isMetaFact(
      fact({
        sourceObject: undefined,
        destinationObject: undefined,
        inReferenceTo: { id: 'something', type: { id: 'x', name: 'alias' } }
      })
    )
  ).toBeTruthy();
});
