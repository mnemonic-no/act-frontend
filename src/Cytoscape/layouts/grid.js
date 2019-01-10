import types from './types';
import layoutConfigToObject from './layoutConfigToObject';

export const layoutName = 'grid';
export const layoutUrl = `http://js.cytoscape.org/#layouts/grid`;
export const layoutConfig = {
  animate: { type: types.animate, value: false },
  padding: {
    type: types.number,
    value: 30,
    description: `padding used on fit`
  },
  avoidOverlap: {
    type: types.boolean,
    value: true,
    description: `prevents node overlap, may overflow boundingBox if not enough space`
  },
  avoidOverlapPadding: {
    type: types.number,
    value: 10,
    description: `extra spacing around nodes when avoidOverlap: true`
  },
  nodeDimensionsIncludeLabels: {
    type: types.boolean,
    value: false,
    description: `Excludes the label when calculating node bounding boxes for the layout algorithm`
  },
  spacingFactor: {
    type: types.number,
    value: undefined,
    description: `Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up`
  },
  condense: {
    type: types.boolean,
    value: false,
    description: `uses all available space on false, uses minimal space on true`
  },
  rows: {
    type: types.number,
    value: undefined,
    description: `force num of rows in the grid`
  },

  cols: {
    type: types.number,
    value: undefined,
    description: `force num of columns in the grid`
  }
};
export const layoutObject = layoutConfigToObject({ layoutName, layoutConfig });
