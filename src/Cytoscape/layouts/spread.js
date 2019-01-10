import types from './types';
import layoutConfigToObject from './layoutConfigToObject';

export const layoutName = 'spread';
export const layoutUrl = `https://github.com/cytoscape/cytoscape.js-spread#api`;
export const layoutConfig = {
  animate: { type: types.animate, value: false },
  minDist: {
    type: types.number,
    value: 20,
    description: `Minimum distance between nodes`
  },
  padding: { type: types.number, value: 20, description: `Padding` },
  expandingFactor: {
    type: types.number,
    value: -1.0,
    description: `If the network does not satisfy the minDist
criterium then it expands the network of this amount
If it is set to -1.0 the amount of expansion is automatically
calculated based on the minDist, the aspect ratio and the
number of nodes`
  },
  maxFruchtermanReingoldIterations: {
    type: types.number,
    value: 50,
    description: `Maximum number of initial force-directed iterations`
  },
  maxExpandIterations: {
    type: types.number,
    value: 4,
    description: `Maximum number of expanding iterations`
  },
  randomize: {
    type: types.boolean,
    value: false,
    description: `uses random initial node positions on true`
  }
};
export const layoutObject = layoutConfigToObject({ layoutName, layoutConfig });
