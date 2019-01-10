import { extendObservable } from 'mobx';
import { objectFactsToElements } from '../core/transformers';
import getStyle from '../core/cytoscapeStyle';

import graphOptions from './graphOptions';
import filteringOptions from './filteringOptions';

// Cytoscape state, derived from other state
class CytostoscapeState {
  constructor () {
    extendObservable(this, {
      get elements () {
        const { factsData, objectsData } = filteringOptions.filteredData;
        return objectFactsToElements({
          facts: factsData,
          objects: objectsData,
          factsAsNodes: graphOptions.showFactsAsNodes
        });
      },
      get style () {
        return getStyle({ showEdgeLabels: graphOptions.showFactEdgeLabels });
      },
      get layout () {
        return graphOptions.layout.layoutObject;
      }
    });
  }
}

export default new CytostoscapeState();
