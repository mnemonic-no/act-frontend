import {ActFact, ActObject} from "../pages/types";

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
        accessMode: ""
    };

    return {
        ...defaults,
        ...args
    }
};
