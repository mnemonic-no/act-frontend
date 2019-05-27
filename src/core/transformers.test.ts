import {factMapToObjectMap} from "./transformers"
import {fact} from "./testHelper"
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