import types from './types';
import layoutConfigToObject from './layoutConfigToObject';

export const layoutName = 'cose-bilkent';
export const layoutUrl = `https://github.com/cytoscape/cytoscape.js-cose-bilkent#api`;
export const layoutConfig = {
  animate: {
    type: types.animate,
    value: 'end',
    description: `Type of layout animation. The option set is {'during', 'end', false}`
  },

  nodeDimensionsIncludeLabels: {
    type: types.boolean,
    value: true,
    description: `Whether to include labels in node dimensions. Useful for avoiding label overlap`
  },

  refresh: {
    type: types.number,
    value: 30,
    description: `number of ticks per frame; higher is faster but more jerky`
  },

  fit: {
    type: types.boolean,
    value: true,
    description: `Whether to fit the network view after when done`
  },

  padding: { type: types.number, value: 10, description: `Padding on fit` },

  randomize: {
    type: types.boolean,
    value: true,
    description: `Whether to enable incremental mode`
  },

  nodeRepulsion: {
    type: types.number,
    value: 4500,
    description: `Node repulsion (non overlapping) multiplier`
  },

  idealEdgeLength: {
    type: types.number,
    value: 50,
    description: `Ideal (intra-graph) edge length`
  },

  edgeElasticity: {
    type: types.number,
    value: 0.45,
    description: `Divisor to compute edge forces`
  },

  nestingFactor: {
    type: types.number,
    value: 0.1,
    description: `Nesting factor (multiplier) to compute ideal edge length for inter-graph edges`
  },

  gravity: {
    type: types.number,
    value: 0.25,
    description: `Gravity force (constant)`
  },

  numIter: {
    type: types.number,
    value: 2500,
    description: `Maximum number of iterations to perform`
  },

  tile: {
    type: types.boolean,
    value: true,
    description: `Whether to tile disconnected nodes`
  },

  tilingPaddingVertical: {
    type: types.number,
    value: 10,
    description: `Amount of vertical space to put between degree zero nodes during tiling (can also be a function)`
  },

  tilingPaddingHorizontal: {
    type: types.number,
    value: 10,
    description: `Amount of horizontal space to put between degree zero nodes during tiling (can also be a function)`
  },

  gravityRangeCompound: {
    type: types.number,
    value: 1.5,
    description: `Gravity range (constant) for compounds`
  },

  gravityCompound: {
    type: types.number,
    value: 1.0,
    description: `Gravity force (constant) for compounds`
  },

  gravityRange: {
    type: types.number,
    value: 3.8,
    description: `Gravity range (constant)`
  },

  initialEnergyOnIncremental: {
    type: types.number,
    value: 0.8,
    description: `Initial cooling factor for incremental layout`
  }
};
export const layoutObject = layoutConfigToObject({ layoutName, layoutConfig });
