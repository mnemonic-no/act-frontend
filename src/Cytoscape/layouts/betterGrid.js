import types from './types';
import layoutConfigToObject from './layoutConfigToObject';

export const layoutName = 'betterGrid';
export const layoutUrl = `https://github.com/visallo/visallo/blob/master/web/plugins/graph-product/src/main/resources/org/visallo/web/product/graph/betterGrid.js`;
export const layoutConfig = {
  fit: { type: types.invisible, value: true }
};
export const layoutObject = layoutConfigToObject({ layoutName, layoutConfig });
