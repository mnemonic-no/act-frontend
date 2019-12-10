import { action, computed, observable } from 'mobx';
import * as _ from 'lodash/fp';

import { factKeywordSearch, objectKeywordSearch } from '../core/dataLoaders';
import { factsToObjects } from '../core/domain';
import { ActFact, ActObject, isRejected, LoadingStatus, TRequestLoadable } from '../core/types';

export type SimpleSearchArgs = { searchString: string; objectTypeFilter: Array<string> };

export type SimpleSearch = TRequestLoadable<
  SimpleSearchArgs,
  { objects: Array<ActObject>; facts: Array<ActFact>; limitExceeded?: boolean }
>;

const simpleSearchId = ({ searchString, objectTypeFilter }: SimpleSearchArgs) =>
  searchString + ':' + objectTypeFilter.sort().join(',');

class SimpleSearchBackendStore {
  config: any;
  @observable searches: { [id: string]: SimpleSearch } = {};
  resultLimit: number;

  constructor(config: any, limit: number) {
    this.config = config;
    this.resultLimit = limit;
  }

  @action.bound
  async execute({ searchString, objectTypeFilter }: SimpleSearchArgs) {
    const search: SimpleSearch = {
      id: simpleSearchId({ searchString: searchString, objectTypeFilter: objectTypeFilter }),
      args: { searchString: searchString, objectTypeFilter: objectTypeFilter },
      status: LoadingStatus.PENDING
    };

    if (this.includes(search) && !isRejected(this.searches[search.id])) {
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
        status: LoadingStatus.DONE,
        result: {
          objects: result,
          facts: factsByNameResult,
          limitExceeded: this.resultLimit <= objectsByValue.length || this.resultLimit <= objectsFromFacts.length
        }
      };
    } catch (err) {
      this.searches[search.id] = { ...search, status: LoadingStatus.REJECTED, error: err.message };
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
    this.execute(search.args);
  }

  @computed
  get searchList() {
    return Object.values(this.searches);
  }
}

export default SimpleSearchBackendStore;
