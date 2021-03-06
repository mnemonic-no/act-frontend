import { action, computed, observable } from 'mobx';
import * as _ from 'lodash/fp';

import { ActObject, isDone, isPending, isRejected, TConfig } from '../../../core/types';
import { ColumnKind, IObjectRow, SortOrder } from '../../../components/ObjectTable';
import { getObjectLabelFromFact } from '../../../core/domain';
import { sortRowsBy } from '../../Main/Table/PrunedObjectsTableStore';
import AppStore from '../../../AppStore';
import SearchPageStore from '../SearchPageStore';
import SimpleSearchBackendStore, { SimpleSearch } from '../../../backend/SimpleSearchBackendStore';
import { linkOnClickFn, objectTypeToColor, pluralize } from '../../../util/util';
import { urlToObjectSummaryPage } from '../../../Routing';
import { IColorText } from './Results';

const emptyFilterValue = 'Show all';

export const resultToRows = ({
  simpleSearch,
  selectedObjectIds,
  objectTypeFilter,
  objectColors,
  sortOrder,
  objectLabelFromFactType
}: {
  simpleSearch: SimpleSearch;
  selectedObjectIds: Set<string>;
  objectTypeFilter: Set<string>;
  objectColors: { [objectType: string]: string };
  sortOrder: SortOrder;
  objectLabelFromFactType: string | null;
}): Array<IObjectRow> => {
  if (!isDone(simpleSearch)) {
    return [];
  }

  return _.pipe(
    _.filter((o: ActObject) => objectTypeFilter.size === 0 || objectTypeFilter.has(o.type.name)),
    _.map((o: ActObject) => ({
      actObject: o,
      color: objectTypeToColor(objectColors, o.type.name),
      label: getObjectLabelFromFact(o, objectLabelFromFactType, simpleSearch.result.facts),
      isSelected: selectedObjectIds.has(o.id)
    })),
    rows => sortRowsBy(sortOrder, rows)
  )(simpleSearch.result.objects);
};

export const withLink = (rows: Array<IObjectRow>, navigateFn: (e: any) => void): Array<IObjectRow> => {
  return rows.map(r => {
    const href = urlToObjectSummaryPage(r.actObject);

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
  if (!isDone(simpleSearch)) {
    return [];
  }

  return _.pipe(
    _.filter((obj: ActObject) => selectedObjectIds.has(obj.id)),
    _.filter((o: ActObject) => objectTypeFilter.size === 0 || objectTypeFilter.has(o.type.name))
  )(simpleSearch.result.objects);
};

class ResultsStore {
  config: TConfig;
  appStore: AppStore;
  searchStore: SearchPageStore;
  simpleSearchBackendStore: SimpleSearchBackendStore;

  @observable sortOrder: SortOrder = { order: 'asc', orderBy: 'objectType' };
  @observable selectedObjectIds: Set<string> = new Set();
  @observable objectTypeFilter: Set<string> = new Set();

  constructor(
    appStore: AppStore,
    searchStore: SearchPageStore,
    simpleSearchBackendStore: SimpleSearchBackendStore,
    config: TConfig
  ) {
    this.config = config;
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
  removeAllFromSelection(objectIds: Array<string>) {
    objectIds.forEach(x => this.selectedObjectIds.delete(x));
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
    return this.simpleSearchBackendStore.getSimpleSearch(
      this.searchStore.activeSearch.searchString,
      this.searchStore.activeSearch.objectTypeFilter
    );
  }

  @action.bound
  onAddSelectedObjects() {
    const selectedObjects = this.selectedObjects;

    if (!this.selectedObjects) {
      return;
    }

    this.searchStore.root.mainPageStore.backendStore.executeSearches({
      searches: selectedObjects.map((obj: ActObject) => ({
        kind: 'objectFacts',
        objectType: obj.type.name,
        objectValue: obj.value
      })),
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

    if (isRejected(activeSimpleSearch)) {
      return {
        searchError: {
          title: 'Results for: ' + activeSimpleSearch.args.searchString,
          subTitle: 'Search failed. ' + activeSimpleSearch.error,
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
        objectColors: this.config.objectColors || {},
        sortOrder: this.sortOrder,
        objectLabelFromFactType: this.config.objectLabelFromFactType
      }),
      (url: string) => this.appStore.goToUrl(url)
    );

    const warningText =
      isDone(activeSimpleSearch) && activeSimpleSearch.result.limitExceeded
        ? 'Result set exceeds limit. Try to constrain your search or use the advanced search if you want to see more'
        : '';

    const isSearchFiltered = activeSimpleSearch.args.objectTypeFilter.length > 0;

    return {
      searchError: undefined,
      searchResult: {
        title: 'Results for: ' + activeSimpleSearch.args.searchString,
        subTitles: _.filter<IColorText>(Boolean)([
          isSearchFiltered && {
            text: 'Filter: ' + activeSimpleSearch.args.objectTypeFilter[0],
            color: objectTypeToColor(this.config.objectColors || {}, activeSimpleSearch.args.objectTypeFilter[0])
          },
          isDone(activeSimpleSearch) && { text: pluralize(activeSimpleSearch.result.objects.length, 'object') }
        ]),

        isResultEmpty: Boolean(isDone(activeSimpleSearch) && activeSimpleSearch.result.objects.length === 0),
        warningText: warningText,
        isLoading: isPending(activeSimpleSearch),
        onAddSelectedObjects: this.onAddSelectedObjects,
        objectTypeFilter: !isSearchFiltered
          ? {
              id: 'object-type-filter',
              label: 'Filter',
              emptyValue: emptyFilterValue,
              selectedValues: [...this.objectTypeFilter],
              values: isDone(activeSimpleSearch)
                ? _.uniq(activeSimpleSearch.result.objects.map(x => x.type.name)).sort()
                : [],
              onChange: this.onObjectTypeFilterChange
            }
          : undefined,
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
