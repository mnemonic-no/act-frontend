import { action, computed, observable } from 'mobx';
import * as _ from 'lodash/fp';

import { factKeywordSearch, objectKeywordSearch } from '../core/dataLoaders';
import { factsToObjects } from '../core/transformers';
import { ActObject } from './types';

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
      const [objectsByValue, factsByNameResult] = await Promise.all([
        objectKeywordSearch(searchString),
        factKeywordSearch(searchString)
      ]);

      const objectsFromFacts = factsToObjects(factsByNameResult);

      const result = _.uniqBy((x: ActObject) => x.id)([...objectsByValue, ...objectsFromFacts]);

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
