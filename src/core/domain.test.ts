import * as sut from './domain';
import { actObject, fact, factType, factTypes, objectTypes } from './testHelper';
import { ActObject, ContextActionTemplate } from './types';

it('can check if fact is retracted', () => {
  expect(sut.isRetracted(fact({}))).toBeFalsy();
  expect(sut.isRetracted(fact({ flags: ['Retracted'] }))).toBeTruthy();
});

it('can check if fact is a retraction', () => {
  expect(sut.isRetraction(fact({}))).toBeFalsy();
  expect(sut.isRetraction(fact({ type: factTypes.retraction }))).toBeTruthy();
});

it('can check if fact is metafact', () => {
  expect(sut.isMetaFact(fact({ sourceObject: actObject({ id: 'x', type: objectTypes.report }) }))).toBeFalsy();
  expect(
    sut.isMetaFact(
      fact({
        sourceObject: undefined,
        destinationObject: undefined,
        inReferenceTo: { id: 'something', type: factTypes.alias }
      })
    )
  ).toBeTruthy();
});

it('can create objectIdToFacts mapping', () => {
  expect(sut.objectIdToFacts([])).toEqual({});

  const alias = fact({
    type: { id: 'a', name: 'alias' },
    sourceObject: actObject({ id: 'threatActor1', type: objectTypes.threatActor }),
    destinationObject: actObject({ id: 'threatActor2', type: objectTypes.threatActor })
  });

  expect(sut.objectIdToFacts([alias])).toEqual({ threatActor1: [alias], threatActor2: [alias] });

  const mentions = fact({
    type: factTypes.mentions,
    sourceObject: actObject({ id: 'report1', type: objectTypes.report }),
    destinationObject: actObject({ id: 'threatActor1', type: objectTypes.threatActor })
  });

  expect(sut.objectIdToFacts([alias, mentions])).toEqual({
    threatActor1: [alias, mentions],
    threatActor2: [alias],
    report1: [mentions]
  });
});

it('can map ids to facts', () => {
  expect(sut.idsToFacts([], {})).toEqual([]);
  const mentionFact = fact({ id: 'a', type: factTypes.mentions });
  const aliasFact = fact({ id: 'c', type: factTypes.alias });
  expect(sut.idsToFacts(['a', 'b', 'c'], { a: mentionFact, c: aliasFact })).toEqual([mentionFact, aliasFact]);
});

it('can map ids to objects', () => {
  expect(sut.idsToObjects([], {})).toEqual([]);
  const reportObject = actObject({ id: 'a' });
  expect(sut.idsToObjects(['a', 'b'], { a: reportObject })).toEqual([reportObject]);
});

