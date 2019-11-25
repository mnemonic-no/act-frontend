import { observable } from 'mobx';

import { ActFact, ActObject } from '../core/types';
import { autoResolveDataLoader, objectFactsTraverseDataLoader } from '../core/dataLoaders';

export type GraphQuery = {
  id: string;
  objectValue: string;
  objectTypeName: string;
  graphQuery: string;
  status: 'pending' | 'rejected' | 'done';
  objects?: Array<ActObject>;
  facts?: Array<ActFact>;
  limitExceeded?: boolean;
  errorDetails?: string;
};

const graphQueryId = ({
  objectValue,
  objectTypeName,
  graphQuery
}: Pick<GraphQuery, 'objectValue' | 'objectTypeName' | 'graphQuery'>) =>
  objectTypeName + ':' + objectValue + ':' + graphQuery;

class GraphQueryStore {
  @observable graphQueries: { [id: string]: GraphQuery } = {};

  async execute(objectValue: string, objectTypeName: string, graphQuery: string) {
    const q: GraphQuery = {
      id: graphQueryId({ objectValue: objectValue, objectTypeName: objectTypeName, graphQuery: graphQuery }),
      objectValue: objectValue,
      objectTypeName: objectTypeName,
      graphQuery: graphQuery,
      status: 'pending'
    };

    if (this.includes(q) && this.graphQueries[q.id].status !== 'rejected') {
      return;
    }

    this.graphQueries[q.id] = q;

    try {
      const { facts, objects } = await objectFactsTraverseDataLoader({
        objectType: objectTypeName,
        objectValue,
        query: graphQuery
      }).then(autoResolveDataLoader);

      this.graphQueries[q.id] = { ...q, status: 'done', objects: Object.values(objects), facts: Object.values(facts) };
    } catch (err) {
      this.graphQueries[q.id] = { ...q, status: 'rejected', errorDetails: err.message };
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
