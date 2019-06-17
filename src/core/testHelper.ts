import {ActFact, ActObject, FactType} from "../pages/types";

export const actObject = (args: { [key: string]: any }): ActObject => {
    return {...{id: "changeme", type: {id: "x", name: "something"}, value: "123"}, ...args};
};

export const fact = (args: { [key: string]: any }): ActFact => {

    const defaults: ActFact = {
        id: "a",
        sourceObject: actObject({id: "a"}),
        destinationObject: actObject({id: "b"}),
        type: {id: "a", name: "alias"},
        organization: {id: "o", name: "dontknow"},
        source: {id: "x", name: "dontcare"},
        timestamp: "",
        lastSeenTimestamp: "",
        bidirectionalBinding: false,
        accessMode: "",
        value: "changeme"
    };

    return {
        ...defaults,
        ...args
    }
};

export const factType = (args: { [key: string]: any }): FactType => {

    const defaults: FactType = {
        id: "x",
        name: "default name",
        relevantObjectBindings: [],
        namespace: {id: "123", name: "global"},
        validator: "RegexValidator",
        validatorParameter: "(.|\n)*"
    };

    return {
        ...defaults,
        ...args
    }
};