import { action, observable, runInAction } from 'mobx';
import {
  autoResolveDataLoader,
  checkObjectStats,
  objectTypesDataLoader,
  postJson,
  searchCriteriadataLoader
} from '../core/dataLoaders';

import { isObjectSearch, LoadingStatus, NamedId, Search, searchId, SearchItem, TLoadable } from '../core/types';
import { addMessage } from '../util/SnackbarProvider';
import AppStore from '../AppStore';
import GraphQueryStore from './GraphQueryStore';
import SimpleSearchBackendStore from './SimpleSearchBackendStore';
import ActObjectBackendStore from './ActObjectBackendStore';

const maxFetchLimit = 2000;

const isInHistory = (search: Search, historyItems: Array<SearchItem>) => {
  const id = searchId(search);
  return historyItems.some(q => q.id === id);
};

class BackendStore {
  root: AppStore;

  actObjectBackendStore: ActObjectBackendStore;
  autoCompleteSimpleSearchBackendStore: SimpleSearchBackendStore;
  @observable actObjectTypes: TLoadable<{ objectTypes: Array<NamedId> }> | undefined;
  graphQueryStore: GraphQueryStore;
  simpleSearchBackendStore: SimpleSearchBackendStore;

  @observable isLoading: boolean = false;

  constructor(root: AppStore, config: any) {
    this.root = root;
    this.simpleSearchBackendStore = new SimpleSearchBackendStore(config, 300);
    this.autoCompleteSimpleSearchBackendStore = new SimpleSearchBackendStore(config, 20);
    this.graphQueryStore = new GraphQueryStore();
    this.actObjectBackendStore = new ActObjectBackendStore(config);
  }

  @action
  async fetchActObjectTypes() {
    if (this.actObjectTypes) return;

    this.actObjectTypes = {
      status: LoadingStatus.PENDING
    };

    try {
      const result = await objectTypesDataLoader();

      this.actObjectTypes = {
        ...this.actObjectTypes,
        result: { objectTypes: result.objectTypes },
        status: LoadingStatus.DONE
      };
    } catch (err) {
      this.actObjectTypes = { ...this.actObjectTypes, status: LoadingStatus.REJECTED, error: err?.message };
    }
  }

  @action
  async executeSearch(search: Search) {
    if (!isObjectSearch(search)) {
      throw Error('Search of this type is not supported ' + search);
    }

    if (isInHistory(search, this.root.mainPageStore.workingHistory.historyItems)) {
      return;
    }

    try {
      this.isLoading = true;
      const approvedAmountOfData = await checkObjectStats(search, maxFetchLimit);

      if (!approvedAmountOfData) return;

      const result = await searchCriteriadataLoader(search).then(autoResolveDataLoader);

      const item: SearchItem = {
        id: searchId(search),
        search: search,
        result: {
          facts: result.facts,
          objects: result.objects
        }
      };
      this.root.mainPageStore.workingHistory.addItem(item);
    } catch (err) {
      runInAction(() => {
        this.root.mainPageStore.handleError({ error: err });
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  @action
  async executeSearches({ searches, replace = true }: { searches: Array<Search>; replace: boolean }) {
    try {
      this.isLoading = true;

      if (replace) {
        this.root.mainPageStore.workingHistory.removeAllItems();
      }

      const all = searches
        .filter(isObjectSearch)
        .filter(search => !isInHistory(search, this.root.mainPageStore.workingHistory.historyItems))
        .map(async search => {
          return {
            search: search,
            result: await searchCriteriadataLoader(search).then(autoResolveDataLoader)
          };
        });
      await Promise.all(all).then(results => {
        for (let { search, result } of results) {
          const q: SearchItem = {
            id: searchId(search),
            search: search,
            result: {
              facts: result.facts,
              objects: result.objects
            }
          };
          this.root.mainPageStore.workingHistory.addItem(q);
        }
      });
    } catch (err) {
      runInAction(() => {
        this.root.mainPageStore.handleError({ error: err, title: 'Import failed' });
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  @action.bound
  async postAndForget(url: string, request: { [key: string]: any }, successMessage: string) {
    try {
      this.isLoading = true;
      await postJson(url, request);
      addMessage(successMessage);
    } catch (err) {
      runInAction(() => {
        this.root.mainPageStore.handleError({ error: err });
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}

export default BackendStore;
