import { action, computed, observable } from 'mobx';
import * as _ from 'lodash/fp';

import MainPageStore from './MainPageStore';
import {
  isDone,
  isFactSearch,
  isMultiObjectSearch,
  isObjectFactsSearch,
  isObjectTraverseSearch,
  LoadingStatus,
  Search,
  SearchResult,
  SingleFactSearch,
  TDoneLoadable,
  TLoadable,
  WorkingHistoryItem
} from '../../core/types';
import { urlToGraphQueryPage, urlToMultiObjectQueryPage, urlToObjectFactQueryPage } from '../../Routing';
import { searchId } from '../../core/domain';
import { notUndefined } from '../../util/util';
import ObjectTraverseBackendStore from '../../backend/ObjectTraverseBackendStore';
import ObjectFactsBackendStore from '../../backend/ObjectFactsBackendStore';
import MultiObjectTraverseBackendStore from '../../backend/MultiObjectTraverseBackendStore';

export const workingHistoryToPath = (historyItems: Array<WorkingHistoryItem>) => {
  const latest = _.last(historyItems);
  const search = latest ? latest.search : '';

  if (!search || isFactSearch(search)) {
    return '';
  }

  if (isObjectFactsSearch(search) && !_.isEmpty(search.objectValue) && !_.isEmpty(search.objectType)) {
    return urlToObjectFactQueryPage(search);
  }

  if (isObjectTraverseSearch(search) && !_.isEmpty(search.query)) {
    return urlToGraphQueryPage(search);
  }

  if (isMultiObjectSearch(search) && !_.isEmpty(search.query)) {
    return urlToMultiObjectQueryPage(search);
  }

  return '';
};

const resolvedSearchResults = (
  historyItems: Array<WorkingHistoryItem>,
  objectTraverseStore: ObjectTraverseBackendStore,
  objectFactsStore: ObjectFactsBackendStore,
  multiObjectTraverseStore: MultiObjectTraverseBackendStore,
  createdFacts: { [id: string]: SearchResult }
): Array<{ item: WorkingHistoryItem; loadable: TLoadable<SearchResult> }> => {
  return historyItems
    .map(x => {
      if (isObjectTraverseSearch(x.search)) {
        return { item: x, loadable: objectTraverseStore.getItemBy(x.search) };
      } else if (isObjectFactsSearch(x.search)) {
        return { item: x, loadable: objectFactsStore.getItemBy(x.search) };
      } else if (isFactSearch(x.search) && createdFacts[x.search.id]) {
        return {
          item: x,
          loadable: { status: LoadingStatus.DONE, result: createdFacts[x.search.id] } as TLoadable<SearchResult>
        };
      } else if (isMultiObjectSearch(x.search)) {
        return {
          item: x,
          loadable: multiObjectTraverseStore.getItemBy(x.search)
        };
      }
      return undefined;
    })
    .filter(notUndefined);
};

class WorkingHistory {
  root: MainPageStore;

  @observable historyItems: Array<WorkingHistoryItem> = [];

  @observable mergePrevious: boolean = true;
  @observable selectedItemId: string = '';

  @observable createdFacts: { [id: string]: SearchResult } = {};

  constructor(root: MainPageStore) {
    this.root = root;
  }

  @computed get isEmpty(): boolean {
    return this.historyItems.length === 0;
  }

  @computed get withLoadable() {
    return resolvedSearchResults(
      this.historyItems,
      this.root.backendStore.objectTraverseBackendStore,
      this.root.backendStore.objectFactsBackendStore,
      this.root.backendStore.multiObjectTraverseStore,
      this.createdFacts
    );
  }

  @computed get result(): SearchResult {
    const resolvedItems = this.withLoadable.filter(x => isDone(x.loadable)) as Array<{
      item: WorkingHistoryItem;
      loadable: TDoneLoadable<SearchResult>;
    }>;

    if (!this.mergePrevious) {
      const selectedItem = resolvedItems.find(
        (res: { item: WorkingHistoryItem; loadable: TLoadable<SearchResult> }) => res.item.id === this.selectedItemId
      );

      return selectedItem && isDone(selectedItem.loadable) ? selectedItem.loadable.result : { facts: {}, objects: {} };
    }

    const uptoSelectedItem = [];
    for (let item of resolvedItems) {
      if (item.item.id !== this.selectedItemId) {
        uptoSelectedItem.push(item);
      } else {
        uptoSelectedItem.push(item);
        break;
      }
    }

    return uptoSelectedItem
      .map(item => item.loadable.result)
      .reduce(
        (acc: SearchResult, x: SearchResult) => {
          return {
            facts: { ...acc.facts, ...x.facts },
            objects: { ...acc.objects, ...x.objects }
          };
        },
        { facts: {}, objects: {} }
      );
  }

  @action.bound
  addItem(item: WorkingHistoryItem) {
    const selectedIndex = this.historyItems.findIndex((i: WorkingHistoryItem) => i.id === this.selectedItemId);
    this.historyItems.splice(selectedIndex + 1, 0, item);
    this.selectedItemId = item.id;
    this.root.ui.graphViewStore.setSelectedNodeBasedOnSearch(item.search);
  }

  @action.bound
  addCreatedItem(search: SingleFactSearch, result: SearchResult) {
    this.createdFacts = { [search.id]: result };
    this.addItem({ id: search.id, search: search });
  }

  @action
  removeItem(item: WorkingHistoryItem) {
    // @ts-ignore
    this.historyItems.remove(item);
    if (item.id === this.selectedItemId) {
      const newSelection = _.last(this.root.workingHistory.historyItems);
      if (newSelection) {
        this.selectedItemId = newSelection.id;
      }
    }
  }

  @action
  removeAllItems() {
    // @ts-ignore
    this.historyItems.clear();
    this.root.selectionStore.clearSelection();
  }

  isInHistory(search: Search) {
    const id = searchId(search);
    return this.historyItems.some(q => q.id === id);
  }

  asPathname(): string {
    return workingHistoryToPath(this.historyItems);
  }
}

export default WorkingHistory;
