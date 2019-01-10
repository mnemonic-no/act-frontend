import types from './types';
import layoutConfigToObject from './layoutConfigToObject';

export const layoutName = 'cose';
export const layoutUrl = `http://js.cytoscape.org/#layouts/cose`;
export const layoutConfig = {
  animate: { type: types.animate, value: false },
  refresh: {
    type: types.number,
    value: 20,
    description: `Number of iterations between consecutive screen positions update (0 -> only updated on the end)`
  },
  componentSpacing: {
    type: types.number,
    value: 100,
    description: `Extra spacing between components in non-compound graphs`
  },
  nodeRepulsion: {
    type: types.funcNumber,
    value: `() => 400000`,
    description: `Node repulsion (non overlapping) multiplier`
  },
  nodeOverlap: {
    type: types.number,
    value: 4,
    description: `Node repulsion (overlapping) multiplier`
  },
  idealEdgeLength: {
    type: types.funcNumber,
    value: `() => 10`,
    description: `Ideal edge (non nested) length`
  },
  edgeElasticity: {
    type: types.funcNumber,
    value: `() => 100`,
    description: `Divisor to compute edge forces`
  },
  nestingFactor: {
    type: types.number,
    value: 5,
    description:
      'Nesting factor (multiplier) to compute ideal edge length for nested edges'
  },
  gravity: {
    type: types.number,
    value: 80,
    description: `Gravity force (constant)`
  },
  initialTemp: {
    type: types.number,
    value: 200,
    description: `Initial temperature (maximum node displacement)`
  },
  coolingFactor: {
    type: types.number,
    value: 0.95,
    description: `Cooling factor (how the temperature is reduced between consecutive iterations`
  },
  padding: {
    type: types.number,
    value: 4,
    description: `Lower temperature threshold (below this point the layout will end)`
  },
  numIter: {
    type: types.number,
    value: 500,
    description: `Maximum number of iterations to perform`
  }
};
export const layoutObject = layoutConfigToObject({ layoutName, layoutConfig });
