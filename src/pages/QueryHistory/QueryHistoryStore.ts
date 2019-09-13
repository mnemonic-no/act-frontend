import { action, computed } from 'mobx';
import MainPageStore from '../MainPageStore';
import { isObjectSearch, Query, StateExport, searchId } from '../types';
import { exportToJson } from '../../util/util';
import * as _ from 'lodash/fp';

export type QueryItem = {
  id: string;
  title: string;
  isSelected: boolean;
  details: Array<string>;
  onClick: () => void;
  onRemoveClick: () => void;
};

const queryItem = (q: Query, store: QueryHistoryStore): QueryItem => {
  const search = q.search;
  const id = searchId(search);

  const common = {
    id: id,
    isSelected: id === store.selectedQueryId,
    onClick: () => store.setSelectedQuery(q),
    onRemoveClick: () => store.removeQuery(q)
  };

  if (isObjectSearch(search)) {
    const details = [];
    if (search.factTypes) {
      details.push('Fact types: ' + search.factTypes);
    }
    if (search.query) {
      details.push(search.query);
    }

    return {
      ...common,
      title: search.objectType + ': ' + search.objectValue,
      details: details
    };
  } else {
    return {
      ...common,
      title: 'Fact: ' + search.factTypeName,
      details: ['Id: ' + id]
    };
  }
};

export const stateExport = (queries: Array<Query>, prunedObjectIds: Set<string>): StateExport => {
  const searches = queries.map((q: any) => ({ ...q.search })).filter(isObjectSearch);
  return { version: '1.0.0', queries: searches, prunedObjectIds: [...prunedObjectIds] };
};

export const parseStateExport = (contentJson: any): StateExport => {
  if (typeof contentJson !== 'string') {
    throw new Error('File content is not text');
  }

  const parsed = JSON.parse(contentJson);

  if (!parsed.queries || parsed.queries.length < 1) {
    throw new Error("Validation failed: query history export has no 'queries'");
  }

  parsed.queries.forEach((q: any) => {
    if (!q.objectType || !q.objectValue) {
      throw new Error('Queries must have objectType and objectValue: ' + JSON.stringify(q));
    }
  });

  if (parsed.prunedObjectIds) {
    parsed.prunedObjectIds.forEach((objectId: any) => {
      if (typeof objectId !== 'string') {
        throw new Error('prunedObjectIds must be strings: ' + JSON.stringify(objectId));
      }
    });
  }

  return parsed;
};

class QueryHistoryStore {
  root: MainPageStore;

  constructor(root: MainPageStore) {
    this.root = root;
  }

  @computed get mergePrevious(): boolean {
    return this.root.queryHistory.mergePrevious;
  }

  @computed get queries(): Array<Query> {
    return this.root.queryHistory.queries.filter(q => {
      return q.result !== null;
    });
  }

  @computed get queryItems(): Array<QueryItem> {
    return this.root.queryHistory.queries.filter(q => q.result !== null).map(q => queryItem(q, this));
  }

  @computed get isEmpty(): boolean {
    return this.root.queryHistory.isEmpty;
  }

  @computed get selectedQueryId(): string {
    return this.root.queryHistory.selectedQueryId;
  }

  @action
  setSelectedQuery(query: Query | undefined) {
    if (query) {
      this.root.queryHistory.selectedQueryId = query.id;
    }
  }

  @action
  removeQuery(query: Query) {
    this.root.queryHistory.removeQuery(query);
    if (query.id === this.selectedQueryId) {
      this.setSelectedQuery(_.last(this.root.queryHistory.queries));
    }
  }

  @action
  flipMergePrevious() {
    this.root.queryHistory.mergePrevious = !this.root.queryHistory.mergePrevious;
  }

  @action.bound
  onExport() {
    const data = stateExport(this.root.queryHistory.queries, this.root.refineryStore.prunedObjectIds);
    const nowTimeString = new Date()
      .toISOString()
      .replace(/:/g, '-')
      .substr(0, 19);
    exportToJson(nowTimeString + '-act-search-history.json', data);
  }

  @action.bound
  onImport(fileEvent: any) {
    const fileReader = new FileReader();
    fileReader.onloadend = e => {
      const content = fileReader.result;

      try {
        const parsed = parseStateExport(content);
        this.root.initByImport(parsed);
      } catch (err) {
        this.root.handleError({ error: err, title: 'Import failed' });
      }
    };

    if (fileEvent.target && fileEvent.target.files[0]) {
      fileReader.readAsText(fileEvent.target.files[0]);
      // Clear the input field so that another file with the same name may be imported
      fileEvent.target.value = null;
    }
  }

  @action.bound
  onClear() {
    this.root.queryHistory.removeAllQueries();
  }
}

export default QueryHistoryStore;
