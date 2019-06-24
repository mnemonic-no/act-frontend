import {action, computed, observable} from "mobx";
import {ActFact} from "../types";
import MainPageStore from "../MainPageStore";
import {ColumnKind, SortOrder} from "./FactsTable";



const sortBy = (sortOrder: SortOrder, objects: Array<ActFact>) => {
    return objects.slice().sort((a: any, b: any) => {
        let aa;
        let bb;
        if (sortOrder.orderBy === 'factType') {
            aa = a.type.name;
            bb = b.type.name;
        } else {
            aa = a.value;
            bb = b.value;
        }

        if (sortOrder.order === 'asc') {
            return aa < bb ? -1 : 1;
        } else {
            return aa < bb ? 1 : -1;
        }
    })
};


class FactsTableStore {
    root: MainPageStore;

    @observable
    sortOrder: SortOrder = {order: 'asc', orderBy: 'factType'};

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

    @action.bound
    onSortChange(newOrderBy: ColumnKind) {
        this.sortOrder = {
            orderBy: newOrderBy,
            order: this.sortOrder.orderBy === newOrderBy && this.sortOrder.order === 'asc' ? 'desc' : 'asc'
        }
    }

    @computed
    get prepared() {
        return {
            selectedNode: this.root.ui.cytoscapeStore.selectedNode,
            facts: sortBy(this.sortOrder, Object.values(this.root.refineryStore.refined.facts)),
            sortOrder: this.sortOrder,
            onSortChange: this.onSortChange,
            onRowClick: this.setSelectedFact
        }
    }
}


export default FactsTableStore;