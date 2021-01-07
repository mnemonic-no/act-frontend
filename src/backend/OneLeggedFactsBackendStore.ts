import { observable } from 'mobx';

import { ActFact, isDone, isRejected, LoadingStatus, TRequestLoadable } from '../core/types';
import { isOneLeggedFactType } from '../core/domain';
import BackendStore from './BackendStore';
import { ActApi } from './ActApi';
export type OneLeggedFactsSearch = TRequestLoadable<{ objectId: string }, { facts: Array<ActFact> }>;

class OneLeggedFactsBackendStore {
  backendStore: BackendStore;
  actApi: ActApi;

  @observable cache: { [id: string]: OneLeggedFactsSearch } = {};

  constructor(backendStore: BackendStore, actApi: ActApi) {
    this.backendStore = backendStore;
    this.actApi = actApi;
  }

  async execute(objectId: string) {
    const s: OneLeggedFactsSearch = {
      id: objectId,
      args: { objectId: objectId },
      status: LoadingStatus.PENDING
    };

    if (this.includes(s) && !isRejected(this.cache[s.id])) {
      return;
    }

    this.cache[s.id] = s;

    try {
      const oneLeggedFacts = await this.actApi.factDataLoader(s.id, this.oneLeggedFactTypeNames());

      this.cache[s.id] = { ...s, status: LoadingStatus.DONE, result: { facts: oneLeggedFacts } };
    } catch (err) {
      this.cache[s.id] = { ...s, status: LoadingStatus.REJECTED, error: err.message };
    }
  }

  oneLeggedFactTypeNames(): Array<string> {
    if (!this.backendStore.factTypes || !isDone(this.backendStore.factTypes)) return [];

    return this.backendStore.factTypes.result.factTypes.filter(ft => isOneLeggedFactType(ft)).map(ft => ft.name);
  }

  getOneLeggedFacts(id: string) {
    return this.cache[id];
  }

  includes(s: OneLeggedFactsSearch) {
    return this.cache.hasOwnProperty(s.id);
  }
}

export default OneLeggedFactsBackendStore;
