import MainPageStore from '../MainPageStore';
import { action, computed, observable } from 'mobx';
import { ActObject } from '../types';
import { ColumnKind, IPrunedObjectRow, SortOrder } from './PrunedObjectsTable';

const sortBy = (sortOrder: SortOrder, objects: Array<IPrunedObjectRow>) => {
  return objects.slice().sort((a: any, b: any) => {
    let aa;
    let bb;
    if (sortOrder.orderBy === 'objectType') {
      aa = a.actObject.type.name;
      bb = b.actObject.type.name;
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

const toObjectRow = (object: ActObject): IPrunedObjectRow => {
  return {
    title: object.type.name,
    actObject: object
  };
};

class PrunedObjectsTableStore {
  root: MainPageStore;

  columns: Array<{ label: string; kind: ColumnKind }> = [
    { label: 'Type', kind: 'objectType' },
    { label: 'Value', kind: 'objectValue' }
  ];

  @observable
  sortOrder: SortOrder = { order: 'asc', orderBy: 'objectType' };

  constructor(root: MainPageStore) {
    this.root = root;
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
    const rows = Object.values(this.root.refineryStore.prunedObjects).map(o => toObjectRow(o));

    return {
      sortOrder: this.sortOrder,
      onSortChange: this.onSortChange,
      columns: this.columns,
      rows: sortBy(this.sortOrder, rows),
      onRowClick: (actObject: ActObject) => {
        this.root.refineryStore.unpruneObjectId(actObject.id);
      },
      onClearButtonClick: () => {
        this.root.refineryStore.clearPrunedObjectIds();
      }
    };
  }
}

export default PrunedObjectsTableStore;
