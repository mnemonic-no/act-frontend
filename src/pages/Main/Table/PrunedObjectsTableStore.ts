import MainPageStore from '../MainPageStore';
import { action, computed, observable } from 'mobx';
import { ActObject, TConfig } from '../../../core/types';
import { ColumnKind, IObjectRow, SortOrder } from '../../../components/ObjectTable';
import { objectTypeToColor } from '../../../util/util';

export const sortRowsBy = (sortOrder: SortOrder, rows: Array<IObjectRow>) => {
  return rows.slice().sort((a: any, b: any) => {
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

const toObjectRow = (object: ActObject, objectColors: { [objectType: string]: string }): IObjectRow => {
  return {
    actObject: object,
    color: objectTypeToColor(objectColors, object.type.name)
  };
};

class PrunedObjectsTableStore {
  root: MainPageStore;
  config: TConfig;

  @observable
  sortOrder: SortOrder = { order: 'asc', orderBy: 'objectType' };

  constructor(root: MainPageStore, config: TConfig) {
    this.root = root;
    this.config = config;
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
    const objectColors = this.config.objectColors || {};
    const rows = Object.values(this.root.refineryStore.prunedObjects).map(o => toObjectRow(o, objectColors));

    return {
      rowCount: rows.length,
      objectTable: {
        sortOrder: this.sortOrder,
        onSortChange: this.onSortChange,
        rows: sortRowsBy(this.sortOrder, rows),
        onRowClick: (actObject: ActObject) => {
          this.root.refineryStore.unpruneObjectId(actObject.id);
        }
      },
      onClearButtonClick: () => {
        this.root.refineryStore.clearPrunedObjectIds();
      }
    };
  }
}

export default PrunedObjectsTableStore;
