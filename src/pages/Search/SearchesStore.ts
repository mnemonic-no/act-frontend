import * as _ from 'lodash/fp';
import { action, computed, observable } from 'mobx';

import { ActObject } from '../types';
import config from '../../config';
import MainPageStore from '../MainPageStore';
import { ColumnKind, IObjectRow, SortOrder } from '../../components/ObjectTable';
import { sortRowsBy } from '../Table/PrunedObjectsTableStore';
import { getObjectLabelFromFact } from '../../core/transformers';
import { SimpleSearch } from '../SimpleSearchBackendStore';

const emptyFilterValue = 'Show all';

export const resultToRows = ({
  simpleSearch,
  selectedObjectIds,
  objectTypeFilter,
  sortOrder
}: {
  simpleSearch: SimpleSearch;
  selectedObjectIds: Set<string>;
  objectTypeFilter: Set<string>;
  sortOrder: SortOrder;
}): Array<IObjectRow> => {
  if (simpleSearch.status !== 'done' || !simpleSearch.objects) {
    return [];
  }

  return _.pipe(
    _.filter((o: ActObject) => objectTypeFilter.size === 0 || objectTypeFilter.has(o.type.name)),
    _.map((o: ActObject) => ({
      actObject: o,
      label: getObjectLabelFromFact(o, config.objectLabelFromFactType, simpleSearch.facts),
      isSelected: selectedObjectIds.has(o.id)
    })),
    rows => sortRowsBy(sortOrder, rows)
  )(simpleSearch.objects);
};

class SearchesStore {
  root: MainPageStore;

  @observable sortOrder: SortOrder = { order: 'asc', orderBy: 'objectType' };
  @observable selectedObjectIds: Set<string> = new Set();
  @observable objectTypeFilter: Set<string> = new Set();

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

  @action.bound
  toggleSelection(objectId: string) {
    if (this.selectedObjectIds.has(objectId)) {
      this.selectedObjectIds.delete(objectId);
    } else {
      this.selectedObjectIds.add(objectId);
    }
  }

  @action.bound
  onSelectAllClick(rows: Array<IObjectRow>) {
    const isAllSelected = rows.length === this.selectedObjectIds.size;

    if (isAllSelected) {
      this.selectedObjectIds = new Set();
    } else {
      this.selectedObjectIds = new Set(rows.map(row => row.actObject.id));
    }
  }

  @action.bound
  onAddSelectedObjects() {
    const activeSimpleSearch = this.root.backendStore.simpleSearchBackendStore.selectedSimpleSearch;
    if (!activeSimpleSearch || !activeSimpleSearch.objects) {
      return;
    }

    const selectedObjects = _.pipe(
      _.filter((obj: ActObject) => this.selectedObjectIds.has(obj.id)),
      _.filter((o: ActObject) => this.objectTypeFilter.size === 0 || this.objectTypeFilter.has(o.type.name))
    )(activeSimpleSearch.objects);

    this.root.backendStore.executeSearches({
      searches: selectedObjects.map((obj: ActObject) => ({ objectType: obj.type.name, objectValue: obj.value })),
      replace: false
    });

    // Clear selection and show graph
    this.selectedObjectIds = new Set();
    this.root.ui.contentStore.onTabSelected('graph');
  }

  @action.bound
  onObjectTypeFilterChange(value: Array<string>) {
    if (_.includes(emptyFilterValue)(value)) {
      this.clearObjectTypeFilter();
    } else {
      this.objectTypeFilter = new Set(value);
    }
  }

  @action.bound
  clearObjectTypeFilter() {
    this.objectTypeFilter = new Set();
  }

  @computed
  get prepared() {
    const searchHistory = Object.keys(this.root.backendStore.simpleSearchBackendStore.searches);

    const activeSimpleSearch = this.root.backendStore.simpleSearchBackendStore.selectedSimpleSearch;

    if (!activeSimpleSearch) {
      return {
        isEmpty: true
      };
    }

    const rows = resultToRows({
      simpleSearch: activeSimpleSearch,
      selectedObjectIds: this.selectedObjectIds,
      objectTypeFilter: this.objectTypeFilter,
      sortOrder: this.sortOrder
    });

    return {
      isEmpty: false,
      searchResult: {
        title: 'Results for: ' + activeSimpleSearch.searchString,
        subTitle: activeSimpleSearch.objects ? activeSimpleSearch.objects.length + ' objects' : '',
        isLoading: activeSimpleSearch.status === 'pending',
        onAddSelectedObjects: this.onAddSelectedObjects,
        searchHistory: searchHistory,
        objectTypeFilter: {
          id: 'object-type-filter',
          label: 'Filter',
          emptyValue: emptyFilterValue,
          selectedValues: [...this.objectTypeFilter],
          values: activeSimpleSearch.objects ? _.uniq(activeSimpleSearch.objects.map(x => x.type.name)).sort() : [],
          onChange: this.onObjectTypeFilterChange
        },
        resultTable: {
          sortOrder: this.sortOrder,
          onSortChange: this.onSortChange,
          rows: rows,
          onSelectAllClick: () => {
            this.onSelectAllClick(rows);
          },
          onCheckboxClick: (actObject: ActObject) => {
            this.toggleSelection(actObject.id);
          },
          onRowClick: (actObject: ActObject) => {
            this.toggleSelection(actObject.id);
          }
        }
      }
    };
  }
}

export default SearchesStore;
