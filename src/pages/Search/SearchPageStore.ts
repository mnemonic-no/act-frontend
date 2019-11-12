import { action, computed, observable } from 'mobx';
import { byTypeThenName } from '../../util/util';
import { getObjectLabelFromFact } from '../../core/domain';
import config from '../../config';
import AppStore from '../../AppStore';
import SimpleSearchBackendStore from '../Main/SimpleSearchBackendStore';

class SearchPageStore {
  root: AppStore;
  simpleSearchBackendStore: SimpleSearchBackendStore;
  @observable simpleSearchInputValue = '';
  @observable activeSearchString = '';
  suggestionLimit: number;

  constructor(root: AppStore, config: any, simpleSearchBackendStore: SimpleSearchBackendStore) {
    this.root = root;
    this.simpleSearchBackendStore = simpleSearchBackendStore;
    this.suggestionLimit = simpleSearchBackendStore.resultLimit;
  }

  @action.bound
  setActiveSearchString(searchString: string) {
    this.activeSearchString = searchString;
  }

  @action.bound
  onSimpleSearchInputChange(value: string) {
    this.simpleSearchInputValue = value ? value : '';

    if (this.simpleSearchInputValue.length >= 3) {
      this.simpleSearchBackendStore.execute(value);
    }
  }

  @action.bound
  onSearchSubmit() {
    this.activeSearchString = this.simpleSearchInputValue;
    this.simpleSearchBackendStore.execute(this.simpleSearchInputValue);
  }

  @computed
  get prepared() {
    const simpleSearch = this.simpleSearchBackendStore.getSimpleSearch(this.simpleSearchInputValue);

    const autoSuggester = {
      isLoading: simpleSearch && simpleSearch.status === 'pending',
      suggestions:
        simpleSearch && simpleSearch.objects
          ? simpleSearch.objects
              .slice() // Don't mutate the underlying array
              .sort(byTypeThenName)
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
        this.root.mainPageStore.backendStore.executeSearch({
          objectType: s.actObject.type.name,
          objectValue: s.actObject.value
        });
      },
      value: this.simpleSearchInputValue,
      label: 'Search for objects'
    };

    const hasActiveSearch = this.simpleSearchBackendStore.getSimpleSearch(this.activeSearchString);

    return {
      hasActiveSearch: hasActiveSearch,
      searchInput: autoSuggester,
      onSearch: this.onSearchSubmit,
      onClear: () => (this.simpleSearchInputValue = '')
    };
  }
}

export default SearchPageStore;
