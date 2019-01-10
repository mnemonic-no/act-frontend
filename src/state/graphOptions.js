import { extendObservable, observable } from 'mobx';
import LAYOUTS from '../Cytoscape/layouts';

// Store how to display the ACT data
class GraphOptionsStore {
  constructor () {
    extendObservable(
      this,
      {
        // TODO: Generalize localStorage
        showFactsAsNodes: Boolean(
          JSON.parse(window.localStorage.getItem('options.showFactsAsNodes'))
        ),
        showFactEdgeLabels: Boolean(
          JSON.parse(window.localStorage.getItem('options.showFactEdgeLabels'))
        ),
        showRetractions:
          true ||
          Boolean(
            // TODO: Remove default true
            JSON.parse(window.localStorage.getItem('options.showRetractions'))
          ),
        // Layout
        layout: LAYOUTS.euler
      },
      {
        layout: observable.ref
      }
    );
  }

  setShowFactsAsNodes (value) {
    window.localStorage.setItem(
      'options.showFactsAsNodes',
      JSON.stringify(value)
    );
    this.showFactsAsNodes = value;
  }
  setShowFactEdgeLabels (value) {
    window.localStorage.setItem(
      'options.showFactEdgeLabels',
      JSON.stringify(value)
    );
    this.showFactEdgeLabels = value;
  }

  setShowRetractions (value) {
    window.localStorage.setItem(
      'options.showRetractions',
      JSON.stringify(value)
    );
    this.showRetractions = value;
  }

  setLayout (value) {
    this.layout = value;
  }
}

export default new GraphOptionsStore();
