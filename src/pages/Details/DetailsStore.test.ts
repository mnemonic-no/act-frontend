import DetailsStore, {ContextActionTemplate} from "./DetailsStore";

const noopFn = () => {};

it('can get context actions for links', () => {
    const template: ContextActionTemplate = {
        objects: ["content", "hash"],
        action: {
            name: 'Somewhere',
            description: 'Open somewhere',
            type: 'link',
            urlPattern: 'https://www.somewhere.com/hash/:objectValue'
        }
    };

    expect(DetailsStore.contextActionsFor(null, [], noopFn)
    ).toEqual([]);

    expect(DetailsStore.contextActionsFor({
            id: "1",
            type: {id: "2", name: "content"},
            value: "testValue"
        },
        [template],
        noopFn)
    ).toEqual(
        [{
            name: template.action.name,
            description: template.action.description,
            href: "https://www.somewhere.com/hash/testValue"
        }]);

    expect(DetailsStore.contextActionsFor({
            id: "1",
            type: {id: "2", name: "report"},
            value: "testValue"
        },
        [template],
        noopFn)
    ).toEqual([])
});

it('can get context actions for postAndForget', () => {
    const template: ContextActionTemplate = {
        action: {
            name: 'Somewhere',
            description: 'Open somewhere',
            type: 'postAndForget',
            urlPattern: '/submit/:objectType/:objectValue',
            jsonBody: {
                "act.type": ":objectType",
                "act.value": ":objectValue"
            }
        }
    };

    const actions = DetailsStore.contextActionsFor({
            id: '1',
            type: {id: '2', name: 'content'},
            value: 'testValue'
        },
        [template],
        noopFn);

    expect(actions).toHaveLength(1);

    expect(actions[0].name).toBe(template.action.name);
    expect(actions[0].description).toBe(template.action.description);
    expect(actions[0].onClick).toBeDefined()
});