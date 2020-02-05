import { observable } from 'mobx';

import { ActFact, FactComment, isRejected, LoadingStatus, TRequestLoadable } from '../core/types';
import { factByIdDataLoader, factCommentsDataLoader, metaFactsDataLoader } from '../core/dataLoaders';

export type FactSearch = TRequestLoadable<
  { factId: string },
  { fact: ActFact; comments: Array<FactComment>; metaFacts: Array<ActFact> }
>;

class FactBackendStore {
  @observable cache: Map<string, FactSearch> = new Map();

  config: { [any: string]: string };

  constructor(config: { [any: string]: string }) {
    this.config = config;
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
      const fact: ActFact = await factByIdDataLoader({ id: s.id });
      const comments: Array<FactComment> = await factCommentsDataLoader({ id: s.id });
      const metaFacts: Array<ActFact> = await metaFactsDataLoader({ id: s.id });

      this.cache.set(s.id, {
        ...s,
        status: LoadingStatus.DONE,
        result: { fact: fact, comments: comments, metaFacts: metaFacts }
      });
    } catch (err) {
      this.cache.set(s.id, { ...s, status: LoadingStatus.REJECTED, error: err.message });
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
