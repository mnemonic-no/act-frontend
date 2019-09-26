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
  limitExceeded?: boolean;
  errorDetails?: string;
};

const resultLimit = 300;

class SimpleSearchBackendStore {
  @observable selectedSearchString = '';
  @observable searches: { [searchString: string]: SimpleSearch } = {};

  config: any;

  constructor(config: any) {
    this.config = config;
  }

  @action.bound
  async execute(searchString: string) {
    this.selectedSearchString = searchString;
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
        objectKeywordSearch(searchString, resultLimit),
        this.config.objectLabelFromFactType
          ? factKeywordSearch(searchString, [this.config.objectLabelFromFactType], resultLimit)
          : Promise.resolve([])
      ]);

      const objectsFromFacts = factsToObjects(factsByNameResult);

      const result = _.uniqBy((x: ActObject) => x.id)([...objectsByValue, ...objectsFromFacts]);

      this.searches[searchString] = {
        ...search,
        status: 'done',
        objects: result,
        facts: factsByNameResult,
        limitExceeded: resultLimit <= objectsByValue.length || resultLimit <= objectsFromFacts.length
      };
    } catch (err) {
      this.searches[searchString] = { ...search, status: 'rejected', errorDetails: err.message };
    }
  }

  @computed
  get selectedSimpleSearch(): SimpleSearch | undefined {
    return this.searches[this.selectedSearchString];
  }

  @action.bound
  setSelectedSimpleSearch(s: SimpleSearch) {
    return (this.selectedSearchString = s.searchString);
  }

  @action.bound
  retry(search: SimpleSearch) {
    this.execute(search.searchString);
  }
}

export default SimpleSearchBackendStore;
