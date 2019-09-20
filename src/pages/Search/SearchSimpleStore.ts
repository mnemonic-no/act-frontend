import MainPageStore from '../MainPageStore';
import { action, computed, observable } from 'mobx';

class SearchSimpleStore {
  root: MainPageStore;
  @observable simpleSearchValue = '';

  constructor(root: MainPageStore) {
    this.root = root;
  }

  @action.bound onSimpleSearchInputChange(value: string) {
    this.simpleSearchValue = value;
  }

  @computed
  get prepared() {
    return {
      label: 'Search for objects',
      value: this.simpleSearchValue,
      onChange: this.onSimpleSearchInputChange,
      onClear: () => (this.simpleSearchValue = ''),
      onSearch: () => this.root.backendStore.executeSimpleSearch(this.simpleSearchValue)
    };
  }
}

export default SearchSimpleStore;
