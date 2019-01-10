import types from './types';
import layoutConfigToObject from './layoutConfigToObject';

export const layoutName = 'concentric';
export const layoutUrl = `http://js.cytoscape.org/#layouts/concentric`;
export const layoutConfig = {
  animate: { type: types.animate, value: false },

  padding: { type: types.number, value: 30, description: `the padding on fit` },
  startAngle: {
    type: types.number,
    value: 3 / 2 * Math.PI,
    description: `where nodes start in radians`
  },
  sweep: {
    type: types.number,
    value: undefined,
    description: `how many radians should be between the first and last node (defaults to full circle)`
  },
  clockwise: {
    type: types.boolean,
    value: true,
    description: `whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)`
  },
  equidistant: {
    type: types.boolean,
    value: false,
    description: `whether levels have an equal radial distance betwen them, may cause bounding box overflow`
  },
  minNodeSpacing: {
    type: types.number,
    value: 10,
    description: `min spacing between outside of nodes (used for radius adjustment)`
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
  concentric: {
    type: types.func,
    value: `(node) => node.degree()`,
    description: `returns numeric value for each node, placing higher nodes in levels towards the centre`
  }
};
export const layoutObject = layoutConfigToObject({ layoutName, layoutConfig });
