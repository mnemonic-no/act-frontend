import { observable } from 'mobx';

import { isRejected, LoadingStatus, ObjectFactsSearch, SearchResult, TRequestLoadable } from '../core/types';
import { autoResolveDataLoader, objectFactsDataLoader } from '../core/dataLoaders';

export type ObjectFactsLoadable = TRequestLoadable<ObjectFactsSearch, SearchResult>;

export const objectFactsId = ({ objectValue, objectType, factTypes }: ObjectFactsSearch) =>
  objectType + ':' + objectValue + ':' + JSON.stringify(factTypes);

class ObjectFactsBackendStore {
  @observable cache: { [id: string]: ObjectFactsLoadable } = {};

  async execute(request: ObjectFactsSearch) {
    const q: ObjectFactsLoadable = {
      id: objectFactsId(request),
      status: LoadingStatus.PENDING,
      args: request
    };

    if (this.includes(q) && !isRejected(this.cache[q.id])) {
      return;
    }

    this.cache[q.id] = q;

    try {
      const { facts, objects } = await objectFactsDataLoader(request).then(autoResolveDataLoader);

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

  getItemBy(s: ObjectFactsSearch) {
    return this.cache[objectFactsId(s)];
  }

  includes(q: ObjectFactsLoadable) {
    return this.cache.hasOwnProperty(q.id);
  }
}

export default ObjectFactsBackendStore;
