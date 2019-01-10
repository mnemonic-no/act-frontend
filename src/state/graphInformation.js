import { extendObservable, observable } from 'mobx';

import filteringOptions from './filteringOptions';

// Store information about the graph, like selected node, stats
class GraphInformationStore {
  constructor () {
    extendObservable(
      this,
      {
        selectedNode: {
          type: '', // fact|object
          id: null // uuid
        },

        get objectsData () {
          return filteringOptions.filteredData.objectsData;
        },

        get factsData () {
          return filteringOptions.filteredData.factsData;
        }
      },
      {
        selectedNode: observable.ref
      }
    );
  }

  setSelectedNode (value) {
    this.selectedNode = value;
  }
}

export default new GraphInformationStore();
