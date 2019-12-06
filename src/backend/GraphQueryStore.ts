import { observable } from 'mobx';

import { ActFact, ActObject, isRejected, LoadingStatus, TRequestLoadable } from '../core/types';
import { autoResolveDataLoader, objectFactsTraverseDataLoader } from '../core/dataLoaders';

export type GraphQueryArgs = { objectValue: string; objectTypeName: string; graphQuery: string };

export type GraphQuery = TRequestLoadable<
  GraphQueryArgs,
  { objects: Array<ActObject>; facts: Array<ActFact>; limitExceeded?: boolean }
>;

const graphQueryId = ({ objectValue, objectTypeName, graphQuery }: GraphQueryArgs) =>
  objectTypeName + ':' + objectValue + ':' + graphQuery;

class GraphQueryStore {
  @observable graphQueries: { [id: string]: GraphQuery } = {};

  async execute(objectValue: string, objectTypeName: string, graphQuery: string) {
    const q: GraphQuery = {
      id: graphQueryId({ objectValue: objectValue, objectTypeName: objectTypeName, graphQuery: graphQuery }),
      status: LoadingStatus.PENDING,
      args: { objectValue: objectValue, objectTypeName: objectTypeName, graphQuery: graphQuery }
    };

    if (this.includes(q) && !isRejected(this.graphQueries[q.id])) {
      return;
    }

    this.graphQueries[q.id] = q;

    try {
      const { facts, objects } = await objectFactsTraverseDataLoader({
        objectType: objectTypeName,
        objectValue,
        query: graphQuery
      }).then(autoResolveDataLoader);

      this.graphQueries[q.id] = {
        ...q,
        status: LoadingStatus.DONE,
        result: {
          objects: Object.values(objects),
          facts: Object.values(facts)
        }
      };
    } catch (err) {
      this.graphQueries[q.id] = { ...q, status: LoadingStatus.REJECTED, error: err.message };
    }
  }

  getGraphQuery(objectValue: string, objectTypeName: string, graphQuery: string) {
    return this.graphQueries[
      graphQueryId({ objectValue: objectValue, objectTypeName: objectTypeName, graphQuery: graphQuery })
    ];
  }

  includes(q: GraphQuery) {
    return this.graphQueries.hasOwnProperty(q.id);
  }
}

export default GraphQueryStore;
