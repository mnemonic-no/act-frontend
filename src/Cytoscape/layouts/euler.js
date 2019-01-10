import types from './types';
import layoutConfigToObject from './layoutConfigToObject';

export const layoutName = 'euler';
export const layoutUrl = `https://github.com/cytoscape/cytoscape.js-euler#api`;
export const layoutConfig = {
  animate: { type: types.animate, value: false },
  // The ideal length of a spring
  // - This acts as a hint for the edge length
  // - The edge length can be longer or shorter if the forces are set to extreme values
  springLength: { type: types.funcNumber, value: `edge => 80` },

  // Hooke's law coefficient
  // - The value ranges on [0, 1]
  // - Lower values give looser springs
  // - Higher values give tighter springs
  springCoeff: { type: types.funcNumber, value: `edge => 0.0008` },

  // The mass of the node in the physics simulation
  // - The mass affects the gravity node repulsion/attraction
  mass: { type: types.funcNumber, value: `node => 40` },

  // Coulomb's law coefficient
  // - Makes the nodes repel each other for negative values
  // - Makes the nodes attract each other for positive values
  gravity: { type: types.number, value: -1.2 },

  // A force that pulls nodes towards the origin (0, 0)
  // Higher values keep the components less spread out
  pull: { type: types.number, value: 0.001 },

  // Theta coefficient from Barnes-Hut simulation
  // - Value ranges on [0, 1]
  // - Performance is better with smaller values
  // - Very small values may not create enough force to give a good result
  theta: { type: types.number, value: 0.666 },

  // Friction / drag coefficient to make the system stabilise over time
  dragCoeff: { type: types.number, value: 0.02 },

  // When the total of the squared position deltas is less than this value, the simulation ends
  movementThreshold: { type: types.number, value: 1 },

  // The amount of time passed per tick
  // - Larger values result in faster runtimes but might spread things out too far
  // - Smaller values produce more accurate results
  timeStep: { type: types.number, value: 20 },

  // The number of ticks per frame for animate:true
  // - A larger value reduces rendering cost but can be jerky
  // - A smaller value increases rendering cost but is smoother
  refresh: { type: types.number, value: 10 },

  // Maximum iterations and time (in ms) before the layout will bail out
  // - A large value may allow for a better result
  // - A small value may make the layout end prematurely
  // - The layout may stop before this if it has settled
  maxIterations: { type: types.number, value: 500 },
  maxSimulationTime: { type: types.number, value: 4000 },

  // Prevent the user grabbing nodes during the layout (usually with animate:true)
  ungrabifyWhileSimulating: { type: types.boolean, value: false },

  // Padding in rendered co-ordinates around the layout
  padding: { type: types.number, value: 30 },

  // Whether to randomize the initial positions of the nodes
  // true : { value: Use random positions within the bounding box },
  // false : { value: Use the current node positions as the initial positions },
  randomize: { type: types.boolean, value: false }
};
export const layoutObject = layoutConfigToObject({ layoutName, layoutConfig });
