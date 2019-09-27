import { action, observable } from 'mobx';
import * as _ from 'lodash/fp';

import { factKeywordSearch, objectKeywordSearch } from '../core/dataLoaders';
import { factsToObjects } from '../core/transformers';
import { ActFact, ActObject } from './types';

export type SimpleSearch = {
  searchString: string;
  status: 'pending' | 'rejected' | 'done';
  objects?: Array<ActObject>;
  facts?: Array<ActFact>;
  limitExceeded?: boolean;
  errorDetails?: string;
};

class SimpleSearchBackendStore {
  @observable searches: { [searchString: string]: SimpleSearch } = {};
  resultLimit: number;

  config: any;

  constructor(config: any, limit: number) {
    this.config = config;
    this.resultLimit = limit;
  }

  @action.bound
  async execute(searchString: string) {
    if (this.searches[searchString] && this.searches[searchString].status !== 'rejected') {
      return;
    }

    const search: SimpleSearch = {
      searchString: searchString,
      status: 'pending'
    };
    this.searches[searchString] = search;

    try {
      const [objectsByValue, factsByNameResult] = await Promise.all([
        objectKeywordSearch(searchString, this.resultLimit),
        this.config.objectLabelFromFactType
          ? factKeywordSearch(searchString, [this.config.objectLabelFromFactType], this.resultLimit)
          : Promise.resolve([])
      ]);

      const objectsFromFacts = factsToObjects(factsByNameResult);

      const result = _.uniqBy((x: ActObject) => x.id)([...objectsByValue, ...objectsFromFacts]);

      this.searches[searchString] = {
        ...search,
        status: 'done',
        objects: result,
        facts: factsByNameResult,
        limitExceeded: this.resultLimit <= objectsByValue.length || this.resultLimit <= objectsFromFacts.length
      };
    } catch (err) {
      this.searches[searchString] = { ...search, status: 'rejected', errorDetails: err.message };
    }
  }

  getSimpleSearch(searchString: string) {
    return this.searches[searchString];
  }

  @action.bound
  retry(search: SimpleSearch) {
    this.execute(search.searchString);
  }
}

export default SimpleSearchBackendStore;
