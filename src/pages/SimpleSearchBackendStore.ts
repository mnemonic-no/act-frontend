import { action, computed, observable } from 'mobx';
import { objectSearch } from '../core/dataLoaders';

type SimpleSearch = {
  searchString: string;
  status: 'pending' | 'rejected' | 'done';
  result?: any;
};

class SimpleSearchBackendStore {
  @observable selectedSearchString = '';
  @observable searches: { [query: string]: SimpleSearch } = {};

  @action.bound
  async execute(searchString: string) {
    this.selectedSearchString = searchString;
    if (this.searches[searchString]) {
      return;
    }

    const search: SimpleSearch = {
      searchString: searchString,
      status: 'pending'
    };
    this.searches[searchString] = search;

    try {
      const result = await objectSearch(searchString);
      this.searches[searchString] = { ...search, status: 'done', result: result };
    } catch (err) {
      this.searches[searchString] = { ...search, status: 'rejected' };
    }
  }

  @computed
  get selectedSimpleSearch(): SimpleSearch | undefined {
    return this.searches[this.selectedSearchString];
  }
}

export default SimpleSearchBackendStore;
