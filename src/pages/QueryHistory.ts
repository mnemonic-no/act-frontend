import { action, computed, observable } from 'mobx';
import MainPageStore from './MainPageStore';
import { isFactSearch, isObjectSearch, Query, QueryResult } from './types';
import * as _ from 'lodash/fp';

export const queryHistoryToPath = (queries: Array<Query>) => {
  const latest = _.last(queries);
  const search = latest ? latest.search : '';

  if (!search || isFactSearch(search)) {
    return '';
  }

  if (isObjectSearch(search) && !_.isEmpty(search.objectValue) && !_.isEmpty(search.objectType)) {
    if (search.query && !_.isEmpty(search.query)) {
      return (
        '/graph-query/' +
        encodeURIComponent(search.objectType) +
        '/' +
        encodeURIComponent(search.objectValue) +
        '/' +
        encodeURIComponent(search.query)
      );
    } else {
      return (
        '/object-fact-query/' + encodeURIComponent(search.objectType) + '/' + encodeURIComponent(search.objectValue)
      );
    }
  }
  return '';
};

class QueryHistory {
  root: MainPageStore;

  @observable.shallow queries: Array<Query> = [];

  @observable mergePrevious: boolean = true;
  @observable selectedQueryId: string = '';

  constructor(root: MainPageStore) {
    this.root = root;
  }

  @computed get isEmpty(): boolean {
    return this.queries.length === 0;
  }

  @computed get result(): QueryResult {
    if (!this.mergePrevious) {
      const selectedQuery = this.queries.find((query: Query) => query.id === this.selectedQueryId);
      return selectedQuery ? selectedQuery.result : { facts: {}, objects: {} };
    }

    const uptoSelectedQuery = [];
    for (let q of this.queries) {
      if (q.id !== this.selectedQueryId) {
        uptoSelectedQuery.push(q);
      } else {
        uptoSelectedQuery.push(q);
        break;
      }
    }

    return uptoSelectedQuery
      .map(query => query.result)
      .reduce(
        (acc: QueryResult, x: QueryResult) => {
          return {
            facts: { ...acc.facts, ...x.facts },
            objects: { ...acc.objects, ...x.objects }
          };
        },
        { facts: {}, objects: {} }
      );
  }

  @action
  addQuery(query: Query) {
    const selectedIndex = this.queries.findIndex((q: Query) => q.id === this.selectedQueryId);
    this.queries.splice(selectedIndex + 1, 0, query);
    this.selectedQueryId = query.id;
    this.root.ui.cytoscapeStore.setSelectedNodeBasedOnSearch(query.search);
  }

  @action
  removeQuery(query: Query) {
    // @ts-ignore
    this.queries.remove(query);
  }

  @action
  removeAllQueries() {
    // @ts-ignore
    this.queries.clear();
    this.root.clearSelection();
  }

  asPathname(): string {
    return queryHistoryToPath(this.queries);
  }
}

export default QueryHistory;
