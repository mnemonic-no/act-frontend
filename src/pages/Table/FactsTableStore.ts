import {action, computed} from "mobx";
import {ActFact} from "../types";
import MainPageStore from "../MainPageStore";

class FactsTableStore {
    root: MainPageStore;

    constructor(root: MainPageStore) {
        this.root = root;
    }

    @computed get selectedNode() {
        return this.root.ui.cytoscapeStore.selectedNode;
    }

    @computed get facts() {
        return Object.values(this.root.refineryStore.refined.facts);
    }

    @action.bound
    setSelectedFact(actFact: ActFact) {
        this.root.ui.cytoscapeStore.setSelectedNode({type: 'fact', id: actFact.id})
    }

    @computed
    get prepared() {
        return {
            selectedNode: this.root.ui.cytoscapeStore.selectedNode,
            facts: Object.values(this.root.refineryStore.refined.facts),
            onRowClick: this.setSelectedFact
        }
    }
}


export default FactsTableStore;