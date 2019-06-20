import {action, computed, observable} from "mobx";
import {ActObject} from "../types";
import MainPageStore from "../MainPageStore";


export type SortOrder = {
    order: 'asc' | 'desc'
    orderBy: 'objectType' | 'objectValue' | 'properties'
}

const sortBy = (sortOrder : SortOrder, objects: Array<ActObject>) => {

    return objects.slice().sort((a: any, b: any) => {
        let aa;
        let bb;
        if (sortOrder.orderBy === 'objectType') {
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

class ObjectsTableStore {
    root: MainPageStore;

    @observable
    sortOrder: SortOrder = {order: 'asc', orderBy: 'objectType'};

    constructor(root: MainPageStore) {
        this.root = root;
    }

    @computed get objects() {
        return Object.values(this.root.refineryStore.refined.objects);
    }

    @action.bound
    setSelectedObject(actObject: ActObject) {
        this.root.ui.cytoscapeStore.setSelectedNode({type: 'object', id: actObject.id})
    }

    @action.bound
    exportToCsv() {
        // TODO implement
    }

    @action.bound
    changeSortOrder(newOrderBy: 'objectType' | 'objectValue' | 'properties') {
        this.sortOrder = {
            orderBy: newOrderBy,
            order: this.sortOrder.orderBy === newOrderBy && this.sortOrder.order === 'asc' ? 'desc' : 'asc'
        }
    }

    @computed
    get prepared() {
        return {
            selectedNode: this.root.ui.cytoscapeStore.selectedNode,
            sortOrder: this.sortOrder,
            onSortChange: this.changeSortOrder,
            objects: sortBy(this.sortOrder, Object.values(this.root.refineryStore.refined.objects)),
            onRowClick: this.setSelectedObject,
            exportToCsv: this.exportToCsv
        }
    }
}


export default ObjectsTableStore;