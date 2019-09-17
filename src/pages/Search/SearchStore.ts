import MainPageStore from '../MainPageStore';
import { action, observable } from 'mobx';
import SearchByObjectTypeStore from './SearchByObjectTypeStore';
import SearchSimpleStore from './SearchSimpleStore';

class SearchStore {
  root: MainPageStore;
  searchByObjectTypeStore: SearchByObjectTypeStore;
  searchSimpleStore: SearchSimpleStore;

  isSimpleSearchEnabled: boolean;

  @observable isSimpleSearch = false;

  constructor(root: MainPageStore, config: any) {
    this.root = root;
    this.isSimpleSearchEnabled = Boolean(config.isSimpleSearchEnabled) || false;
    this.searchByObjectTypeStore = new SearchByObjectTypeStore(root, config);
    this.searchSimpleStore = new SearchSimpleStore(root);
  }

  @action.bound
  toggleSelection() {
    this.isSimpleSearch = !this.isSimpleSearch;
  }
}

export default SearchStore;
