import MainPageStore from "../MainPageStore";
import {action, computed} from "mobx";
import {ActFact, ActObject, Search} from "../QueryHistory";


class DetailsStore {
    root: MainPageStore;

    constructor(root: MainPageStore) {
        this.root = root;
    }

    @computed get selectedNode() {
        return this.root.ui.cytoscapeStore.selectedNode;
    }

    @action onSearchSubmit(search : Search) {
        this.root.backendStore.executeQuery(search);
    }

    @computed get endTimestamp() {
        return this.root.refineryStore.endTimestamp;
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