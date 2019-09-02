import React, { useEffect, useState } from 'react';
import { shallowEqual } from 'recompose';
import Cytoscape from 'cytoscape';
import * as _ from 'lodash/fp';
// @ts-ignore
import Klay from 'klayjs';
// Layouts
// @ts-ignore
import CytoscapeCoseBilkent from 'cytoscape-cose-bilkent/cytoscape-cose-bilkent';
// @ts-ignore
import CytoscapeDagre from 'cytoscape-dagre';
// @ts-ignore
import CytoscapeCola from 'cytoscape-cola';
// @ts-ignore
import CytoscapeEuler from 'cytoscape-euler';
// @ts-ignore
import CytoscapeSpread from 'cytoscape-spread';
// @ts-ignore
import CytoscapeKlay from 'cytoscape-klay';
import betterGrid from './betterGrid';

import Toolbar from './Toolbar';
import { usePrevious } from '../hooks';

Cytoscape.use(CytoscapeDagre);
CytoscapeCoseBilkent(Cytoscape);
CytoscapeCola(Cytoscape);
CytoscapeEuler(Cytoscape);
CytoscapeSpread(Cytoscape);
Cytoscape('layout', 'betterGrid', betterGrid);

// Takes 0.5mb, is it worth it? Could dynamicly load it when needed?
// @ts-ignore
Cytoscape.use(CytoscapeKlay, Klay);

const DEFAULT_CONF = {
  minZoom: 0.03,
  maxZoom: 1.3,
  boxSelectionEnabled: true
};

// Handles single and double clicks by introducing a slight delay for single clicks.
const clickHandlerFn = (singleClickHandler: (event: any) => void, doubleClickHandler: (event: any) => void) => {
  let previousEvent: any = null;
  // @ts-ignore
  let timer = null;

  // @ts-ignore
  return (event: any) => {
    if (!previousEvent) {
      previousEvent = event;
      timer = setTimeout(() => {
        // @ts-ignore
        if (event === previousEvent) {
          previousEvent = null;
          singleClickHandler && singleClickHandler(event.target);
        }
      }, 350);
    } else {
      // @ts-ignore
      timer && clearTimeout(timer);

      previousEvent = null;

      doubleClickHandler && doubleClickHandler(event.target);
    }
  };
};

// Actions
const fit = (cy: Cytoscape.Core) => {
  // @ts-ignore
  cy.animate({ fit: true, duration: 150 });
};

const focusOnSelection = (cy: Cytoscape.Core) => {
  cy.fit(cy.$(':selected'), 50);
};

const zoomIn = (cy: Cytoscape.Core) => {
  const zoom = {
    level: cy.zoom() * (1 + 0.25),
    position: { x: cy.width() / 2, y: cy.height() / 2 }
  };
  if (zoom.level > cy.maxZoom()) return;
  cy.animate({ zoom, duration: 150 });
};

const zoomOut = (cy: Cytoscape.Core) => {
  const zoom = {
    level: cy.zoom() * (1 - 0.25),
    position: { x: cy.width() / 2, y: cy.height() / 2 }
  };
  if (zoom.level < cy.minZoom()) return;
  cy.animate({ zoom, duration: 150 });
};

const runLayout = (
  cy: Cytoscape.Core,
  layoutConfig: Cytoscape.LayoutOptions,
  layout: Cytoscape.Layouts | null,
  setLayout: (l: Cytoscape.Layouts) => void
) => {
  // Layout euler crashes when there is no elements
  // And there is no point of running a layout on an empty graph
  if (cy.elements().length === 0) return;

  if (layout) {
    layout.stop();
  }
  const lay = cy.layout(layoutConfig);
  setLayout(lay);
  lay.run();
};

