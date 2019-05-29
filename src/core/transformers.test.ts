import {factMapToObjectMap, isOneLegged, isOneLeggedFactType, objectLabel} from "./transformers"
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


