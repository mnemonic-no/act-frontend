import { observable } from 'mobx';

import {
  isPending,
  isRejected,
  LoadingStatus,
  ObjectFactsSearch,
  SearchResult,
  TConfig,
  TRequestLoadable
} from '../core/types';
import { autoResolveDataLoader, objectFactsDataLoader } from '../core/dataLoaders';

export type ObjectFactsLoadable = TRequestLoadable<ObjectFactsSearch, SearchResult>;

export const getId = ({ objectValue, objectType, factTypes }: ObjectFactsSearch) =>
  objectType + ':' + objectValue + ':' + JSON.stringify(factTypes);

class ObjectFactsBackendStore {
  config: TConfig;

  @observable cache: { [id: string]: ObjectFactsLoadable } = {};

  constructor(config: TConfig) {
    this.config = config;
  }

  async execute(request: ObjectFactsSearch) {
    const abortController = new AbortController();

    const q: ObjectFactsLoadable = {
      id: getId(request),
      status: LoadingStatus.PENDING,
      args: request,
      abortController: abortController
    };

    if (this.includes(q) && !isRejected(this.cache[q.id])) {
      return;
    }

    this.cache[q.id] = q;

    try {
      const { facts, objects } = await objectFactsDataLoader(request, abortController).then(value =>
        autoResolveDataLoader(value, this.config)
      );

      this.cache[q.id] = {
        ...q,
        status: LoadingStatus.DONE,
        result: {
          objects: objects,
          facts: facts
        }
      };
    } catch (err) {
      // Aborts are initiated by the user, so just ignore them
      if (err.name === 'AbortError') {
        return;
      }

      this.cache[q.id] = { ...q, status: LoadingStatus.REJECTED, error: err.message };
      throw err;
    }
  }

  getItemBy(s: ObjectFactsSearch) {
    return this.cache[getId(s)];
  }

  includes(q: ObjectFactsLoadable) {
    return this.cache.hasOwnProperty(q.id);
  }

  remove(search: ObjectFactsSearch) {
    const id = getId(search);
    const s = this.cache[id];
    if (isPending(s) && s.abortController) {
      s.abortController.abort();
    }
    delete this.cache[id];
  }
}

export default ObjectFactsBackendStore;