const CytoscapeComp = (input: ICytoscapeComp) => {
  const {
    elements,
    selectedNode,
    resizeEvent,
    style,
    layoutConfig,
    onNodeClick,
    onNodeDoubleClick,
    onSelectionChange,
    onNodeCtxClick
  } = input;

  const previousProps = usePrevious({
    elements,
    style,
    selectedNode,
    resizeEvent,
    layoutConfig
  });

  const [cy, setCy] = useState<Cytoscape.Core | null>(null);
  const [layout, setLayout] = useState<Cytoscape.Layouts | null>(null);

  // Bootstrap ! Just once!
  useEffect(() => {
    const theCy = Cytoscape({
      ...DEFAULT_CONF,
      ...{
        container: document.getElementById('cytoscape-container'),
        elements: elements,
        style: style,
        ready: ({ cy }: { cy: Cytoscape.Core }) => {
          cy.on('tap', 'node', clickHandlerFn(onNodeClick, onNodeDoubleClick));
          cy.on('tap', 'edge', clickHandlerFn(onNodeClick, onNodeDoubleClick));

          if (onSelectionChange) {
            // Debounce since this is called once per element in selection
            const debouncedFn = _.debounce(100)(() => {
              const selectionElements = cy.elements().filter(x => {
                return x.selected();
              });
              // @ts-ignore
              onSelectionChange(selectionElements);
            });

            cy.on('select', debouncedFn);
            cy.on('unselect', debouncedFn);
          }

          if (onNodeCtxClick) {
            cy.on('cxttap', 'node', (event: any) => {
              onNodeCtxClick(event.target);
            });
            cy.on('cxttap', 'edge', (event: any) => {
              onNodeCtxClick(event.target);
            });
          }
        }
      }
    });

    setCy(theCy);
    runLayout(theCy, layoutConfig, layout, setLayout);

    // Cleanup when the component unmounts
    return () => {
      if (cy !== undefined && cy !== null) {
        // @ts-ignore
        cy.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep Cytoscape state in sync with React state changes
  useEffect(() => {
    if (!cy) {
      return;
    }

    // Force the cytoscape container to resize itself when the container changes size
    // @ts-ignore
    if (previousProps && resizeEvent !== previousProps.resizeEvent) {
      // @ts-ignore
      cy.invalidateDimensions();
    }

    // If the elements in the graph changes,
    // @ts-ignore
    if (previousProps && !shallowEqual(previousProps.elements, elements)) {
      // Sync element changes with cytoscape state
      cy.json({ elements: elements });
      runLayout(cy, layoutConfig, layout, setLayout);
      focusOnSelection(cy);
      // @ts-ignore
    } else if (previousProps.layoutConfig !== layoutConfig) {
      runLayout(cy, layoutConfig, layout, setLayout);
    }

    // Keep the selection state up to date (sadly not handled by cy.json({elements: elements} above,
    // so we have to fix it ourselves))
    // @ts-ignore
    // Allow one item to be selected
    if (selectedNode && previousProps.selectedNode !== selectedNode) {
      cy.$(':selected').unselect();
      const node = cy.elements().getElementById(selectedNode);
      node.select();
    }

    // @ts-ignore
    if (previousProps.style !== style) {
      cy.style()
        // @ts-ignore
        .fromJson(style)
        .update();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, selectedNode, style, resizeEvent]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <div
        id="cytoscape-container"
        style={{ height: 'calc(100% - 10px)', width: 'calc(100% - 20px)', marginLeft: '10px' }}
      />
      <Toolbar
        onZoomIn={cy && (() => zoomIn(cy))}
        onZoomOut={cy && (() => zoomOut(cy))}
        onFit={cy && (() => fit(cy))}
        onFocusOnSelection={cy && (() => focusOnSelection(cy))}
      />
    </div>
  );
};

interface ICytoscapeComp {
  elements: any;
  selectedNode: any;
  resizeEvent: number;
  style: any;
  layoutConfig: any;
  onNodeClick: (target: any) => void;
  onNodeDoubleClick: (target: any) => void;
  onNodeCtxClick: (target: any) => void;
  onSelectionChange: (selection: Array<any>) => void;
}

export default CytoscapeComp;
