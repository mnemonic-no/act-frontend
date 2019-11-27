import { action, computed, observable } from 'mobx';
import * as _ from 'lodash/fp';

import { ActObject } from '../../../core/types';
import { ColumnKind, IObjectRow, SortOrder } from '../../../components/ObjectTable';
import { getObjectLabelFromFact } from '../../../core/domain';
import { sortRowsBy } from '../../Main/Table/PrunedObjectsTableStore';
import AppStore from '../../../AppStore';
import config from '../../../config';
import SearchPageStore from '../SearchPageStore';
import SimpleSearchBackendStore, { SimpleSearch } from '../../../backend/SimpleSearchBackendStore';
import { linkOnClickFn } from '../../../util/util';

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

export const withLink = (rows: Array<IObjectRow>, navigateFn: (e: any) => void): Array<IObjectRow> => {
  return rows.map(r => {
    const href = '/object-summary/' + r.actObject.type.name + '/' + r.actObject.value;

    return {
      ...r,
      objectValueLink: {
        href: href,
        onClick: linkOnClickFn({
          href: href,
          navigateFn: navigateFn
        })
      }
    };
  });
};

export const selectedObjects = ({
  simpleSearch,
  selectedObjectIds,
  objectTypeFilter
}: {
  simpleSearch: SimpleSearch;
  selectedObjectIds: Set<string>;
  objectTypeFilter: Set<string>;
}) => {
  if (!simpleSearch || !simpleSearch.objects) {
    return [];
  }

  return _.pipe(
    _.filter((obj: ActObject) => selectedObjectIds.has(obj.id)),
    _.filter((o: ActObject) => objectTypeFilter.size === 0 || objectTypeFilter.has(o.type.name))
  )(simpleSearch.objects);
};

class ResultsStore {
  appStore: AppStore;
  searchStore: SearchPageStore;
  simpleSearchBackendStore: SimpleSearchBackendStore;

  @observable sortOrder: SortOrder = { order: 'asc', orderBy: 'objectType' };
  @observable selectedObjectIds: Set<string> = new Set();
  @observable objectTypeFilter: Set<string> = new Set();

  constructor(appStore: AppStore, searchStore: SearchPageStore, simpleSearchBackendStore: SimpleSearchBackendStore) {
    this.appStore = appStore;
    this.searchStore = searchStore;
    this.simpleSearchBackendStore = simpleSearchBackendStore;
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
  clearSelection() {
    this.selectedObjectIds = new Set();
  }

  @action.bound
  onSelectAllClick(rows: Array<IObjectRow>) {
    const isAllSelected = rows.length === this.selectedObjectIds.size;

    if (isAllSelected) {
      this.clearSelection();
    } else {
      this.selectedObjectIds = new Set(rows.map(row => row.actObject.id));
    }
  }

  @computed
  get activeSimpleSearch() {
    return this.simpleSearchBackendStore.getSimpleSearch(this.searchStore.activeSearchString);
  }

  @action.bound
  onAddSelectedObjects() {
    const selectedObjects = this.selectedObjects;

    if (!this.selectedObjects) {
      return;
    }

    this.searchStore.root.mainPageStore.backendStore.executeSearches({
      searches: selectedObjects.map((obj: ActObject) => ({ objectType: obj.type.name, objectValue: obj.value })),
      replace: false
    });

    // Clear selection and show graph
    this.selectedObjectIds = new Set();
    this.searchStore.root.mainPageStore.ui.contentStore.onTabSelected('graph');
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
  get selectedObjects() {
    return selectedObjects({
      simpleSearch: this.activeSimpleSearch,
      selectedObjectIds: this.selectedObjectIds,
      objectTypeFilter: this.objectTypeFilter
    });
  }

  @computed
  get prepared() {
    const activeSimpleSearch = this.activeSimpleSearch;

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
            this.simpleSearchBackendStore.retry(activeSimpleSearch);
          }
        }
      };
    }

    const rows = withLink(
      resultToRows({
        simpleSearch: activeSimpleSearch,
        selectedObjectIds: this.selectedObjectIds,
        objectTypeFilter: this.objectTypeFilter,
        sortOrder: this.sortOrder
      }),
      (url: string) => this.appStore.goToUrl(url)
    );

    const warningText = activeSimpleSearch.limitExceeded
      ? 'Result set exceeds limit. Try to constrain your search or use the advanced search if you want to see more'
      : '';

    return {
      searchError: undefined,
      searchResult: {
        title: 'Results for: ' + activeSimpleSearch.searchString,
        subTitle: activeSimpleSearch.objects ? activeSimpleSearch.objects.length + ' objects' : '',
        isResultEmpty: Boolean(activeSimpleSearch.objects && activeSimpleSearch.objects.length === 0),
        warningText: warningText,
        isLoading: activeSimpleSearch.status === 'pending',
        onAddSelectedObjects: this.onAddSelectedObjects,
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

export default ResultsStore;
