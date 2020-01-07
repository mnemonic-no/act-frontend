import { observable } from 'mobx';

import { isRejected, LoadingStatus, MultiObjectTraverseSearch, SearchResult, TRequestLoadable } from '../core/types';
import { multiObjectTraverseDataLoader } from '../core/dataLoaders';

export type MultiObjectTraverseLoadable = TRequestLoadable<MultiObjectTraverseSearch, SearchResult>;

export const multiObjectTraverseId = (req: { objectIds: Array<string>; query: string }) => {
  return req.query + ' ' + req.objectIds.join(',');
};

class MultiObjectTraverseBackendStore {
  @observable cache: { [id: string]: MultiObjectTraverseLoadable } = {};

  async execute(request: MultiObjectTraverseSearch) {
    const q: MultiObjectTraverseLoadable = {
      id: multiObjectTraverseId(request),
      status: LoadingStatus.PENDING,
      args: request
    };

    if (this.includes(q) && !isRejected(this.cache[q.id])) {
      return;
    }

    this.cache[q.id] = q;

    try {
      const { facts, objects } = await multiObjectTraverseDataLoader(request);

      this.cache[q.id] = {
        ...q,
        status: LoadingStatus.DONE,
        result: {
          objects: objects,
          facts: facts
        }
      };
    } catch (err) {
      this.cache[q.id] = { ...q, status: LoadingStatus.REJECTED, error: err.message };
      throw err;
    }
  }

  getItemBy(s: MultiObjectTraverseSearch) {
    return this.cache[multiObjectTraverseId(s)];
  }

  includes(q: MultiObjectTraverseLoadable) {
    return this.cache.hasOwnProperty(q.id);
  }
}

export default MultiObjectTraverseBackendStore;
