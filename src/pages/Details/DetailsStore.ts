import MainPageStore from "../MainPageStore";
import {action, computed, observable} from "mobx";
import {ActFact, ActObject, Search} from "../types";
import CreateFactForDialog from "../../components/CreateFactFor/DialogStore";
import * as R from "ramda";

export type PredefinedObjectQuery = {
    name: string,
    description: string,
    query: string,
    objects: Array<string>
}

export type ContextAction = {
    name: string,
    description: string,
    href?: string,
    onClick?: () => void
}

export type ContextActionTemplate = {
    objects?: Array<string>,
    action: {
        name: string,
        type: 'link' | 'postAndForget',
        description: string,
        urlPattern?: string,
        pathPattern?: string,
        confirmation?: string,
        jsonBody?: { [key: string]: any }
    }
}

export type ObjectDetails = {
    contextActions: Array<ContextAction>,
    predefinedObjectQueries: Array<PredefinedObjectQuery>,
}

const byName = (a: { name: string }, b: { name: string }) => a.name > b.name ? 1 : -1;

const replaceAll = (s: string, replacements: {[key: string] : string}) => {
    return Object.entries(replacements)
        .reduce((acc: string, [searchFor, replaceWith]: [string, string]) => {
            return acc.replace(searchFor, replaceWith);
        }, s)
};

class DetailsStore {
    root: MainPageStore;

    contextActionTemplates: Array<ContextActionTemplate>;
    predefinedObjectQueries: Array<PredefinedObjectQuery>;

    @observable createFactDialog: CreateFactForDialog | null = null;

    constructor(root: MainPageStore, config: any) {
        this.root = root;
        this.contextActionTemplates = config.contextActions || [];
        this.predefinedObjectQueries = config.predefinedObjectQueries || [];
    }

    @computed get selectedNode() {
        return this.root.ui.cytoscapeStore.selectedNode;
    }

    @action.bound
    onSearchSubmit(search: Search) {
        this.root.backendStore.executeQuery(search);
    }

    @computed get endTimestamp() {
        return this.root.refineryStore.endTimestamp;
    }

    @computed get selectedObject(): ActObject | null {
        const selected = this.selectedNode;
        if (selected && selected.id && selected.type === 'object') {
            return this.root.queryHistory.result.objects[selected.id];
        } else {
            return null;
        }
    }

    @computed get selectedFact(): ActFact | null {
        const selected = this.selectedNode;
        if (selected && selected.id && selected.type === 'fact') {
            return this.root.queryHistory.result.facts[selected.id];
        } else {
            return null;
        }
    }

    @action.bound
    onPredefinedObjectQueryClick(q: PredefinedObjectQuery): void {
        const obj = this.selectedObject;
        if (obj) {
            this.root.backendStore.executeQuery({objectType: obj.type.name, objectValue: obj.value, query: q.query});
        }
    }

    static toContextAction(template: ContextActionTemplate, selected: ActObject, postAndForgetFn: (url: string, jsonBody: any, successString : string) => void) : ContextAction {

        const replacements : {[key: string] : string} = {
            ":objectValue": selected.value,
            ":objectType": selected.type.name
        };

        switch (template.action.type) {
            case "link":
                return {
                    name: template.action.name,
                    description: template.action.description,
                    href: replaceAll(template.action.urlPattern || '', replacements)
                };
            case "postAndForget":
                const jsonBody = R.fromPairs(Object.entries(template.action.jsonBody || {}).map(([k,v] : any) => {
                    return [k, replaceAll(v, replacements)];
                }));

                const url = replaceAll(template.action.pathPattern || '', replacements);

                return {
                    name: template.action.name,
                    description: template.action.description,
                    onClick: () => {
                        if (template.action.confirmation === undefined ||
                            (template.action.confirmation && window.confirm(template.action.confirmation))) {
                            postAndForgetFn(url, jsonBody, 'Success: ' + template.action.name);
                        }
                    }
                };

            default:
                throw Error("Unhandled case " + template.action)
        }
    }

    static contextActionsFor(selected: ActObject | null, contextActionTemplates: Array<ContextActionTemplate>, postAndForgetFn: (url: string, jsonBody: any, successString : string) => void): Array<ContextAction> {
        if (!selected) return [];

        return contextActionTemplates
            .filter((x: any) => !x.objects || x.objects.find((objectType: string) => objectType === selected.type.name))
            .map((x: any) => this.toContextAction(x, selected, postAndForgetFn))
            .sort(byName)
    }

    static predefinedObjectQueriesFor(selected: ActObject | null, predefinedObjectQueries: Array<PredefinedObjectQuery>) {
        if (!selected) return [];

        return predefinedObjectQueries
            .filter(x => x.objects.find(objectType => objectType === selected.type.name))
            .sort(byName)
    }

    @computed
    get hasSelection(): boolean {
        return Boolean(this.selectedObject) || Boolean(this.selectedFact)
    }

    @computed
    get selectedObjectDetails() {
        const selected = this.selectedObject;

        if (!selected) return null;

        return {
            id: selected.id,
            details: {
                contextActions: DetailsStore.contextActionsFor(
                    selected,
                    this.contextActionTemplates,
                    this.root.backendStore.postAndForget.bind(this.root.backendStore)
                ),
                predefinedObjectQueries: DetailsStore.predefinedObjectQueriesFor(selected, this.predefinedObjectQueries)
            },
            createFactDialog: this.createFactDialog,
            onSearchSubmit: this.onSearchSubmit,
            onFactClick: this.setSelectedFact,
            onTitleClick: () => this.onSearchSubmit({objectType: selected.type.name, objectValue: selected.value}),
            onPredefinedObjectQueryClick: this.onPredefinedObjectQueryClick,
            onCreateFactClick: this.onCreateFactClick
        };
    }

    @computed
    get selectedFactDetails() {
        const selected = this.selectedFact;

        if (!selected) return {};

        return {
            id: selected.id,
            endTimestamp: this.endTimestamp,
            selectedNode: this.selectedNode,
            onObjectRowClick: this.setSelectedObject,
            onFactRowClick: this.setSelectedFact
        }
    }

    @action.bound
    setSelectedObject(actObject: ActObject) {
        this.root.ui.cytoscapeStore.setSelectedNode({type: 'object', id: actObject.id})
    }

    @action.bound
    setSelectedFact(fact: ActFact) {
        this.root.ui.cytoscapeStore.setSelectedNode({type: 'fact', id: fact.id})
    }

    @action.bound
    onCreateFactClick() {
        if (this.selectedObject) {
            this.createFactDialog = new CreateFactForDialog(this.selectedObject, this.root.queryHistory);
        }
    }
}


export default DetailsStore;