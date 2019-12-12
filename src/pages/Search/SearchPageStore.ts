import { action, computed, observable } from 'mobx';

import { byName, byTypeThenValue } from '../../util/util';
import { getObjectLabelFromFact } from '../../core/domain';
import { isDone, isPending } from '../../core/types';
import config from '../../config';
import AppStore from '../../AppStore';
import DetailsStore from './Details/DetailsStore';
import ResultsStore from './Results/ResultsStore';
import SimpleSearchBackendStore, { SimpleSearchArgs } from '../../backend/SimpleSearchBackendStore';

class SearchPageStore {
  root: AppStore;
  simpleSearchBackendStore: SimpleSearchBackendStore;
  autoCompleteSimpleSearchBackendStore: SimpleSearchBackendStore;
  @observable isAdvancedSearchEnabled: boolean = false;

  @observable searchInput: SimpleSearchArgs = {
    searchString: '',
    objectTypeFilter: []
  };

  @observable activeSearch: SimpleSearchArgs = {
    searchString: '',
    objectTypeFilter: []
  };
  suggestionLimit: number;

  ui: {
    resultsStore: ResultsStore;
    detailsStore: DetailsStore;
  };

  constructor(
    root: AppStore,
    config: any,
    simpleSearchBackendStore: SimpleSearchBackendStore,
    autoCompleteSimpleSearchBackendStore: SimpleSearchBackendStore
  ) {
    this.root = root;
    this.simpleSearchBackendStore = simpleSearchBackendStore;
    this.autoCompleteSimpleSearchBackendStore = autoCompleteSimpleSearchBackendStore;
    this.suggestionLimit = simpleSearchBackendStore.resultLimit;

    const resultsStore = new ResultsStore(root, this, simpleSearchBackendStore);

    this.ui = {
      resultsStore: resultsStore,
      detailsStore: new DetailsStore(root, resultsStore, config.objectLabelFromFactType)
    };
  }

  @action.bound
  onSimpleSearchInputChange(value: string, objectTypeFilter: Array<string>) {
    this.searchInput = { searchString: value ? value : '', objectTypeFilter: objectTypeFilter };

    if (this.searchInput.searchString.length >= 3) {
      this.autoCompleteSimpleSearchBackendStore.execute({ searchString: value, objectTypeFilter: objectTypeFilter });
    }
  }

  @action.bound
  onSearchSubmit(searchString: string, objectTypeFilter: Array<string> = []) {
    if (searchString.length < 1) return;

    this.activeSearch = { searchString: searchString, objectTypeFilter: objectTypeFilter };
    this.simpleSearchBackendStore.execute({ searchString: searchString, objectTypeFilter: objectTypeFilter });
    this.searchInput.searchString = '';
  }

  @action.bound
  setObjectTypeFilter(objectTypeFilter: Array<string>) {
    this.searchInput.objectTypeFilter = objectTypeFilter;
  }

  @action.bound
  clearObjectTypeFilter() {
    this.searchInput.objectTypeFilter = [];
  }

  @computed
  get prepared() {
    const simpleSearch = this.autoCompleteSimpleSearchBackendStore.getSimpleSearch(
      this.searchInput.searchString,
      this.searchInput.objectTypeFilter
    );

    const autoSuggester = {
      label: 'Search for objects',
      value: this.searchInput.searchString,
      isLoading: isPending(simpleSearch),
      suggestions: isDone(simpleSearch)
        ? simpleSearch.result.objects
            .slice() // Don't mutate the underlying array
            .sort(byTypeThenValue)
            .map(actObject => ({
              actObject: actObject,
              objectLabel:
                getObjectLabelFromFact(actObject, config.objectLabelFromFactType, simpleSearch.result.facts) ||
                actObject.value
            }))
            .slice(0, this.suggestionLimit)
        : [],
      onChange: (value: string) => this.onSimpleSearchInputChange(value, this.searchInput.objectTypeFilter),
      onSuggestionSelected: (s: any) => {
        this.onSearchSubmit(`"${s.objectLabel}"`, this.searchInput.objectTypeFilter);
      }
    };

    const hasActiveSearch = this.simpleSearchBackendStore.searchList.length > 0;

    const historyItems = this.simpleSearchBackendStore.searchList
      .map(s => ({
        label:
          s.args.searchString +
          (s.args.objectTypeFilter.length > 0 ? ' (' + s.args.objectTypeFilter.join(', ') + ')' : ''),
        labelSecondary: isDone(s) ? `${s.result.objects.length}` : '',
        onClick: () => {
          this.activeSearch = s.args;
        }
      }))
      .sort((a: { label: string }, b: { label: string }) => (a.label > b.label ? 1 : -1));

    const objectTypeFilterItems =
      this.root.backendStore.actObjectTypes && isDone(this.root.backendStore.actObjectTypes)
        ? this.root.backendStore.actObjectTypes.result.objectTypes
            .slice()
            .sort(byName)
            .map(x => ({ text: x.name }))
        : [];

    return {
      pageMenu: this.root.pageMenu,
      hasActiveSearch: hasActiveSearch,
      searchInput: autoSuggester,
      searchHistoryItems: historyItems,
      isAdvancedSearchEnabled: this.isAdvancedSearchEnabled,
      advancedSearchButton: {
        text: 'Advanced search',
        onClick: () => {
          this.isAdvancedSearchEnabled = true;
        }
      },
      objectTypeFilter: {
        title: 'Object type',
        selection: this.searchInput.objectTypeFilter.join(', '),
        options: objectTypeFilterItems,
        onChange: (item: { text: string }) => {
          this.setObjectTypeFilter([item.text]);
        },
        onClear: () => {
          this.clearObjectTypeFilter();
        }
      },
      onSearch: () => this.onSearchSubmit(this.searchInput.searchString, this.searchInput.objectTypeFilter)
    };
  }
}

export default SearchPageStore;
