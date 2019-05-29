import MainPageStore from "../MainPageStore";
import {action, computed} from "mobx";
import {ActFact, ActObject, Search} from "../types";

export type PredefinedObjectQuery = {
    name: string,
    description: string,
    query: string,
    objects: Array<string>
}

export type ContextAction = {
    name: string,
    type: string,
    description: string,
    href: string,
}

export type ContextActionTemplate = {
    objects: Array<string>,
    action: {
        name: string,
        type: string,
        description: string,
        urlPattern: string
    }
}

export type ObjectDetails = {
    contextActions: Array<ContextAction>,
    predefinedObjectQueries: Array<PredefinedObjectQuery>,
}

const byName = (a: { name: string }, b: { name: string }) => a.name > b.name ? 1 : -1;

class DetailsStore {
    root: MainPageStore;

    contextActionTemplates: Array<ContextActionTemplate>;
    predefinedObjectQueries: Array<PredefinedObjectQuery>;

    constructor(root: MainPageStore, config: any) {
        this.root = root;
        this.contextActionTemplates = config.contextActions || [];
        this.predefinedObjectQueries = config.predefinedObjectQueries || [];
    }

    @computed get selectedNode() {
        return this.root.ui.cytoscapeStore.selectedNode;
    }

    @action
    onSearchSubmit(search: Search) {
        this.root.backendStore.executeQuery(search);
    }

    @computed get endTimestamp() {
        return this.root.refineryStore.endTimestamp;
    }

    @computed get selectedObject(): ActObject | null {
        const selected = this.root.ui.cytoscapeStore.selectedNode;
        if (selected && selected.id && selected.type === 'object') {
            return this.root.queryHistory.result.objects[selected.id];
        } else {
            return null;
        }
    }

    @action
    onPredefinedObjectQueryClick(q: PredefinedObjectQuery): void {
        const obj = this.selectedObject;
        if (obj) {
            this.root.backendStore.executeQuery({
                objectType: obj.type.name,
                objectValue: obj.value,
                query: q.query
            })
        }
    }

    static contextActionsFor(selected: ActObject | null, contextActionTemplates: Array<ContextActionTemplate>): Array<ContextAction> {
        if (!selected) return [];

        return contextActionTemplates
            .filter((x: any) => x.action.type === "link")
            .filter((x: any) => x.objects.find((objectType: string) => objectType === selected.type.name))
            .map((x: any) => {
                return {
                    name: x.action.name,
                    type: x.action.type,
                    description: x.action.description,
                    href: x.action.urlPattern.replace(":objectValue", selected.value)
                }
            })
            .sort(byName)
    }

    static predefinedObjectQueriesFor(selected: ActObject | null, predefinedObjectQueries: Array<PredefinedObjectQuery>): Array<PredefinedObjectQuery> {
        if (!selected) return [];

        return predefinedObjectQueries
            .filter(x => x.objects.find(objectType => objectType === selected.type.name))
            .sort(byName)
    }

    @computed
    get selectedObjectDetails() {
        const selected = this.selectedObject;

        if (!selected) return {};

        return {
            id: selected.id,
            details: {
                contextActions: DetailsStore.contextActionsFor(selected, this.contextActionTemplates),
                predefinedObjectQueries: DetailsStore.predefinedObjectQueriesFor(selected, this.predefinedObjectQueries)
            },
            onSearchSubmit: (search: any) => this.onSearchSubmit(search),
            onFactClick: (fact : ActFact) => this.setSelectedFact(fact),
            onTitleClick: () => this.onSearchSubmit({
                objectType: selected.type.name,
                objectValue: selected.value
            }),
            onPredefinedObjectQueryClick: (q: PredefinedObjectQuery) => {this.onPredefinedObjectQueryClick(q)}
        };
    }

    @action
    setSelectedObject(actObject: ActObject) {
        this.root.ui.cytoscapeStore.setSelectedNode({type: 'object', id: actObject.id})
    }

    @action
    setSelectedFact(fact: ActFact) {
        this.root.ui.cytoscapeStore.setSelectedNode({type: 'fact', id: fact.id})
    }
}


export default DetailsStore;