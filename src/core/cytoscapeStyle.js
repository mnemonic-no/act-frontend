import config from '../config.json';

export default ({ showEdgeLabels } = {}) => [
  {
    selector: 'node',
    style: {
      label: 'data(label)',

      // Display label in center of node:
      // 'content': 'data(label)',
      // 'text-valign': 'center',
      // 'color': 'white',
      // 'text-outline-width': 2,
      // 'text-outline-color': '#888',

      // 'text-outline-color': 'white',
      // 'text-outline-width': 2,
      'background-color': '#000000',
      'font-family': 'Roboto, sans-serif'
    }
  },
  {
    selector: ':selected',
    style: {
      'border-width': 8,
      'border-color': '#AAA' // TODO: Get from config.json theme
    }
  },
  {
    selector: 'node.fact',
    style: {
      'background-color': '#F84',
      'text-outline-color': '#F84',
      shape: 'diamond'
    }
  },

  {
    selector: 'edge',
    style: {
      width: 2,
      'curve-style': 'bezier',
      'target-arrow-shape': 'triangle',
      'arrow-scale': 1,
      'line-color': '#AAA',
      'target-arrow-color': '#AAA',

      'font-family': 'Roboto, sans-serif',
      content: showEdgeLabels ? 'data(label)' : '',
      color: '#AAA',
      'text-outline-color': 'white',
      'text-outline-width': 2
    }
  },
  {
    selector: 'edge.bidirectional',
    style: {
      'curve-style': 'bezier',
      'source-arrow-shape': 'triangle',
      'source-arrow-color': '#AAA'
    }
  },

  // Retractions
  {
    selector: 'edge[?retracted]',
    style: {
      'line-color': '#e47f7f',
      'target-arrow-color': '#e47f7f'
    }
  },
  {
    selector: 'node.fact[?retracted]',
    style: {
      'background-color': '#FF4F4F'
    }
  },

  // Config object type colors
  ...Object.keys(config.objectColors).map(objectType => ({
    selector: `node.${objectType}`,
    style: {
      'background-color': config.objectColors[objectType]
      // 'text-outline-color': config.objectColors[objectType]
    }
  }))
];
