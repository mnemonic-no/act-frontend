import * as _ from 'lodash/fp';
import { action, computed, observable } from 'mobx';

import { ActObject } from '../../../core/types';
import config from '../../../config';
import MainPageStore from '../MainPageStore';
import { ColumnKind, IObjectRow, SortOrder } from '../../../components/ObjectTable';
import { sortRowsBy } from '../Table/PrunedObjectsTableStore';
import { getObjectLabelFromFact } from '../../../core/domain';
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

  @observable activeSearchString = '';
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
    const activeSimpleSearch = this.root.backendStore.simpleSearchBackendStore.getSimpleSearch(this.activeSearchString);
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

  @action.bound
  setActiveSearchString(searchString: string) {
    this.activeSearchString = searchString;
    this.clearObjectTypeFilter();
  }

  @computed
  get prepared() {
    const activeSimpleSearch = this.root.backendStore.simpleSearchBackendStore.getSimpleSearch(this.activeSearchString);

    if (!activeSimpleSearch) {
      return {
        isEmpty: true
      };
    }

    if (activeSimpleSearch.status === 'rejected') {
      return {
        searchError: {
          title: 'Results for: ' + activeSimpleSearch.searchString,
          subTitle: 'Search failed. ' + (activeSimpleSearch.errorDetails ? activeSimpleSearch.errorDetails : ''),
          onRetryClick: () => {
            this.root.backendStore.simpleSearchBackendStore.retry(activeSimpleSearch);
          }
        }
      };
    }

    const rows = resultToRows({
      simpleSearch: activeSimpleSearch,
      selectedObjectIds: this.selectedObjectIds,
      objectTypeFilter: this.objectTypeFilter,
      sortOrder: this.sortOrder
    });

    const warningText = activeSimpleSearch.limitExceeded
      ? 'Result set exceeds limit. Try to constrain your search or use the advanced search if you want to see more'
      : '';

    const historyItems = this.root.backendStore.simpleSearchBackendStore.searchList
      .map(s => ({
        label: s.searchString,
        labelSecondary: s.objects ? `(${s.objects.length})` : '',
        onClick: () => {
          this.setActiveSearchString(s.searchString);
        }
      }))
      .sort((a: { label: string }, b: { label: string }) => (a.label > b.label ? 1 : -1));

    return {
      searchResult: {
        title: 'Results for: ' + activeSimpleSearch.searchString,
        subTitle: activeSimpleSearch.objects ? activeSimpleSearch.objects.length + ' objects' : '',
        isResultEmpty: Boolean(activeSimpleSearch.objects && activeSimpleSearch.objects.length === 0),
        warningText: warningText,
        isLoading: activeSimpleSearch.status === 'pending',
        onAddSelectedObjects: this.onAddSelectedObjects,
        historyItems: historyItems,
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
