import { action, computed, observable, runInAction } from 'mobx';
import { checkObjectStats, factTypesDataLoader, objectTypesDataLoader, postJson } from '../core/dataLoaders';

import {
  FactType,
  isMultiObjectSearch,
  isObjectFactsSearch,
  isObjectTraverseSearch,
  isPending,
  LoadingStatus,
  NamedId,
  Search,
  TLoadable
} from '../core/types';
import { addMessage } from '../util/SnackbarProvider';
import ActObjectBackendStore from './ActObjectBackendStore';
import AppStore from '../AppStore';
import ObjectTraverseBackendStore from './ObjectTraverseBackendStore';
import ObjectFactsBackendStore from './ObjectFactsBackendStore';
import SimpleSearchBackendStore from './SimpleSearchBackendStore';
import MultiObjectTraverseBackendStore from './MultiObjectTraverseBackendStore';
import OneLeggedFactsBackendStore from './OneLeggedFactsBackendStore';

const maxFetchLimit = 2000;

class BackendStore {
  root: AppStore;

  actObjectBackendStore: ActObjectBackendStore;
  oneLeggedFactsStore: OneLeggedFactsBackendStore;
  autoCompleteSimpleSearchBackendStore: SimpleSearchBackendStore;
  objectTraverseBackendStore: ObjectTraverseBackendStore;
  objectFactsBackendStore: ObjectFactsBackendStore;
  simpleSearchBackendStore: SimpleSearchBackendStore;
  multiObjectTraverseStore: MultiObjectTraverseBackendStore;

  @observable actObjectTypes: TLoadable<{ objectTypes: Array<NamedId> }> | undefined;
  @observable factTypes: TLoadable<{ factTypes: Array<FactType> }> | undefined;

  constructor(root: AppStore, config: any) {
    this.root = root;
    this.actObjectBackendStore = new ActObjectBackendStore(config);
    this.oneLeggedFactsStore = new OneLeggedFactsBackendStore(this, config);
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

  @action.bound
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
      throw err;
    }
  }

  @action.bound
  async fetchFactTypes() {
    if (this.factTypes) return;

    this.factTypes = {
      status: LoadingStatus.PENDING
    };

    try {
      const result = await factTypesDataLoader();

      this.factTypes = {
        ...this.factTypes,
        result: { factTypes: result },
        status: LoadingStatus.DONE
      };
    } catch (err) {
      this.factTypes = { ...this.factTypes, status: LoadingStatus.REJECTED, error: err?.message };
      throw err;
    }
  }

  @action.bound
  async executeSingleSearch(search: Search): Promise<any> {
    if (!isObjectFactsSearch(search) && !isObjectTraverseSearch(search) && !isMultiObjectSearch(search)) {
      throw Error('Search of this type is not supported ' + JSON.stringify(search));
    }

    if (isObjectFactsSearch(search)) {
      // Checking object stats is best effort. Ignore all errors on the request itself
      const approvedAmountOfData = await checkObjectStats(search, maxFetchLimit).catch(e => true);
      if (!approvedAmountOfData) {
        return;
      }
    }

    if (isObjectTraverseSearch(search)) {
      return this.objectTraverseBackendStore.execute(search);
    } else if (isObjectFactsSearch(search)) {
      return this.objectFactsBackendStore.execute(search);
    } else if (isMultiObjectSearch(search)) {
      return this.multiObjectTraverseStore.execute(search);
    }
  }

  @action.bound
  async executeSearch(search: Search) {
    if (this.root.mainPageStore.workingHistory.isInHistory(search)) {
      return;
    }

    this.root.mainPageStore.workingHistory.addSearch(search);

    try {
      await this.executeSingleSearch(search);

      if (isObjectTraverseSearch(search) || isObjectFactsSearch(search)) {
        this.root.mainPageStore.ui.graphViewStore.setSelectedNodeBasedOnSearch(search);
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

      for (const s of searches) {
        this.root.mainPageStore.workingHistory.addSearch(s);
      }

      const results = await Promise.all(
        searches.map(s => this.executeSingleSearch(s).catch(e => ({ error: e, search: s })))
      );
      const errors = results.filter(Boolean);
      if (errors.length > 0) {
        this.root.mainPageStore.handleError({
          error: new Error('See search history for details'),
          title: 'Bulk result: ' + errors.length + ' of  ' + searches.length + ' searches failed'
        });
      }
    } catch (err) {
      runInAction(() => {
        this.root.mainPageStore.handleError({ error: err, title: 'Bulk search failed' });
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
