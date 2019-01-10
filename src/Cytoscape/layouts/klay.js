import types from './types';
import layoutConfigToObject from './layoutConfigToObject';

export const layoutName = 'klay';
export const layoutUrl = `https://github.com/cytoscape/cytoscape.js-klay#api`;
export const layoutConfig = {
  animate: { type: types.animate, value: false }
};
export const layoutObject = layoutConfigToObject({ layoutName, layoutConfig });
