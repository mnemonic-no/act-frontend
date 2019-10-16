import {
  contextActionsFor,
  countByFactType,
  idsToFacts,
  idsToObjects,
  isMetaFact,
  isRetracted,
  isRetraction,
  objectIdToFacts
} from './domain';
import { actObject, fact, factTypes, objectTypes } from './testHelper';
import { ContextActionTemplate } from '../pages/types';

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

it('can map ids to facts', () => {
  expect(idsToFacts([], {})).toEqual([]);
  const mentionFact = fact({ id: 'a', type: factTypes.mentions });
  const aliasFact = fact({ id: 'c', type: factTypes.alias });
  expect(idsToFacts(['a', 'b', 'c'], { a: mentionFact, c: aliasFact })).toEqual([mentionFact, aliasFact]);
});

it('can map ids to objects', () => {
  expect(idsToObjects([], {})).toEqual([]);
  const reportObject = actObject({ id: 'a' });
  expect(idsToObjects(['a', 'b'], { a: reportObject })).toEqual([reportObject]);
});

it('count by fact type', () => {
  expect(countByFactType([])).toEqual({});
  const mentionFact = fact({ id: 'a', type: factTypes.mentions });
  const aliasFact1 = fact({ id: 'b', type: factTypes.alias });
  const aliasFact2 = fact({ id: 'c', type: factTypes.alias });

  expect(countByFactType([mentionFact, aliasFact1, aliasFact2])).toEqual({ alias: 2, mentions: 1 });
});

const noopFn = () => {};

it('can get context actions for links', () => {
  const template: ContextActionTemplate = {
    objects: ['content', 'hash'],
    action: {
      name: 'Somewhere',
      description: 'Open somewhere',
      type: 'link',
      urlPattern: 'https://www.somewhere.com/hash/:objectValue'
    }
  };

  expect(contextActionsFor(null, [], noopFn)).toEqual([]);

  expect(
    contextActionsFor(
      {
        id: '1',
        type: { id: '2', name: 'content' },
        value: 'testValue'
      },
      [template],
      noopFn
    )
  ).toEqual([
    {
      name: template.action.name,
      description: template.action.description,
      href: 'https://www.somewhere.com/hash/testValue'
    }
  ]);

  expect(
    contextActionsFor(
      {
        id: '1',
        type: { id: '2', name: 'report' },
        value: 'testValue'
      },
      [template],
      noopFn
    )
  ).toEqual([]);
});

it('can get context actions for postAndForget', () => {
  const template: ContextActionTemplate = {
    action: {
      name: 'Somewhere',
      description: 'Open somewhere',
      type: 'postAndForget',
      pathPattern: '/submit/:objectType/:objectValue',
      jsonBody: {
        'act.type': ':objectType',
        'act.value': ':objectValue'
      }
    }
  };

  const actions = contextActionsFor(
    {
      id: '1',
      type: { id: '2', name: 'content' },
      value: 'testValue'
    },
    [template],
    noopFn
  );

  expect(actions).toHaveLength(1);

  expect(actions[0].name).toBe(template.action.name);
  expect(actions[0].description).toBe(template.action.description);
  expect(actions[0].onClick).toBeDefined();
});
