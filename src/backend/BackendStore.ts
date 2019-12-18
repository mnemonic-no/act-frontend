import { action, observable, runInAction } from 'mobx';
import {
  autoResolveDataLoader,
  checkObjectStats,
  objectTypesDataLoader,
  postJson,
  searchCriteriadataLoader
} from '../core/dataLoaders';

import {
  isObjectFactsSearch,
  LoadingStatus,
  NamedId,
  Search,
  WorkingHistoryItem,
  TLoadable,
  isObjectTraverseSearch
} from '../core/types';
import { addMessage } from '../util/SnackbarProvider';
import AppStore from '../AppStore';
import ObjectTraverseBackendStore from './ObjectTraverseBackendStore';
import SimpleSearchBackendStore from './SimpleSearchBackendStore';
import ActObjectBackendStore from './ActObjectBackendStore';
import { searchId } from '../core/domain';

const maxFetchLimit = 2000;

class BackendStore {
  root: AppStore;

  actObjectBackendStore: ActObjectBackendStore;
  autoCompleteSimpleSearchBackendStore: SimpleSearchBackendStore;
  objectTraverseBackendStore: ObjectTraverseBackendStore;
  simpleSearchBackendStore: SimpleSearchBackendStore;
  @observable actObjectTypes: TLoadable<{ objectTypes: Array<NamedId> }> | undefined;

  @observable isLoading: boolean = false;

  constructor(root: AppStore, config: any) {
    this.root = root;
    this.simpleSearchBackendStore = new SimpleSearchBackendStore(config, 300);
    this.autoCompleteSimpleSearchBackendStore = new SimpleSearchBackendStore(config, 20);
    this.objectTraverseBackendStore = new ObjectTraverseBackendStore();
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
    if (!isObjectFactsSearch(search) && !isObjectTraverseSearch(search)) {
      throw Error('Search of this type is not supported ' + JSON.stringify(search));
    }

    if (this.root.mainPageStore.workingHistory.isInHistory(search)) {
      return;
    }

    try {
      this.isLoading = true;
      const approvedAmountOfData = await checkObjectStats(search, maxFetchLimit);

      if (!approvedAmountOfData) return;

      const result = await searchCriteriadataLoader(search).then(autoResolveDataLoader);

      const item: WorkingHistoryItem = {
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
        .filter(s => isObjectFactsSearch(s) || isObjectTraverseSearch(s))
        .filter(search => !this.root.mainPageStore.workingHistory.isInHistory(search))
        .map(async search => {
          return {
            search: search,
            result: await searchCriteriadataLoader(search).then(autoResolveDataLoader)
          };
        });
      await Promise.all(all).then(results => {
        for (let { search, result } of results) {
          const q: WorkingHistoryItem = {
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
