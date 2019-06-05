import {suggestions} from "./SearchStore";
import {PredefinedObjectQuery} from "../Details/DetailsStore";

export const query = (args: { [key: string]: any }): PredefinedObjectQuery => {
    return {
        ...{
            name: "default name",
            query: "changeme",
            description: "default description",
            objects: []
        },
        ...args
    };
};

it('can find suggestions', () => {
    expect(suggestions("abc", "threatActor", [])).toEqual([]);

    expect(suggestions(
        "t",
        "threatActor",
        [
            (query({name: "tool", objects: ["threatActor"]})),
            (query({name: "techniques", objects: ["threatActor"]})),
            (query({name: "mentions", objects: ["email", "hash", "ipv4"]}))
        ])
        .map(x => x.name))
        .toEqual(["techniques", "tool"]);

    expect(suggestions(
        "",
        "threatActor",
        [
            (query({name: "tool", objects: ["threatActor"]})),
            (query({name: "techniques", objects: ["threatActor"]})),
            (query({name: "mentions", objects: ["email", "hash", "ipv4"]}))
        ])
        .map(x => x.name))
        .toEqual(["techniques", "tool"]);
});


it('suggestions ignore case', () => {
    expect(suggestions(
        "Tool",
        "threatActor",
        [
            (query({name: "tool", objects: ["threatActor"]})),
            (query({name: "techniques", objects: ["threatActor"]})),
            (query({name: "mentions", objects: ["email", "hash", "ipv4"]}))
        ])
        .map(x => x.name))
        .toEqual(["tool"])
});
