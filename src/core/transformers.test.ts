import {
    factMapToObjectMap,
    isOneLegged,
    isOneLeggedFactType,
    objectLabel, oneLeggedFactsFor,
    validBidirectionalFactTargetObjectTypes, validUnidirectionalFactTargetObjectTypes
} from "./transformers"
import {actObject, fact, factType} from "./testHelper"
import {ActObject} from "../pages/types";

it('can convert factMap to objectMap', () => {

    expect(factMapToObjectMap({})).toEqual({});

    const objectA: ActObject = {id: "objA", value: "11", type: {id: "x", name: "threatActor"}};
    const objectB: ActObject = {id: "objB", value: "22", type: {id: "x", name: "threatActor"}};
    const objectC: ActObject = {id: "objC", value: "33", type: {id: "x", name: "threatActor"}};

    const result = factMapToObjectMap({
        "a": fact({
            id: "a",
            type: {id: "a", name: "alias"},
            sourceObject: objectA,
            destinationObject: objectB
        }),
        "b": fact({
            id: "b",
            type: {id: "a", name: "alias"},
            sourceObject: objectA,
            destinationObject: objectC
        })
    });

    expect(result).toEqual({"objA": objectA, "objB": objectB, "objC": objectC})
});


it('can determine if fact is one-legged', () => {
    expect(isOneLegged(fact({
        sourceObject: actObject({id: "1"}),
        destinationObject: null
    }))).toBeTruthy();

    expect(isOneLegged(fact({
        sourceObject: actObject({id: "1"}),
        destinationObject: actObject({id: "2"})
    }))).toBeFalsy();
});


it('can determine if fact type is one-legged', () => {
    expect(isOneLeggedFactType(factType({relevantObjectBindings: []}))).toBeFalsy();

    expect(isOneLeggedFactType(factType({relevantObjectBindings: [{sourceObjectType: {id: "1", name: "something"}}]}))).toBeTruthy();
    expect(isOneLeggedFactType(factType({relevantObjectBindings: [{destinationObjectType: {id: "1", name: "something"}}]}))).toBeTruthy();

    expect(isOneLeggedFactType(factType({relevantObjectBindings: [
            {sourceObjectType: {id: "1", name: "something"}, destinationObjectType: {id: "2", name: "anything"}}]})))
        .toBeFalsy();
});


it('can make object label', () => {

    const theObject = actObject({id: "1", value: "may be overridden"});
    const facts = [fact({
        type: {name: "name"},
        value: "Some name", sourceObject: theObject
    })];

    expect(objectLabel(theObject, "name", facts))
        .toBe("Some name");

    expect(objectLabel(theObject, "name", []))
        .toBe("may be overridden");
});

it('test valid bidirectional fact target object types', () => {

    const threatActor = {id: "ta", name: "threatActor"};
    const organization = {id: "o", name: "organization"};

    expect(validBidirectionalFactTargetObjectTypes(
        factType({
            name: "alias",
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
            ]}),
        actObject({type: threatActor}),
        ))
        .toEqual([threatActor]);
});

it('test empty bidirectional fact target object types', () => {

    const report = {id: "ta", name: "report"};

    expect(validBidirectionalFactTargetObjectTypes(
        factType({
            name: "name",
            relevantObjectBindings: [{sourceObjectType: report}]}),
        actObject({type: report}),
    ))
        .toEqual([]);
});

it('test valid unidirectional fact target object types', () => {

    const threatActor = {id: "ta", name: "threatActor"};
    const incident = {id: "i", name: "incident"};

    const attributedTo = factType({
        name: "attributedTo",
        relevantObjectBindings: [
            {
                sourceObjectType: incident,
                destinationObjectType: threatActor
            },
        ]
    });
    expect(validUnidirectionalFactTargetObjectTypes(
        attributedTo,
        actObject({type: threatActor}),
        false
    ))
        .toEqual([incident]);

    expect(validUnidirectionalFactTargetObjectTypes(
        attributedTo,
        actObject({type: threatActor}),
        true
    ))
        .toEqual([])
});

it('one legged facts for', () => {
    const matchingFact = fact({id: 'f1', sourceObject: {id: '1'}, destinationObject: undefined});

    expect(oneLeggedFactsFor(actObject({id: '1'}), [matchingFact, fact({id: 'f2'})]))
        .toEqual([matchingFact])
});