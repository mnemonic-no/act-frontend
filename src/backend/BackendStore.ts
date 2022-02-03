import { action, computed, observable, runInAction } from 'mobx';

import {
  FactType,
  isFactSearch,
  isMultiObjectSearch,
  isObjectFactsSearch,
  isObjectTraverseSearch,
  isPending,
  LoadingStatus,
  NamedId,
  Search,
  TConfig,
  TLoadable
} from '../core/types';
import { ActApi } from './ActApi';
import { addMessage } from '../util/SnackbarProvider';
import { assertNever } from '../util/util';
import ActObjectBackendStore from './ActObjectBackendStore';
import AppStore from '../AppStore';
import EventBus from '../util/eventbus';
import FactBackendStore from './FactBackendStore';
import MultiObjectTraverseBackendStore from './MultiObjectTraverseBackendStore';
import ObjectTraverseBackendStore from './ObjectTraverseBackendStore';
import ObjectFactsBackendStore from './ObjectFactsBackendStore';
import OneLeggedFactsBackendStore from './OneLeggedFactsBackendStore';
import SimpleSearchBackendStore from './SimpleSearchBackendStore';

const maxFetchLimit = 2000;

class BackendStore {
  root: AppStore;
  eventBus: EventBus;
  actApi: ActApi;

  actObjectBackendStore: ActObjectBackendStore;
  oneLeggedFactsStore: OneLeggedFactsBackendStore;
  factBackendStore: FactBackendStore;
  autoCompleteSimpleSearchBackendStore: SimpleSearchBackendStore;
  objectTraverseBackendStore: ObjectTraverseBackendStore;
  objectFactsBackendStore: ObjectFactsBackendStore;
  simpleSearchBackendStore: SimpleSearchBackendStore;
  multiObjectTraverseStore: MultiObjectTraverseBackendStore;

  @observable actObjectTypes: TLoadable<{ objectTypes: Array<NamedId> }> | undefined;
  @observable factTypes: TLoadable<{ factTypes: Array<FactType> }> | undefined;

  constructor(root: AppStore, config: TConfig, actApi: ActApi) {
    this.root = root;
    this.eventBus = root.eventBus;
    this.actApi = actApi;
    this.actObjectBackendStore = new ActObjectBackendStore(config, actApi);
    this.factBackendStore = new FactBackendStore(actApi);
    this.oneLeggedFactsStore = new OneLeggedFactsBackendStore(this, actApi);
    this.autoCompleteSimpleSearchBackendStore = new SimpleSearchBackendStore(config, actApi, 20);
    this.objectFactsBackendStore = new ObjectFactsBackendStore(config, actApi);
    this.objectTraverseBackendStore = new ObjectTraverseBackendStore(config, actApi);
    this.multiObjectTraverseStore = new MultiObjectTraverseBackendStore(actApi);
    this.simpleSearchBackendStore = new SimpleSearchBackendStore(config, actApi, 300);
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
      const result = await this.actApi.objectTypesDataLoader();

      this.actObjectTypes = {
        ...this.actObjectTypes,
        result: { objectTypes: result.objectTypes },
        status: LoadingStatus.DONE
      };
    } catch (err) {
      this.actObjectTypes = { ...this.actObjectTypes, status: LoadingStatus.REJECTED, error: (err as Error)?.message };
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
      const result = await this.actApi.factTypesDataLoader();

      this.factTypes = {
        ...this.factTypes,
        result: { factTypes: result },
        status: LoadingStatus.DONE
      };
    } catch (err) {
      this.factTypes = { ...this.factTypes, status: LoadingStatus.REJECTED, error: (err as Error)?.message };
      throw err;
    }
  }

  @action.bound
  removeSearch(search: Search) {
    if (isObjectTraverseSearch(search)) {
      this.objectTraverseBackendStore.remove(search);
    } else if (isObjectFactsSearch(search)) {
      this.objectFactsBackendStore.remove(search);
    } else if (isMultiObjectSearch(search)) {
      this.multiObjectTraverseStore.remove(search);
    } else if (isFactSearch(search)) {
      // Ignore, fact searches are only handled client side
    } else {
      assertNever(search);
    }
  }

  @action.bound
  async executeSingleSearch(search: Search): Promise<any> {
    if (!isObjectFactsSearch(search) && !isObjectTraverseSearch(search) && !isMultiObjectSearch(search)) {
      throw Error('Search of this type is not supported ' + JSON.stringify(search));
    }

    if (isObjectFactsSearch(search)) {
      // Checking object stats is best effort. Ignore all errors on the request itself
      const approvedAmountOfData = await this.actApi.checkObjectStats(search, maxFetchLimit).catch(_e => true);
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
        this.eventBus.publish([{ kind: 'errorEvent', error: err as Error }]);
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
        searches.map(s =>
          this.executeSingleSearch(s).catch(e => (e.name !== 'AbortError' ? { error: e, search: s } : undefined))
        )
      );
      const errors = results.filter(Boolean);
      if (errors.length > 0) {
        this.eventBus.publish([
          {
            kind: 'errorEvent',
            title: 'Bulk result: ' + errors.length + ' of  ' + searches.length + ' searches failed',
            error: new Error('See search history for details')
          }
        ]);
      }
    } catch (err) {
      runInAction(() => {
        this.eventBus.publish([{ kind: 'errorEvent', error: err as Error, title: 'Bulk search failed' }]);
      });
    }
  }

  @action.bound
  async postAndForget(url: string, request: { [key: string]: any }, successMessage: string) {
    try {
      this.loading = true;
      await this.actApi.postJson(url, request);
      addMessage(successMessage);
    } catch (err) {
      runInAction(() => {
        this.eventBus.publish([{ kind: 'errorEvent', error: err as Error }]);
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}

export default BackendStore;
