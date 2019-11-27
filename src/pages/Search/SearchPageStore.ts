import { action, computed, observable } from 'mobx';

import { byTypeThenValue } from '../../util/util';
import { getObjectLabelFromFact } from '../../core/domain';
import config from '../../config';
import AppStore from '../../AppStore';
import ResultsStore from './Results/ResultsStore';
import SimpleSearchBackendStore from '../../backend/SimpleSearchBackendStore';
import DetailsStore from './Details/DetailsStore';

class SearchPageStore {
  root: AppStore;
  simpleSearchBackendStore: SimpleSearchBackendStore;
  autoCompleteSimpleSearchBackendStore: SimpleSearchBackendStore;

  @observable simpleSearchInputValue = '';
  @observable activeSearchString = '';
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
  setActiveSearchString(searchString: string) {
    this.activeSearchString = searchString;
  }

  @action.bound
  onSimpleSearchInputChange(value: string) {
    this.simpleSearchInputValue = value ? value : '';

    if (this.simpleSearchInputValue.length >= 3) {
      this.autoCompleteSimpleSearchBackendStore.execute(value);
    }
  }

  @action.bound
  onSearchSubmit(searchString: string) {
    this.activeSearchString = searchString;
    this.simpleSearchBackendStore.execute(searchString);
    this.simpleSearchInputValue = '';
  }

  @computed
  get prepared() {
    const simpleSearch = this.autoCompleteSimpleSearchBackendStore.getSimpleSearch(this.simpleSearchInputValue);

    const autoSuggester = {
      label: 'Search for objects',
      value: this.simpleSearchInputValue,
      isLoading: simpleSearch && simpleSearch.status === 'pending',
      suggestions:
        simpleSearch && simpleSearch.objects
          ? simpleSearch.objects
              .slice() // Don't mutate the underlying array
              .sort(byTypeThenValue)
              .map(actObject => ({
                actObject: actObject,
                objectLabel:
                  getObjectLabelFromFact(actObject, config.objectLabelFromFactType, simpleSearch.facts) ||
                  actObject.value
              }))
              .slice(0, this.suggestionLimit)
          : [],
      onChange: this.onSimpleSearchInputChange,
      onSuggestionSelected: (s: any) => {
        this.onSearchSubmit(`"${s.objectLabel}"`);
      }
    };

    const hasActiveSearch = this.simpleSearchBackendStore.getSimpleSearch(this.activeSearchString);

    const historyItems = this.simpleSearchBackendStore.searchList
      .map(s => ({
        label: s.searchString,
        labelSecondary: s.objects ? `(${s.objects.length})` : '',
        onClick: () => {
          this.setActiveSearchString(s.searchString);
        }
      }))
      .sort((a: { label: string }, b: { label: string }) => (a.label > b.label ? 1 : -1));

    return {
      pageMenu: this.root.pageMenu,
      hasActiveSearch: hasActiveSearch,
      searchInput: autoSuggester,
      searchHistoryItems: historyItems,
      onSearch: () => this.onSearchSubmit(this.simpleSearchInputValue),
      onClear: () => (this.simpleSearchInputValue = '')
    };
  }
}

export default SearchPageStore;
