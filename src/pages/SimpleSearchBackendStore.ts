import { action, computed, observable } from 'mobx';
import * as _ from 'lodash/fp';

import { factKeywordSearch, objectKeywordSearch } from '../core/dataLoaders';
import { factsToObjects } from '../core/domain';
import { ActFact, ActObject } from '../core/types';

export type SimpleSearch = {
  id: string;
  searchString: string;
  objectTypeFilter: Array<string>;
  status: 'pending' | 'rejected' | 'done';
  objects?: Array<ActObject>;
  facts?: Array<ActFact>;
  limitExceeded?: boolean;
  errorDetails?: string;
};

const simpleSearchId = ({ searchString, objectTypeFilter }: Pick<SimpleSearch, 'searchString' | 'objectTypeFilter'>) =>
  searchString + ':' + objectTypeFilter.sort().join(',');

class SimpleSearchBackendStore {
  config: any;
  @observable searches: { [searchString: string]: SimpleSearch } = {};
  resultLimit: number;

  constructor(config: any, limit: number) {
    this.config = config;
    this.resultLimit = limit;
  }

  @action.bound
  async execute(searchString: string, objectTypeFilter: Array<string> = []) {
    const search: SimpleSearch = {
      id: simpleSearchId({ searchString: searchString, objectTypeFilter: objectTypeFilter }),
      searchString: searchString,
      objectTypeFilter: objectTypeFilter,
      status: 'pending'
    };

    if (this.includes(search) && this.searches[search.id].status !== 'rejected') {
      return;
    }

    this.searches[search.id] = search;

    try {
      const [objectsByValue, factsByNameResult] = await Promise.all([
        objectKeywordSearch({ keywords: searchString, objectTypes: objectTypeFilter, limit: this.resultLimit }),
        this.config.objectLabelFromFactType
          ? factKeywordSearch({
              keywords: searchString,
              factTypes: [this.config.objectLabelFromFactType],
              objectTypes: objectTypeFilter,
              limit: this.resultLimit
            })
          : Promise.resolve([])
      ]);

      const objectsFromFacts = factsToObjects(factsByNameResult);

      const result = _.uniqBy((x: ActObject) => x.id)([...objectsByValue, ...objectsFromFacts]);
      this.searches[search.id] = {
        ...search,
        status: 'done',
        objects: result,
        facts: factsByNameResult,
        limitExceeded: this.resultLimit <= objectsByValue.length || this.resultLimit <= objectsFromFacts.length
      };
    } catch (err) {
      this.searches[simpleSearchId(search)] = { ...search, status: 'rejected', errorDetails: err.message };
    }
  }

  getSimpleSearch(searchString: string, objectTypeFilter: Array<string> = []) {
    return this.searches[simpleSearchId({ searchString: searchString, objectTypeFilter: objectTypeFilter })];
  }

  includes(s: SimpleSearch) {
    return this.searches.hasOwnProperty(s.id);
  }

  @action.bound
  retry(search: SimpleSearch) {
    this.execute(search.searchString);
  }

  @computed
  get searchList() {
    return Object.values(this.searches);
  }
}

export default SimpleSearchBackendStore;
