import MainPageStore from "../MainPageStore";
import {action, computed} from "mobx";
import {ActFact, ActObject, Search} from "../QueryHistory";
import config from "../../config";

export type PredefinedObjectQuery = {
    name: string,
    description: string,
    query: string,
    objects: Array<string>
}

export type ObjectDetails = {

    predefinedObjectQueries: Array<PredefinedObjectQuery>,
    predefinedObjectQueryOnClick: (q: PredefinedObjectQuery) => void
}

class DetailsStore {
    root: MainPageStore;

    constructor(root: MainPageStore) {
        this.root = root;
    }

    @computed get selectedNode() {
        return this.root.ui.cytoscapeStore.selectedNode;
    }

    @action onSearchSubmit(search: Search) {
        this.root.backendStore.executeQuery(search);
    }

    @computed get endTimestamp() {
        return this.root.refineryStore.endTimestamp;
    }

    @computed get selectedObject() : ActObject|null {

        const selected = this.root.ui.cytoscapeStore.selectedNode;
        if (selected && selected.id && selected.type === 'object') {
            return this.root.queryHistory.result.objects[selected.id];
        } else {
            return null;
        }
    }

    @action
    predefinedObjectQueryOnClick(q: PredefinedObjectQuery): void {
        const obj = this.selectedObject;
        if (obj) {
            this.root.backendStore.executeQuery({
                objectType: obj.type.name,
                objectValue: obj.value,
                query: q.query
            })
        }
    }

    @computed
    get selectedObjectDetails(): ObjectDetails {

        const selected = this.selectedObject;

        return {
            predefinedObjectQueries: (selected ? config.predefinedObjectQueries.filter(x => x.objects.find(objectType => objectType === selected.type.name)) : []),
            predefinedObjectQueryOnClick: (q) => {this.predefinedObjectQueryOnClick(q)}
        };
    }

    @action
    setSelectedObject(actObject: ActObject) {
        this.root.ui.cytoscapeStore.setSelectedNode({type: 'object', id: actObject.id})
    }

    @action
    setSelectedFact(actFact: ActFact) {
        this.root.ui.cytoscapeStore.setSelectedNode({type: 'fact', id: actFact.id})
    }
}


export default DetailsStore;