it('count by fact type', () => {
  expect(sut.countByFactType([])).toEqual({});
  const mentionFact = fact({ id: 'a', type: factTypes.mentions });
  const aliasFact1 = fact({ id: 'b', type: factTypes.alias });
  const aliasFact2 = fact({ id: 'c', type: factTypes.alias });

  expect(sut.countByFactType([mentionFact, aliasFact1, aliasFact2])).toEqual({ alias: 2, mentions: 1 });
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

  expect(sut.contextActionsFor(null, [], noopFn)).toEqual([]);

  expect(
    sut.contextActionsFor(
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
    sut.contextActionsFor(
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

  const actions = sut.contextActionsFor(
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

it('can convert factMap to objectMap', () => {
  expect(sut.factMapToObjectMap({})).toEqual({});

  const objectA: ActObject = { id: 'objA', value: '11', type: { id: 'x', name: 'threatActor' } };
  const objectB: ActObject = { id: 'objB', value: '22', type: { id: 'x', name: 'threatActor' } };
  const objectC: ActObject = { id: 'objC', value: '33', type: { id: 'x', name: 'threatActor' } };

  const result = sut.factMapToObjectMap({
    a: fact({
      id: 'a',
      type: { id: 'a', name: 'alias' },
      sourceObject: objectA,
      destinationObject: objectB
    }),
    b: fact({
      id: 'b',
      type: { id: 'a', name: 'alias' },
      sourceObject: objectA,
      destinationObject: objectC
    })
  });

  expect(result).toEqual({ objA: objectA, objB: objectB, objC: objectC });
});

it('can determine if fact is one-legged', () => {
  expect(
    sut.isOneLegged(
      fact({
        sourceObject: actObject({ id: '1' }),
        destinationObject: null
      })
    )
  ).toBeTruthy();

  expect(
    sut.isOneLegged(
      fact({
        sourceObject: actObject({ id: '1' }),
        destinationObject: actObject({ id: '2' })
      })
    )
  ).toBeFalsy();
});

it('can determine if fact type is one-legged', () => {
  expect(sut.isOneLeggedFactType(factType({ relevantObjectBindings: [] }))).toBeFalsy();

  expect(
    sut.isOneLeggedFactType(
      factType({ relevantObjectBindings: [{ sourceObjectType: { id: '1', name: 'something' } }] })
    )
  ).toBeTruthy();
  expect(
    sut.isOneLeggedFactType(
      factType({ relevantObjectBindings: [{ destinationObjectType: { id: '1', name: 'something' } }] })
    )
  ).toBeTruthy();

  expect(
    sut.isOneLeggedFactType(
      factType({
        relevantObjectBindings: [
          { sourceObjectType: { id: '1', name: 'something' }, destinationObjectType: { id: '2', name: 'anything' } }
        ]
      })
    )
  ).toBeFalsy();
});

it('can make object label', () => {
  const theObject = actObject({ id: '1', value: 'may be overridden' });
  const facts = [
    fact({
      type: { name: 'name' },
      value: 'Some name',
      sourceObject: theObject
    })
  ];

  expect(sut.objectLabel(theObject, 'name', facts)).toBe('Some name');

  expect(sut.objectLabel(theObject, 'name', [])).toBe('may be overridden');
});

it('test valid bidirectional fact target object types', () => {
  const threatActor = { id: 'ta', name: 'threatActor' };
  const organization = { id: 'o', name: 'organization' };

  expect(
    sut.validBidirectionalFactTargetObjectTypes(
      factType({
        name: 'alias',
        relevantObjectBindings: [
          {
            sourceObjectType: threatActor,
            destinationObjectType: threatActor,
            bidirectionalBinding: true
          },
          {
            sourceObjectType: organization,
            destinationObjectType: organization,
            bidirectionalBinding: true
          }
        ]
      }),
      actObject({ type: threatActor })
    )
  ).toEqual([threatActor]);
});

it('test empty bidirectional fact target object types', () => {
  const report = { id: 'ta', name: 'report' };

  expect(
    sut.validBidirectionalFactTargetObjectTypes(
      factType({
        name: 'name',
        relevantObjectBindings: [{ sourceObjectType: report }]
      }),
      actObject({ type: report })
    )
  ).toEqual([]);
});

it('test valid unidirectional fact target object types', () => {
  const incident = { id: 'i', name: 'incident' };

  const attributedTo = factType({
    name: 'attributedTo',
    relevantObjectBindings: [
      {
        sourceObjectType: incident,
        destinationObjectType: objectTypes.threatActor
      }
    ]
  });
  expect(
    sut.validUnidirectionalFactTargetObjectTypes(attributedTo, actObject({ type: objectTypes.threatActor }), false)
  ).toEqual([incident]);

  expect(
    sut.validUnidirectionalFactTargetObjectTypes(attributedTo, actObject({ type: objectTypes.threatActor }), true)
  ).toEqual([]);
});

it('one legged facts for', () => {
  const matchingFact = fact({ id: 'f1', sourceObject: { id: '1' }, destinationObject: undefined });

  expect(sut.oneLeggedFactsFor(actObject({ id: '1' }), [matchingFact, fact({ id: 'f2' })])).toEqual([matchingFact]);
});

it('facts to objects', () => {
  expect(sut.factsToObjects([])).toEqual([]);

  const t1 = actObject({ id: '1', name: 'sofacy', type: objectTypes.threatActor });
  const t2 = actObject({ id: '2', name: 'axiom', type: objectTypes.threatActor });
  const t3 = actObject({ id: '3', name: 'panda', type: objectTypes.threatActor });

  expect(sut.factsToObjects([fact({ sourceObject: t1, destinationObject: undefined })])).toEqual([t1]);
  expect(sut.factsToObjects([fact({ sourceObject: t1, destinationObject: t2 })])).toEqual([t1, t2]);
  expect(
    sut.factsToObjects([
      fact({ sourceObject: t1, destinationObject: t2 }),
      fact({ sourceObject: t3, destinationObject: undefined })
    ])
  ).toEqual([t1, t2, t3]);
});

it('factType to string', () => {
  expect(sut.factTypeString(null)).toBe(null);
  expect(
    sut.factTypeString(
      factType({
        name: 'alias',
        relevantObjectBindings: [
          {
            bidirectionalBinding: true,
            sourceObjectType: objectTypes.threatActor,
            destinationObjectType: objectTypes.threatActor
          }
        ]
      })
    )
  ).toBe('biDirectional');

  expect(
    sut.factTypeString(
      factType({
        name: 'name',
        relevantObjectBindings: [
          {
            bidirectionalBinding: false,
            sourceObjectType: objectTypes.threatActor
          }
        ]
      })
    )
  ).toBe('oneLegged');

  expect(
    sut.factTypeString(
      factType({
        name: 'mentions',
        relevantObjectBindings: [
          {
            bidirectionalBinding: false,
            sourceObjectType: objectTypes.report,
            destinationObjectType: objectTypes.threatActor
          }
        ]
      })
    )
  ).toBe('uniDirectional');
});
