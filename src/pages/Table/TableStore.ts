import {action, computed, observable} from "mobx";
import {ActFact, ActObject, Search} from "../types";
import MainPageStore from "../MainPageStore";

class TableStore {
    root: MainPageStore;
    @observable selectedTab: string = 'objects';

    constructor(root: MainPageStore) {
        this.root = root;
    }

    @computed get selectedNode() {
        return this.root.ui.cytoscapeStore.selectedNode;
    }

    @action
    setSelectedTab(value : string) {
        this.selectedTab = value;
    }

    @computed get objects() {
        return Object.values(this.root.refineryStore.refined.objects);
    }

    @computed get facts() {
        return Object.values(this.root.refineryStore.refined.facts);
    }

    @computed get endTimestamp() {
        return this.root.refineryStore.endTimestamp;
    }

    @action onSearchSubmit(search : Search) {
        this.root.backendStore.executeQuery(search);
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


export default TableStore;