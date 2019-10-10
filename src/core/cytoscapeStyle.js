import config from '../config';

export default ({ showEdgeLabels, fadeUnselected } = {}) => [
  {
    selector: 'node',
    style: {
      label: 'data(label)',
      'background-color': '#000000',
      'font-family': 'Roboto, sans-serif',
      opacity: fadeUnselected ? 0.5 : 1
    }
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': 6,
      color: '#f4a34d',
      'border-color': '#f4a34d',
      opacity: 1
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
      color: '#AAA',
      'text-outline-color': 'white',
      'text-outline-width': 2,
      opacity: fadeUnselected ? 0.5 : 1
    }
  },
  {
    selector: 'edge:selected',
    style: {
      'line-color': '#f4a34d',
      'target-arrow-color': '#f4a34d',
      width: 4,
      'z-index': 9999,
      opacity: 1
    }
  },
  {
    selector: 'edge[label]',
    style: {
      content: showEdgeLabels ? 'data(label)' : ''
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
      'target-arrow-color': '#e47f7f',
      'source-arrow-color': '#e47f7f'
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
    }
  }))
];
