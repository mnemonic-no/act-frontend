import { action, computed, observable } from 'mobx';
import * as _ from 'lodash/fp';

import MainPageStore from './MainPageStore';
import { isFactSearch, isObjectSearch, SearchItem, SearchResult } from '../../core/types';
import { urlToGraphQueryPage, urlToObjectFactQueryPage } from '../../Routing';

export const workingHistoryToPath = (historyItems: Array<SearchItem>) => {
  const latest = _.last(historyItems);
  const search = latest ? latest.search : '';

  if (!search || isFactSearch(search)) {
    return '';
  }

  if (isObjectSearch(search) && !_.isEmpty(search.objectValue) && !_.isEmpty(search.objectType)) {
    if (search.query && !_.isEmpty(search.query)) {
      return urlToGraphQueryPage({
        objectTypeName: search.objectType,
        objectValue: search.objectValue,
        query: search.query
      });
    }
    return urlToObjectFactQueryPage({ objectTypeName: search.objectType, objectValue: search.objectValue });
  }
  return '';
};

class WorkingHistory {
  root: MainPageStore;

  @observable.shallow historyItems: Array<SearchItem> = [];

  @observable mergePrevious: boolean = true;
  @observable selectedItemId: string = '';

  constructor(root: MainPageStore) {
    this.root = root;
  }

  @computed get isEmpty(): boolean {
    return this.historyItems.length === 0;
  }

  @computed get result(): SearchResult {
    if (!this.mergePrevious) {
      const selectedItem = this.historyItems.find((item: SearchItem) => item.id === this.selectedItemId);
      return selectedItem ? selectedItem.result : { facts: {}, objects: {} };
    }

    const uptoSelectedItem = [];
    for (let item of this.historyItems) {
      if (item.id !== this.selectedItemId) {
        uptoSelectedItem.push(item);
      } else {
        uptoSelectedItem.push(item);
        break;
      }
    }

    return uptoSelectedItem
      .map(item => item.result)
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

  @action
  addItem(item: SearchItem) {
    const selectedIndex = this.historyItems.findIndex((i: SearchItem) => i.id === this.selectedItemId);
    this.historyItems.splice(selectedIndex + 1, 0, item);
    this.selectedItemId = item.id;
    this.root.ui.graphViewStore.setSelectedNodeBasedOnSearch(item.search);
  }

  @action
  removeItem(searchItem: SearchItem) {
    // @ts-ignore
    this.historyItems.remove(searchItem);
  }

  @action
  removeAllItems() {
    // @ts-ignore
    this.historyItems.clear();
    this.root.selectionStore.clearSelection();
  }

  asPathname(): string {
    return workingHistoryToPath(this.historyItems);
  }
}

export default WorkingHistory;
