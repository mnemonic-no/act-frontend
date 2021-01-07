import { observable } from 'mobx';

import {
  isPending,
  isRejected,
  LoadingStatus,
  MultiObjectTraverseSearch,
  SearchResult,
  TRequestLoadable
} from '../core/types';
import { ActApi } from './ActApi';

export type MultiObjectTraverseLoadable = TRequestLoadable<MultiObjectTraverseSearch, SearchResult>;

export const getId = (req: { objectIds: Array<string>; query: string }) => {
  return req.query + ' ' + req.objectIds.join(',');
};

class MultiObjectTraverseBackendStore {
  @observable cache: { [id: string]: MultiObjectTraverseLoadable } = {};

  actApi: ActApi;

  constructor(actApi: ActApi) {
    this.actApi = actApi;
  }

  async execute(request: MultiObjectTraverseSearch) {
    const abortController = new AbortController();
    const q: MultiObjectTraverseLoadable = {
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
      const { facts, objects } = await this.actApi.multiObjectTraverseDataLoader(request, abortController);

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

  getItemBy(s: MultiObjectTraverseSearch) {
    return this.cache[getId(s)];
  }

  includes(q: MultiObjectTraverseLoadable) {
    return this.cache.hasOwnProperty(q.id);
  }

  remove(search: MultiObjectTraverseSearch) {
    const id = getId(search);
    const s = this.cache[id];
    if (isPending(s) && s.abortController) {
      s.abortController.abort();
    }
    delete this.cache[id];
  }
}

export default MultiObjectTraverseBackendStore;
