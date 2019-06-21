import {action, computed, observable} from "mobx";

import {ActFact, ActObject} from "../types";
import {ColumnKind, ObjectRow, SortOrder} from "./ObjectsTable";
import {Node} from "../GraphView/GraphViewStore";
import MainPageStore from "../MainPageStore";
import {oneLeggedFactsFor} from "../../core/transformers";

const sortBy = (sortOrder: SortOrder, objects: Array<ObjectRow>) => {

    return objects.slice().sort((a: any, b: any) => {
        let aa;
        let bb;
        if (sortOrder.orderBy === 'objectType') {
            aa = a.actObject.type.name;
            bb = b.actObject.type.name;
        } else if (sortOrder.orderBy === 'properties') {
            aa = a.properties;
            bb = b.properties;
        } else {
            aa = a.actObject.value;
            bb = b.actObject.value;
        }

        if (sortOrder.order === 'asc') {
            return aa < bb ? -1 : 1;
        } else {
            return aa < bb ? 1 : -1;
        }
    })
};

const toObjectRow = (object: ActObject, selectedNode: Node, facts: Array<ActFact>) : ObjectRow => {
    return {
        key: object.id,
        title: object.type.name,
        isSelected: (object.id === selectedNode.id),
        actObject: object,
        properties: oneLeggedFactsFor(object, facts).map(f => {return {k: f.type.name, v: f.value || ""}})
    }
};

class ObjectsTableStore {
    root: MainPageStore;

    columns : Array<{label: string, kind: ColumnKind}>  = [
        {label: "Type", kind: "objectType"},
        {label: "Value", kind: "objectValue"},
        {label: "Properties", kind: "properties"}
    ];

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
    onSortChange(newOrderBy: ColumnKind) {
        this.sortOrder = {
            orderBy: newOrderBy,
            order: this.sortOrder.orderBy === newOrderBy && this.sortOrder.order === 'asc' ? 'desc' : 'asc'
        }
    }

    @computed
    get prepared() {
        const rows =  Object.values(this.root.refineryStore.refined.objects)
            .map((o) => toObjectRow(o, this.root.ui.cytoscapeStore.selectedNode, Object.values(this.root.refineryStore.refined.facts)))

        return {
            sortOrder: this.sortOrder,
            onSortChange: this.onSortChange,
            columns: this.columns,
            rows: sortBy(this.sortOrder, rows),
            onRowClick: this.setSelectedObject,
            exportToCsv: this.exportToCsv
        }
    }
}


export default ObjectsTableStore;