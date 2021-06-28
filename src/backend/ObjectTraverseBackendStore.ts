import { observable } from 'mobx';

import {
  isPending,
  isRejected,
  LoadingStatus,
  ObjectTraverseSearch,
  SearchResult,
  TConfig,
  TRequestLoadable
} from '../core/types';
import { ActApi } from './ActApi';

export type ObjectTraverseLoadable = TRequestLoadable<ObjectTraverseSearch, SearchResult>;

export const getId = ({ objectValue, objectType, query }: ObjectTraverseSearch) =>
  objectType + ':' + objectValue + ':' + query;

class ObjectTraverseBackendStore {
  config: TConfig;
  actApi: ActApi;

  @observable cache: { [id: string]: ObjectTraverseLoadable } = {};

  constructor(config: TConfig, actApi: ActApi) {
    this.config = config;
    this.actApi = actApi;
  }

  async execute(request: ObjectTraverseSearch) {
    const abortController = new AbortController();

    const q: ObjectTraverseLoadable = {
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
      const { facts, objects } = await this.actApi
        .objectTraverseDataLoader(request, abortController)
        .then(value => this.actApi.autoResolveDataLoader(value, this.config));

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

  getItemBy(s: ObjectTraverseSearch) {
    return this.cache[getId(s)];
  }

  includes(q: ObjectTraverseLoadable) {
    return this.cache.hasOwnProperty(q.id);
  }

  remove(search: ObjectTraverseSearch) {
    const id = getId(search);
    const s = this.cache[id];
    if (isPending(s) && s.abortController) {
      s.abortController.abort();
    }
    delete this.cache[id];
  }
}

export default ObjectTraverseBackendStore;
