import { action, computed, observable, runInAction } from 'mobx';
import { checkObjectStats, objectTypesDataLoader, postJson } from '../core/dataLoaders';

import {
  isMultiObjectSearch,
  isObjectFactsSearch,
  isObjectTraverseSearch,
  isPending,
  LoadingStatus,
  NamedId,
  Search,
  TLoadable,
  WorkingHistoryItem
} from '../core/types';
import { addMessage } from '../util/SnackbarProvider';
import { searchId } from '../core/domain';
import ActObjectBackendStore from './ActObjectBackendStore';
import AppStore from '../AppStore';
import ObjectTraverseBackendStore from './ObjectTraverseBackendStore';
import ObjectFactsBackendStore from './ObjectFactsBackendStore';
import SimpleSearchBackendStore from './SimpleSearchBackendStore';
import MultiObjectTraverseBackendStore from './MultiObjectTraverseBackendStore';

const maxFetchLimit = 2000;

class BackendStore {
  root: AppStore;

  actObjectBackendStore: ActObjectBackendStore;
  autoCompleteSimpleSearchBackendStore: SimpleSearchBackendStore;
  objectTraverseBackendStore: ObjectTraverseBackendStore;
  objectFactsBackendStore: ObjectFactsBackendStore;
  simpleSearchBackendStore: SimpleSearchBackendStore;
  multiObjectTraverseStore: MultiObjectTraverseBackendStore;

  @observable actObjectTypes: TLoadable<{ objectTypes: Array<NamedId> }> | undefined;

  constructor(root: AppStore, config: any) {
    this.root = root;
    this.actObjectBackendStore = new ActObjectBackendStore(config);
    this.autoCompleteSimpleSearchBackendStore = new SimpleSearchBackendStore(config, 20);
    this.objectFactsBackendStore = new ObjectFactsBackendStore();
    this.objectTraverseBackendStore = new ObjectTraverseBackendStore();
    this.multiObjectTraverseStore = new MultiObjectTraverseBackendStore();
    this.simpleSearchBackendStore = new SimpleSearchBackendStore(config, 300);
  }

  @observable loading: boolean = false;

  @computed get isLoading() {
    return (
      this.loading ||
      Object.values(this.objectFactsBackendStore.cache).some(isPending) ||
      Object.values(this.objectTraverseBackendStore.cache).some(isPending) ||
      Object.values(this.multiObjectTraverseStore.cache).some(isPending)
    );
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

  @action.bound
  async executeSearch(search: Search) {
    if (!isObjectFactsSearch(search) && !isObjectTraverseSearch(search) && !isMultiObjectSearch(search)) {
      throw Error('Search of this type is not supported ' + JSON.stringify(search));
    }

    if (this.root.mainPageStore.workingHistory.isInHistory(search)) {
      return;
    }

    if (isObjectFactsSearch(search)) {
      const approvedAmountOfData = await checkObjectStats(search, maxFetchLimit);
      if (!approvedAmountOfData) return;
    }

    try {
      const item: WorkingHistoryItem = {
        id: searchId(search),
        search: search
      };

      this.root.mainPageStore.workingHistory.addItem(item);

      if (isObjectTraverseSearch(search)) {
        this.objectTraverseBackendStore.execute(search).then(() => {
          this.root.mainPageStore.ui.graphViewStore.setSelectedNodeBasedOnSearch(item.search);
        });
      } else if (isObjectFactsSearch(search)) {
        this.objectFactsBackendStore.execute(search).then(() => {
          this.root.mainPageStore.ui.graphViewStore.setSelectedNodeBasedOnSearch(item.search);
        });
      } else if (isMultiObjectSearch(search)) {
        this.multiObjectTraverseStore.execute(search);
      }
    } catch (err) {
      runInAction(() => {
        this.root.mainPageStore.handleError({ error: err });
      });
    }
  }

  @action.bound
  async executeSearches({ searches, replace = true }: { searches: Array<Search>; replace: boolean }) {
    try {
      if (replace) {
        this.root.mainPageStore.workingHistory.removeAllItems();
      }

      for (const search of searches) {
        await this.executeSearch(search);
      }
    } catch (err) {
      runInAction(() => {
        this.root.mainPageStore.handleError({ error: err, title: 'Import failed' });
      });
    }
  }

  @action.bound
  async postAndForget(url: string, request: { [key: string]: any }, successMessage: string) {
    try {
      this.loading = true;
      await postJson(url, request);
      addMessage(successMessage);
    } catch (err) {
      runInAction(() => {
        this.root.mainPageStore.handleError({ error: err });
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}

export default BackendStore;
