import { action, observable, runInAction } from 'mobx';
import { autoResolveDataLoader, checkObjectStats, postJson, searchCriteriadataLoader } from '../core/dataLoaders';

import MainPageStore from './MainPageStore';
import { isObjectSearch, SearchItem, Search, searchId } from '../core/types';
import { addMessage } from '../util/SnackbarProvider';
import SimpleSearchBackendStore from './SimpleSearchBackendStore';

const maxFetchLimit = 2000;

const isInHistory = (search: Search, historyItems: Array<SearchItem>) => {
  const id = searchId(search);
  return historyItems.some(q => q.id === id);
};

class BackendStore {
  root: MainPageStore;
  simpleSearchBackendStore: SimpleSearchBackendStore;
  autoCompleteSimpleSearchBackendStore: SimpleSearchBackendStore;

  @observable isLoading: boolean = false;

  constructor(root: MainPageStore, config: any) {
    this.root = root;
    this.simpleSearchBackendStore = new SimpleSearchBackendStore(config, 300);
    this.autoCompleteSimpleSearchBackendStore = new SimpleSearchBackendStore(config, 20);
  }

  @action
  async executeSimpleSearch(query: string) {
    this.simpleSearchBackendStore.execute(query);
    this.root.ui.searchesStore.setActiveSearchString(query);
    this.root.ui.contentStore.onTabSelected('searches');
  }

  @action
  async executeSearch(search: Search) {
    if (!isObjectSearch(search)) {
      throw Error('Search of this type is not supported ' + search);
    }

    if (isInHistory(search, this.root.workingHistory.historyItems)) {
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
      this.root.workingHistory.addItem(item);
    } catch (err) {
      runInAction(() => {
        this.root.handleError({ error: err });
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
        this.root.workingHistory.removeAllItems();
      }

      const all = searches
        .filter(isObjectSearch)
        .filter(search => !isInHistory(search, this.root.workingHistory.historyItems))
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
          this.root.workingHistory.addItem(q);
        }
      });
    } catch (err) {
      runInAction(() => {
        this.root.handleError({ error: err, title: 'Import failed' });
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  @action
  async postAndForget(url: string, request: { [key: string]: any }, successMessage: string) {
    try {
      this.isLoading = true;
      await postJson(url, request);
      addMessage(successMessage);
    } catch (err) {
      runInAction(() => {
        this.root.handleError({ error: err });
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}

export default BackendStore;
