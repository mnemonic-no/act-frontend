import { action, computed } from 'mobx';
import * as _ from 'lodash/fp';

import {
  isObjectSearch,
  SearchItem,
  StateExport,
  PredefinedObjectQuery,
  isFactSearch,
  searchId,
  Search
} from '../types';
import { exportToJson, fileTimeString, copyToClipBoard } from '../../util/util';
import MainPageStore from '../MainPageStore';
import { addMessage } from '../../util/SnackbarProvider';

type TIcon = 'remove' | 'copy';
export type TAction = { icon: TIcon; onClick: () => void; tooltip: string };
export type TDetails = { kind: 'tag' | 'label-text'; label: string; text: string };

export type TWorkingHistoryItem = {
  id: string;
  title: string;
  isSelected: boolean;
  details?: TDetails;
  onClick: () => void;
  actions: Array<TAction>;
};

const copy = (si: SearchItem) => {
  if (isObjectSearch(si.search) && si.search.query) {
    try {
      copyToClipBoard(si.search.query);
      addMessage('Query copied to clipboard');
    } catch (err) {
      console.log('Faile to copy to clipboard');
    }
  }
};

export const itemTitle = (s: Search) => {
  if (isObjectSearch(s)) {
    return s.objectType + ': ' + s.objectValue;
  } else if (isFactSearch(s)) {
    return 'Fact: ' + s.factTypeName;
  }
  return 'n/a';
};

export const itemDetails = (
  si: SearchItem,
  predefinedQueryToName: { [query: string]: string }
): TDetails | undefined => {
  if (isFactSearch(si.search)) {
    return {
      kind: 'label-text',
      label: 'Id:',
      text: si.id
    };
  }

  if (isObjectSearch(si.search)) {
    if (si.search.factTypes) {
      return {
        kind: 'label-text',
        label: 'Fact types:',
        text: si.search.factTypes.join(',')
      };
    }
    if (si.search.query) {
      const predefinedQueryName = predefinedQueryToName[si.search.query];
      if (predefinedQueryName) {
        return {
          kind: 'tag',
          label: 'Query:',
          text: predefinedQueryName
        };
      }
      return {
        kind: 'label-text',
        label: 'Query:',
        text: si.search.query
      };
    }
  }
};

export const itemActions = (si: SearchItem, onRemoveClick: () => void, onCopyClick: () => void) => {
  const actions = [{ icon: 'remove' as TIcon, tooltip: 'Remove', onClick: onRemoveClick }];

  if (isObjectSearch(si.search) && si.search.query) {
    return [
      {
        icon: 'copy' as TIcon,
        onClick: onCopyClick,
        tooltip: 'Copy query to clipboard'
      },
      ...actions
    ];
  }

  return actions;
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

  predefinedQueryToName: { [queryString: string]: string };

  constructor(root: MainPageStore, config: any) {
    this.root = root;

    this.predefinedQueryToName = (config.predefinedObjectQueries || []).reduce((acc: any, q: PredefinedObjectQuery) => {
      acc[q.query] = q.name;
      return acc;
    }, {});
  }

  @computed get mergePrevious(): boolean {
    return this.root.workingHistory.mergePrevious;
  }

  @computed get queries(): Array<SearchItem> {
    return this.root.workingHistory.historyItems.filter(q => {
      return q.result !== null;
    });
  }

  @computed get historyItems(): Array<TWorkingHistoryItem> {
    return this.root.workingHistory.historyItems
      .filter(q => q.result !== null)
      .map(item => {
        return {
          id: searchId(item.search),
          title: itemTitle(item.search),
          isSelected: item.id === this.selectedItemId,
          details: itemDetails(item, this.predefinedQueryToName),
          actions: itemActions(item, () => this.removeQuery(item), () => copy(item)),
          onClick: () => this.setSelectedSearchItem(item)
        };
      });
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
