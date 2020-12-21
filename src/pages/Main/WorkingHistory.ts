import { action, computed, observable } from 'mobx';
import * as _ from 'lodash/fp';

import MainPageStore from './MainPageStore';
import {
  ActFact,
  ActObject,
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
import ObjectTraverseBackendStore from '../../backend/ObjectTraverseBackendStore';
import ObjectFactsBackendStore from '../../backend/ObjectFactsBackendStore';
import MultiObjectTraverseBackendStore from '../../backend/MultiObjectTraverseBackendStore';
import EventBus from '../../util/eventbus';

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

const getLoadable = (
  item: WorkingHistoryItem,
  objectTraverseStore: ObjectTraverseBackendStore,
  objectFactsStore: ObjectFactsBackendStore,
  multiObjectTraverseStore: MultiObjectTraverseBackendStore,
  createdFacts: { [id: string]: SearchResult }
): TLoadable<SearchResult> => {
  if (isObjectTraverseSearch(item.search)) {
    return objectTraverseStore.getItemBy(item.search);
  } else if (isObjectFactsSearch(item.search)) {
    return objectFactsStore.getItemBy(item.search);
  } else if (isFactSearch(item.search) && createdFacts[item.search.id]) {
    return { status: LoadingStatus.DONE, result: createdFacts[item.search.id] } as TLoadable<SearchResult>;
  } else if (isMultiObjectSearch(item.search)) {
    return multiObjectTraverseStore.getItemBy(item.search);
  }

  throw new Error('Failed to find item ' + JSON.stringify(item));
};

class WorkingHistory {
  root: MainPageStore;
  eventBus: EventBus;

  @observable historyItems: Array<WorkingHistoryItem> = [];

  @observable mergePrevious: boolean = true;
  @observable selectedItemId: string = '';

  @observable createdFacts: { [id: string]: SearchResult } = {};

  constructor(root: MainPageStore, eventBus: EventBus) {
    this.root = root;
    this.eventBus = eventBus;
  }

  @computed get isEmpty(): boolean {
    return this.historyItems.length === 0;
  }

  @computed get withLoadable() {
    return this.historyItems.map(item => ({
      item: item,
      loadable: getLoadable(
        item,
        this.root.backendStore.objectTraverseBackendStore,
        this.root.backendStore.objectFactsBackendStore,
        this.root.backendStore.multiObjectTraverseStore,
        this.createdFacts
      )
    }));
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
  addSearch(search: Search) {
    const item: WorkingHistoryItem = {
      id: searchId(search),
      search: search
    };

    if (!this.isInHistory(search)) {
      this.addItem(item);
    }
  }

  @action.bound
  addItem(item: WorkingHistoryItem) {
    const selectedIndex = this.historyItems.findIndex((i: WorkingHistoryItem) => i.id === this.selectedItemId);
    this.historyItems.splice(selectedIndex + 1, 0, item);
    this.selectedItemId = item.id;
    this.root.ui.graphViewStore.setSelectedNodeBasedOnSearch(item.search);
  }

  @action.bound
  addCreatedFactItem(search: SingleFactSearch, result: SearchResult) {
    this.createdFacts = {
      ...this.createdFacts,
      [search.id]: result
    };
    this.addItem({ id: search.id, search: search });
  }

  @action.bound
  removeItem(item: WorkingHistoryItem) {
    // @ts-ignore
    this.historyItems.remove(item);
    this.root.backendStore.removeSearch(item.search);

    if (item.id === this.selectedItemId) {
      const newSelection = _.last(this.root.workingHistory.historyItems);
      if (newSelection) {
        this.selectedItemId = newSelection.id;
      }
    }
  }

  @action.bound
  removeAllItems() {
    // @ts-ignore
    const items = [...this.historyItems];
    items.forEach(i => this.removeItem(i));

    this.eventBus.publish([{ kind: 'selectionClear' }]);
  }

  isInHistory(search: Search) {
    const id = searchId(search);
    return this.historyItems.some(q => q.id === id);
  }

  asPathname(): string {
    return workingHistoryToPath(this.historyItems);
  }

  getFactById(id: string): ActFact | undefined {
    const resolvedItems = this.withLoadable.filter(x => isDone(x.loadable)) as Array<{
      item: WorkingHistoryItem;
      loadable: TDoneLoadable<SearchResult>;
    }>;

    const found = resolvedItems.find(x => x.loadable.result.facts[id]);
    return found ? found.loadable.result.facts[id] : undefined;
  }

  getObjectById(id: string): ActObject | undefined {
    const resolvedItems = this.withLoadable.filter(x => isDone(x.loadable)) as Array<{
      item: WorkingHistoryItem;
      loadable: TDoneLoadable<SearchResult>;
    }>;

    const found = resolvedItems.find(x => x.loadable.result.objects[id]);
    return found ? found.loadable.result.objects[id] : undefined;
  }
}

export default WorkingHistory;
