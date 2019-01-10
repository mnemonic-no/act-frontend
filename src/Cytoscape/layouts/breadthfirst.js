import types from './types';
import layoutConfigToObject from './layoutConfigToObject';

export const layoutName = 'breadthfirst';
export const layoutUrl = `http://js.cytoscape.org/#layouts/breadthfirst`;
export const layoutConfig = {
  animate: { type: types.animate, value: false },
  directed: {
    type: types.boolean,
    value: false,
    description: `whether the tree is directed downwards (or edges can point in any direction if false)`
  },
  padding: { type: types.number, value: 30, description: `padding on fit` },
  circle: {
    type: types.boolean,
    value: false,
    description: `put depths in concentric circles if true, put depths top down if false`
  },
  spacingFactor: {
    type: types.number,
    value: 1.75,
    description: `positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)`
  },
  avoidOverlap: {
    type: types.boolean,
    value: true,
    description: `prevents node overlap, may overflow boundingBox if not enough space`
  },
  nodeDimensionsIncludeLabels: {
    type: types.boolean,
    value: false,
    description: `Excludes the label when calculating node bounding boxes for the layout algorithm`
  },
  maximalAdjustments: {
    type: types.number,
    value: 0,
    description: `how many times to try to position the nodes in a maximal way (i.e. no backtracking)`
  }
};
export const layoutObject = layoutConfigToObject({ layoutName, layoutConfig });
