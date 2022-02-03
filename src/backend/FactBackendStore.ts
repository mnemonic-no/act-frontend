import { observable } from 'mobx';

import { ActFact, FactComment, isRejected, LoadingStatus, TRequestLoadable } from '../core/types';
import { ActApi } from './ActApi';

export type FactSearch = TRequestLoadable<
  { factId: string },
  { fact: ActFact; comments: Array<FactComment>; metaFacts: Array<ActFact> }
>;

class FactBackendStore {
  @observable cache: Map<string, FactSearch> = new Map();

  actApi: ActApi;

  constructor(actApi: ActApi) {
    this.actApi = actApi;
  }

  async execute(props: { factId: string; refetch: boolean }) {
    const s: FactSearch = {
      id: props.factId,
      args: { factId: props.factId },
      status: LoadingStatus.PENDING
    };

    const exists = this.cache.get(s.id);
    if (!props.refetch && exists && !isRejected(exists)) {
      return;
    }

    this.cache.set(s.id, s);

    try {
      const fact: ActFact = await this.actApi.factByIdDataLoader({ id: s.id });
      const comments: Array<FactComment> = await this.actApi.factCommentsDataLoader({ id: s.id });
      const metaFacts: Array<ActFact> = await this.actApi.metaFactsDataLoader({ id: s.id });

      this.cache.set(s.id, {
        ...s,
        status: LoadingStatus.DONE,
        result: { fact: fact, comments: comments, metaFacts: metaFacts }
      });
    } catch (err) {
      this.cache.set(s.id, { ...s, status: LoadingStatus.REJECTED, error: (err as Error)?.message });
    }
  }

  getFact(id: string) {
    return this.cache.get(id);
  }

  includes(id: string) {
    return this.cache.has(id);
  }
}

export default FactBackendStore;
