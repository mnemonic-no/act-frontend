import DetailsStore from "./DetailsStore";

it('can get context actions', () => {
    const somewhereAction = {
        name: "Somewhere",
        description: "Open somewhere",
        type: "link",
        urlPattern: "https://www.somewhere.com/hash/:objectValue"
    };

    expect(DetailsStore.contextActionsFor(null, [])
    ).toEqual([]);

    expect(DetailsStore.contextActionsFor({
            id: "1",
            type: {id: "2", name: "content"},
            value: "testValue"
        },
        [{objects: ["content", "hash"], action: somewhereAction}])
    ).toEqual(
        [{
            name: somewhereAction.name,
            description: somewhereAction.description,
            type: somewhereAction.type,
            href: "https://www.somewhere.com/hash/testValue"
        }]);

    expect(DetailsStore.contextActionsFor({
            id: "1",
            type: {id: "2", name: "report"},
            value: "testValue"
        },
        [{objects: ["content", "hash"], action: somewhereAction}])
    ).toEqual([])
});