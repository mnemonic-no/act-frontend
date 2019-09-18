import { action, observable, runInAction } from 'mobx';
import { autoResolveDataLoader, checkObjectStats, postJson, searchCriteriadataLoader } from '../core/dataLoaders';
import MainPageStore from './MainPageStore';
import { isObjectSearch, SearchItem, Search, searchId } from './types';
import { addMessage } from '../util/SnackbarProvider';

const maxFetchLimit = 2000;

class BackendStore {
  root: MainPageStore;

  @observable isLoading: boolean = false;

  constructor(root: MainPageStore) {
    this.root = root;
  }

  @action
  async executeSearch(search: Search) {
    if (!isObjectSearch(search)) {
      throw Error('Search of this type is not supported ' + search);
    }

    const id = searchId(search);

    // Skip for existing historyItems
    if (this.root.workingHistory.historyItems.some(q => q.id === id)) {
      return;
    }

    try {
      this.isLoading = true;
      const approvedAmountOfData = await checkObjectStats(search, maxFetchLimit);

      if (!approvedAmountOfData) return;

      const result = await searchCriteriadataLoader(search).then(autoResolveDataLoader);

      const item: SearchItem = {
        id: id,
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
  async executeSearches(searches: Array<Search>) {
    try {
      this.isLoading = true;

      const all = searches.filter(isObjectSearch).map(async search => {
        return {
          search: search,
          result: await searchCriteriadataLoader(search).then(autoResolveDataLoader)
        };
      });
      await Promise.all(all).then(results => {
        this.root.workingHistory.removeAllItems();

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
