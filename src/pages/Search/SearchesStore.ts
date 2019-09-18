import MainPageStore from '../MainPageStore';
import { action, computed, observable } from 'mobx';
import { ActObject } from '../types';
import { sortRowsBy } from '../Table/PrunedObjectsTableStore';
import { ColumnKind, IObjectRow, SortOrder } from '../../components/ObjectTable';

class SearchesStore {
  root: MainPageStore;

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
    const rows: Array<IObjectRow> = [];

    return {
      resultTable: {
        sortOrder: this.sortOrder,
        onSortChange: this.onSortChange,
        rows: sortRowsBy(this.sortOrder, rows),
        onRowClick: (actObject: ActObject) => {
          this.root.refineryStore.unpruneObjectId(actObject.id);
        }
      }
    };
  }
}

export default SearchesStore;
