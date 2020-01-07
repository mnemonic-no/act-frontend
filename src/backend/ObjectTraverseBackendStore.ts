import { observable } from 'mobx';

import { isRejected, LoadingStatus, ObjectTraverseSearch, SearchResult, TRequestLoadable } from '../core/types';
import { autoResolveDataLoader, objectTraverseDataLoader } from '../core/dataLoaders';

export type ObjectTraverseLoadable = TRequestLoadable<ObjectTraverseSearch, SearchResult>;

export const objectTraverseId = ({ objectValue, objectType, query }: ObjectTraverseSearch) =>
  objectType + ':' + objectValue + ':' + query;

class ObjectTraverseBackendStore {
  @observable cache: { [id: string]: ObjectTraverseLoadable } = {};

  async execute(request: ObjectTraverseSearch) {
    const q: ObjectTraverseLoadable = {
      id: objectTraverseId(request),
      status: LoadingStatus.PENDING,
      args: request
    };

    if (this.includes(q) && !isRejected(this.cache[q.id])) {
      return;
    }

    this.cache[q.id] = q;

    try {
      const { facts, objects } = await objectTraverseDataLoader(request).then(autoResolveDataLoader);

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

  getItem(objectValue: string, objectType: string, query: string) {
    const s: ObjectTraverseSearch = {
      objectValue: objectValue,
      objectType: objectType,
      query: query,
      kind: 'objectTraverse'
    };
    return this.cache[objectTraverseId(s)];
  }

  getItemBy(s: ObjectTraverseSearch) {
    return this.cache[objectTraverseId(s)];
  }

  includes(q: ObjectTraverseLoadable) {
    return this.cache.hasOwnProperty(q.id);
  }
}

export default ObjectTraverseBackendStore;
