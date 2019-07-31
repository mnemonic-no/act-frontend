import React from 'react';
import { shallowEqual } from 'recompose';
import PropTypes from 'prop-types';
import Cytoscape from 'cytoscape';
import Klay from 'klayjs';
// Layouts
import CytoscapeCoseBilkent from 'cytoscape-cose-bilkent/cytoscape-cose-bilkent';
import CytoscapeDagre from 'cytoscape-dagre';
import CytoscapeCola from 'cytoscape-cola';
import CytoscapeEuler from 'cytoscape-euler';
import CytoscapeSpread from 'cytoscape-spread';
import CytoscapeKlay from 'cytoscape-klay';
import betterGrid from './betterGrid';

import Toolbar from './Toolbar';

Cytoscape.use(CytoscapeDagre);
CytoscapeCoseBilkent(Cytoscape);
CytoscapeCola(Cytoscape);
CytoscapeEuler(Cytoscape);
CytoscapeSpread(Cytoscape);
Cytoscape('layout', 'betterGrid', betterGrid);

// Takes 0.5mb, is it worth it? Could dynamicly load it when needed?
Cytoscape.use(CytoscapeKlay, Klay);

const DEFAULT_CONF = {
  minZoom: 0.03,
  maxZoom: 1.3
};

// Handles single and double clicks by introducing a slight delay for single clicks.
const clickHandlerFn = (singleClickHandler, doubleClickHandler) => {
  let previousEvent = null;
  let timer = null;

  return event => {
    if (!previousEvent) {
      previousEvent = event;
      timer = setTimeout(() => {
        if (event === previousEvent) {
          previousEvent = null;
          singleClickHandler && singleClickHandler(event.target);
        }
      }, 350);
    } else {
      timer && clearTimeout(timer);
      previousEvent = null;
      doubleClickHandler && doubleClickHandler(event.target);
    }
  };
};

class CytoscapeContainer extends React.Component {
  constructor() {
    super();
    this.runLayout = this.runLayout.bind(this);
    this.layout = null;
  }
  componentDidMount() {
    this.cy = Cytoscape(
      Object.assign({}, DEFAULT_CONF, {
        container: document.getElementById('cytoscape-container'),
        elements: this.props.elements,
        style: this.props.style,
        ready: ({ cy }) => {
          // Selected
          if (this.props.selectedNode) {
            const node = cy.elements().getElementById(this.props.selectedNode);
            node.select();
          }

          cy.on('tap', 'node', clickHandlerFn(this.props.onNodeClick, this.props.onNodeDoubleClick));
          cy.on('tap', 'edge', clickHandlerFn(this.props.onNodeClick, this.props.onNodeDoubleClick));

          if (this.props.onNodeCtxClick) {
            cy.on('cxttap', 'node', event => {
              this.props.onNodeCtxClick(event.target);
            });
            cy.on('cxttap', 'edge', event => {
              this.props.onNodeCtxClick(event.target);
            });
          }
        }
      })
    );
    this.runLayout(this.props.layout);
  }

  componentDidUpdate(prevProps) {
    if (!shallowEqual(prevProps.elements, this.props.elements)) {
      this.cy.json({ elements: this.props.elements });
      this.runLayout(this.props.layout);
      this.focusOnSelection();
    } else if (prevProps.layout !== this.props.layout) {
      this.runLayout(this.props.layout);
    } else if (prevProps.lockNodes !== this.props.lockNodes) {
      if (this.props.lockNodes) {
        // Lock all nodes
        this.cy.nodes().lock();
      } else {
        // Unlock all nodes
        this.cy.nodes().unlock();
      }
    }

    // Allow one item to be selected
    if (prevProps.selectedNode !== this.props.selectedNode && this.props.selectedNode) {
      this.cy.$(':selected').unselect();
      const node = this.cy.elements().getElementById(this.props.selectedNode);
      node.select();
    }

    if (prevProps.style !== this.props.style) {
      this.cy
        .style()
        .fromJson(this.props.style)
        .update();
    }
  }

  componentWillUnmount() {
    if (this.cy) {
      this.cy.destroy();
    }
  }

  runLayout(layout) {
    // Layout euler crashes when there is no elements
    // And there is no point of running a layout on an empty graph
    if (this.cy.elements().length === 0) return;

    if (this.layout) {
      this.layout.stop();
    }
    this.layout = this.cy.layout(layout);
    this.layout.run();
  }

  // Actions
  fit = () => {
    this.cy.animate({ fit: true, duration: 150 });
  };

  focusOnSelection = () => {
    this.cy.fit(this.cy.$(':selected'), 50);
  };

  zoomIn = () => {
    const zoom = {
      level: this.cy.zoom() * (1 + 0.25),
      position: { x: this.cy.width() / 2, y: this.cy.height() / 2 }
    };
    if (zoom.level > this.cy.maxZoom()) return;
    // this.cy.zoom(zoom);
    this.cy.animate({ zoom, duration: 150 });
  };

  zoomOut = () => {
    const zoom = {
      level: this.cy.zoom() * (1 - 0.25),
      position: { x: this.cy.width() / 2, y: this.cy.height() / 2 }
    };
    if (zoom.level < this.cy.minZoom()) return;
    // this.cy.zoom(zoom);
    this.cy.animate({ zoom, duration: 150 });
  };

  render() {
    return (
      <div style={{ height: '100%', width: '100%', position: 'relative' }}>
        <div
          id="cytoscape-container"
          style={{ height: '99%', width: '98%', marginLeft: '1%' }}
          ref={el => {
            this.containerDOM = el;
          }}
        />
        {/* Toolbar */}
        <Toolbar
          onZoomIn={this.zoomIn}
          onZoomOut={this.zoomOut}
          onFit={this.fit}
          onFocusOnSelection={this.focusOnSelection}
        />
      </div>
    );
  }
}
CytoscapeContainer.propTypes = {
  elements: PropTypes.array.isRequired,
  style: PropTypes.array,
  layout: PropTypes.object.isRequired,
  onNodeClick: PropTypes.func.isRequired,
  onNodeCtxClick: PropTypes.func,
  lockNodes: PropTypes.bool,
  selectedNode: PropTypes.string
};
CytoscapeContainer.defaultProps = {
  style: []
};

export default CytoscapeContainer;
