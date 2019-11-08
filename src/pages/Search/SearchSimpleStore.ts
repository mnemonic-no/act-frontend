import { action, computed, observable } from 'mobx';

import config from '../../config';
import MainPageStore from '../MainPageStore';
import { byTypeThenName } from '../../util/util';
import { getObjectLabelFromFact } from '../../core/domain';

class SearchSimpleStore {
  root: MainPageStore;
  @observable simpleSearchValue = '';
  suggestionLimit: number;

  constructor(root: MainPageStore) {
    this.root = root;
    this.suggestionLimit = this.root.backendStore.autoCompleteSimpleSearchBackendStore.resultLimit;
  }

  @action.bound
  onSimpleSearchInputChange(value: string) {
    this.simpleSearchValue = value ? value : '';

    if (this.simpleSearchValue.length >= 3) {
      this.root.backendStore.autoCompleteSimpleSearchBackendStore.execute(value);
    }
  }

  @computed
  get prepared() {
    const simpleSearch = this.root.backendStore.autoCompleteSimpleSearchBackendStore.getSimpleSearch(
      this.simpleSearchValue
    );

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
        this.root.backendStore.executeSearch({ objectType: s.actObject.type.name, objectValue: s.actObject.value });
      },
      value: this.simpleSearchValue,
      label: 'Search for objects'
    };

    return {
      autoSuggester: autoSuggester,
      value: this.simpleSearchValue,
      onChange: this.onSimpleSearchInputChange,
      onClear: () => (this.simpleSearchValue = ''),
      onSearch: () => this.root.backendStore.executeSimpleSearch(this.simpleSearchValue)
    };
  }
}

export default SearchSimpleStore;
