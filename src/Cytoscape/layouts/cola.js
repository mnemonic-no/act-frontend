import types from './types';
import layoutConfigToObject from './layoutConfigToObject';

export const layoutName = 'cola';
export const layoutUrl = `https://github.com/cytoscape/cytoscape.js-cola#api`;
export const layoutConfig = {
  maxSimulationTime: {
    type: types.number,
    value: 4000,
    description: `max length in ms to run the layout`
  },
  ungrabifyWhileSimulating: {
    type: types.boolean,
    value: true,
    description: `so you can't drag nodes during layout`
  },
  padding: {
    type: types.number,
    value: 30,
    description: `padding around the simulation`
  },

  nodeDimensionsIncludeLabels: {
    type: types.boolean,
    value: true,
    description: `whether labels should be included in determining the space used by a node (default true)`
  },

  // positioning options
  randomize: {
    type: types.boolean,
    value: false,
    description: `use random node positions at beginning of layout`
  },
  avoidOverlap: {
    type: types.boolean,
    value: true,
    description: `if true, prevents overlap of node bounding boxes`
  },
  handleDisconnected: {
    type: types.boolean,
    value: true,
    description: `if true, avoids disconnected components from overlapping`
  },
  nodeSpacing: {
    type: types.funcNumber,
    value: `() => 10`,
    description: `extra spacing around nodes`
  }
};
export const layoutObject = layoutConfigToObject({ layoutName, layoutConfig });
