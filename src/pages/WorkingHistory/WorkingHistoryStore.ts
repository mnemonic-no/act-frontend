import { action, computed } from 'mobx';
import * as _ from 'lodash/fp';

import { isObjectSearch, SearchItem, StateExport, searchId } from '../types';
import { exportToJson, fileTimeString, isTruthy, copyToClipBoard } from '../../util/util';
import MainPageStore from '../MainPageStore';
import { addMessage } from '../../util/SnackbarProvider';

type TIcon = 'remove' | 'copy';

export type TAction = { icon: TIcon; onClick: () => void; tooltip: string };

export type TWorkingHistoryItem = {
  id: string;
  title: string;
  isSelected: boolean;
  details: Array<string>;
  onClick: () => void;
  actions: Array<TAction>;
};

const copy = (q: SearchItem) => {
  if (isObjectSearch(q.search) && q.search.query) {
    try {
      copyToClipBoard(q.search.query);
      addMessage('Query copied to clipboard');
    } catch (err) {
      console.log('Faile to copy to clipboard');
    }
  }
};

const queryItem = (q: SearchItem, store: WorkingHistoryStore): TWorkingHistoryItem => {
  const search = q.search;
  const id = searchId(search);

  const common = {
    id: id,
    isSelected: id === store.selectedItemId,
    onClick: () => store.setSelectedSearchItem(q)
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
      details: details,
      actions: [
        search.query && {
          icon: 'copy' as TIcon,
          onClick: () => copy(q),
          tooltip: 'Copy query to clipboard'
        },
        { icon: 'remove', tooltip: 'Remove', onClick: () => store.removeQuery(q) }
      ].filter(isTruthy) as Array<TAction>
    };
  }
  return {
    ...common,
    title: 'Fact: ' + search.factTypeName,
    details: ['Id: ' + id],
    actions: [{ icon: 'remove', tooltip: 'Remove', onClick: () => store.removeQuery(q) }]
  };
};

export const stateExport = (items: Array<SearchItem>, prunedObjectIds: Set<string>): StateExport => {
  const searches = items.map((q: any) => ({ ...q.search })).filter(isObjectSearch);
  return { version: '1.0.0', queries: searches, prunedObjectIds: [...prunedObjectIds] };
};

export const parseStateExport = (contentJson: any): StateExport => {
  if (typeof contentJson !== 'string') {
    throw new Error('File content is not text');
  }

  const parsed = JSON.parse(contentJson);

  if (!parsed.queries || parsed.queries.length < 1) {
    throw new Error("Validation failed: history export has no 'queries'");
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

class WorkingHistoryStore {
  root: MainPageStore;

  constructor(root: MainPageStore) {
    this.root = root;
  }

  @computed get mergePrevious(): boolean {
    return this.root.workingHistory.mergePrevious;
  }

  @computed get queries(): Array<SearchItem> {
    return this.root.workingHistory.historyItems.filter(q => {
      return q.result !== null;
    });
  }

  @computed get queryItems(): Array<TWorkingHistoryItem> {
    return this.root.workingHistory.historyItems.filter(q => q.result !== null).map(q => queryItem(q, this));
  }

  @computed get isEmpty(): boolean {
    return this.root.workingHistory.isEmpty;
  }

  @computed get selectedItemId(): string {
    return this.root.workingHistory.selectedItemId;
  }

  @action
  setSelectedSearchItem(item: SearchItem | undefined) {
    if (item) {
      this.root.workingHistory.selectedItemId = item.id;
    }
  }

  @action
  removeQuery(item: SearchItem) {
    this.root.workingHistory.removeItem(item);
    if (item.id === this.selectedItemId) {
      this.setSelectedSearchItem(_.last(this.root.workingHistory.historyItems));
    }
  }

  @action
  flipMergePrevious() {
    this.root.workingHistory.mergePrevious = !this.root.workingHistory.mergePrevious;
  }

  @action.bound
  onExport() {
    const data = stateExport(this.root.workingHistory.historyItems, this.root.refineryStore.prunedObjectIds);
    exportToJson(fileTimeString(new Date()) + '-act-search-history.json', data);
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
    this.root.workingHistory.removeAllItems();
  }
}

export default WorkingHistoryStore;
