import { action, computed, observable } from 'mobx';

import { ActFact, ActObject, ActSelection } from '../types';
import { ColumnKind, ObjectRow, SortOrder } from './ObjectsTable';
import MainPageStore from '../MainPageStore';
import { oneLeggedFactsFor } from '../../core/transformers';
import { exportToCsv } from '../../util/util';

const sortBy = (sortOrder: SortOrder, objects: Array<ObjectRow>) => {
  return objects.slice().sort((a: any, b: any) => {
    let aa;
    let bb;
    if (sortOrder.orderBy === 'objectType') {
      aa = a.actObject.type.name;
      bb = b.actObject.type.name;
    } else if (sortOrder.orderBy === 'properties') {
      aa = JSON.stringify(a.properties);
      bb = JSON.stringify(b.properties);
    } else {
      aa = a.actObject.value;
      bb = b.actObject.value;
    }

    aa = aa.toLowerCase();
    bb = bb.toLowerCase();

    if (sortOrder.order === 'asc') {
      return aa < bb ? -1 : 1;
    } else {
      return aa < bb ? 1 : -1;
    }
  });
};

const toObjectRow = (
  object: ActObject,
  currentlySelected: { [id: string]: ActSelection },
  facts: Array<ActFact>
): ObjectRow => {
  return {
    id: object.id,
    title: object.type.name,
    isSelected: Boolean(currentlySelected[object.id]),
    actObject: object,
    properties: oneLeggedFactsFor(object, facts).map(f => {
      return { k: f.type.name, v: f.value || '' };
    })
  };
};

class ObjectsTableStore {
  root: MainPageStore;

  columns: Array<{ label: string; kind: ColumnKind }> = [
    { label: 'Type', kind: 'objectType' },
    { label: 'Value', kind: 'objectValue' },
    { label: 'Properties', kind: 'properties' }
  ];

  @observable
  sortOrder: SortOrder = { order: 'asc', orderBy: 'objectType' };

  constructor(root: MainPageStore) {
    this.root = root;
  }

  @computed get objects() {
    return Object.values(this.root.refineryStore.refined.objects);
  }

  @action.bound
  onToggleSelection(actObject: ActObject) {
    this.root.selectionStore.toggleSelection({ kind: 'object', id: actObject.id });
  }

  @action.bound
  exportToCsv() {
    const objectRows = Object.values(this.root.refineryStore.refined.objects).map(o =>
      toObjectRow(o, this.root.selectionStore.currentlySelected, Object.values(this.root.refineryStore.refined.facts))
    );

    const rows = sortBy(this.sortOrder, objectRows).map(row => {
      return [row.title, row.actObject.value, row.properties.map(({ k, v }) => `${k}: ${v}`).join(',')];
    });

    const headerRow = [this.columns.map(c => c.label)];

    const nowTimeString = new Date()
      .toISOString()
      .replace(/:/g, '-')
      .substr(0, 19);
    exportToCsv(nowTimeString + '-act-objects.csv', headerRow.concat(rows));
  }

  @action.bound
  onSortChange(newOrderBy: ColumnKind) {
    this.sortOrder = {
      orderBy: newOrderBy,
      order: this.sortOrder.orderBy === newOrderBy && this.sortOrder.order === 'asc' ? 'desc' : 'asc'
    };
  }

  @computed
  get prepared() {
    const rows = Object.values(this.root.refineryStore.refined.objects).map(o =>
      toObjectRow(o, this.root.selectionStore.currentlySelected, Object.values(this.root.refineryStore.refined.facts))
    );

    return {
      sortOrder: this.sortOrder,
      onSortChange: this.onSortChange,
      columns: this.columns,
      rows: sortBy(this.sortOrder, rows),
      onRowClick: this.onToggleSelection,
      onExportClick: this.exportToCsv
    };
  }
}

export default ObjectsTableStore;
