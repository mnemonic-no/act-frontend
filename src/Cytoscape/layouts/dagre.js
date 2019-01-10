import types from './types';
import layoutConfigToObject from './layoutConfigToObject';

export const layoutName = 'dagre';
export const layoutUrl = `https://github.com/cytoscape/cytoscape.js-dagre#api`;
export const layoutConfig = {
  animate: { type: types.animate, value: false },
  minLen: {
    type: types.funcNumber,
    value: `() => 1`,
    description: `number of ranks to keep between the source and target of the edge`
  },
  edgeWeight: {
    type: types.func,
    value: `(edge) => 1`,
    description: `higher weight edges are generally made shorter and straighter than lower weight edges`
  },

  // general layout options
  padding: { type: types.number, value: 30, description: `fit padding` },
  spacingFactor: {
    type: types.number,
    value: undefined,
    description: `Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up`
  },
  nodeDimensionsIncludeLabels: {
    type: types.boolean,
    value: true,
    description: `whether labels should be included in determining the space used by a node (default true)`
  }
};
export const layoutObject = layoutConfigToObject({ layoutName, layoutConfig });
