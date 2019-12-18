import { observable } from 'mobx';

import { ActFact, ActObject, isRejected, LoadingStatus, ObjectTraverseSearch, TRequestLoadable } from '../core/types';
import { autoResolveDataLoader, objectTraverseDataLoader } from '../core/dataLoaders';

export type ObjectTraverseLoadable = TRequestLoadable<
  ObjectTraverseSearch,
  { objects: Array<ActObject>; facts: Array<ActFact>; limitExceeded?: boolean }
>;

const id = ({ objectValue, objectType, query }: ObjectTraverseSearch) => objectType + ':' + objectValue + ':' + query;

class ObjectTraverseBackendStore {
  @observable cache: { [id: string]: ObjectTraverseLoadable } = {};

  async execute(objectValue: string, objectType: string, query: string) {
    const request: ObjectTraverseSearch = {
      kind: 'objectTraverse',
      objectValue: objectValue,
      objectType: objectType,
      query: query
    };
    const q: ObjectTraverseLoadable = {
      id: id(request),
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
          objects: Object.values(objects),
          facts: Object.values(facts)
        }
      };
    } catch (err) {
      this.cache[q.id] = { ...q, status: LoadingStatus.REJECTED, error: err.message };
    }
  }

  getItem(objectValue: string, objectType: string, query: string) {
    const s: ObjectTraverseSearch = {
      objectValue: objectValue,
      objectType: objectType,
      query: query,
      kind: 'objectTraverse'
    };
    return this.cache[id(s)];
  }

  includes(q: ObjectTraverseLoadable) {
    return this.cache.hasOwnProperty(q.id);
  }
}

export default ObjectTraverseBackendStore;
