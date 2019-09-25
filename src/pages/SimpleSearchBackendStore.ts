import { action, computed, observable } from 'mobx';
import * as _ from 'lodash/fp';

import { factKeywordSearch, objectKeywordSearch } from '../core/dataLoaders';
import { factsToObjects } from '../core/transformers';
import { ActFact, ActObject } from './types';

export type SimpleSearch = {
  searchString: string;
  status: 'pending' | 'rejected' | 'done';
  objects?: Array<ActObject>;
  facts?: Array<ActFact>;
};

class SimpleSearchBackendStore {
  @observable selectedSearchString = '';
  @observable searches: { [query: string]: SimpleSearch } = {};

  config: any;

  constructor(config: any) {
    this.config = config;
  }

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
        this.config.objectLabelFromFactType
          ? factKeywordSearch(searchString, [this.config.objectLabelFromFactType])
          : Promise.resolve([])
      ]);

      const objectsFromFacts = factsToObjects(factsByNameResult);

      const result = _.uniqBy((x: ActObject) => x.id)([...objectsByValue, ...objectsFromFacts]);

      this.searches[searchString] = { ...search, status: 'done', objects: result, facts: factsByNameResult };
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
