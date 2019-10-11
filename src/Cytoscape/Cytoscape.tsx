import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import * as _ from 'lodash/fp';
import Cytoscape from 'cytoscape';
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
import { shallowEqual } from 'recompose';

import betterGrid from './betterGrid';
import { usePrevious } from '../hooks';
import { createBatcherFn, modifierKeysUsed, setSymmetricDifference } from '../util/util';
import Toolbar from './Toolbar';
import CytoscapeLayoutStore from '../pages/CytoscapeLayout/CytoscapeLayoutStore';

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
    // Ignore mouse events with modifiers
    if (event.originalEvent && modifierKeysUsed(event.originalEvent)) {
      return;
    }

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
  cy.animate({ fit: { eles: '*', padding: 10 }, duration: 150 });
};

const focusOnSelection = (cy: Cytoscape.Core) => {
  cy.fit(cy.$(':selected'), 50);
};

const centerOnSelection = (cy: Cytoscape.Core) => {
  cy.center(cy.$(':selected'));
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

// Reflect the set of selected nodes in the Cytoscape view
const syncSelection = (cy: Cytoscape.Core, selectedNodeIds: Set<string>) => {
  cy.$(':selected').each(x => {
    if (!selectedNodeIds.has(x.data().id)) x.unselect();
  });

  selectedNodeIds.forEach(id => {
    cy.elements()
      .getElementById(id)
      .select();
  });
};

const useStyles = makeStyles(() => ({
  root: { height: '100%', width: '100%', position: 'relative' },
  cytoscapeContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }
}));

const CytoscapeComp = (input: ICytoscapeComp) => {
  const classes = useStyles();

  const {
    elements,
    selectedNodeIds,
    resizeEvent,
    style,
    layoutConfig,
    cytoscapeLayoutStore,
    onNodeClick,
    onNodeDoubleClick,
    onSelect,
    onUnselect,
    onNodeCtxClick
  } = input;

  const previousProps = usePrevious({
    elements,
    style,
    selectedNodeIds,
    resizeEvent,
    layoutConfig
  });

  const [cy, setCy] = useState<Cytoscape.Core | null>(null);
  const [layout, setLayout] = useState<Cytoscape.Layouts | null>(null);

  // Bootstrap Cytoscape element the first time the component is mounted
  useEffect(() => {
    const newCy = Cytoscape({
      ...DEFAULT_CONF,
      ...{
        container: document.getElementById('cytoscape-container'),
        elements: elements,
        style: style,
        ready: ({ cy }: { cy: Cytoscape.Core }) => {
          cy.on('tap', 'node', clickHandlerFn(onNodeClick, onNodeDoubleClick));
          cy.on('tap', 'edge', clickHandlerFn(onNodeClick, onNodeDoubleClick));

          if (onSelect) {
            // Debounce since this is called once per element in selection
            const debouncedFn = _.debounce(100)(() => {
              const selectionElements = cy.elements().filter(x => {
                return x.selected();
              });
              // @ts-ignore
              onSelect(selectionElements);
            });
            cy.on('select', debouncedFn);
          }

          if (onUnselect) {
            const onUnselectBatchFn = createBatcherFn<Cytoscape.EventObject>(onUnselect, 200);
            cy.on('unselect', (event: Cytoscape.EventObject) => {
              onUnselectBatchFn(event.target);
            });
          }

          if (onNodeCtxClick) {
            cy.on('cxttap', 'node', (event: Cytoscape.EventObject) => {
              onNodeCtxClick(event.target);
            });
            cy.on('cxttap', 'edge', (event: Cytoscape.EventObject) => {
              onNodeCtxClick(event.target);
            });
          }
        }
      }
    });

    setCy(newCy);
    runLayout(newCy, layoutConfig, layout, setLayout);
    syncSelection(newCy, selectedNodeIds);

    // Cleanup when the component unmounts
    return () => {
      if (cy !== undefined && cy !== null) {
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
      cy.invalidateDimensions();
    }

    // If the elements in the graph changes,
    // @ts-ignore
    if (previousProps && !shallowEqual(previousProps.elements, elements)) {
      // Sync element changes with cytoscape state
      cy.json({ elements: elements });
      runLayout(cy, { ...layoutConfig, fit: false }, layout, setLayout);
      syncSelection(cy, selectedNodeIds);
      centerOnSelection(cy);
      // @ts-ignore
    } else if (previousProps.layoutConfig !== layoutConfig) {
      runLayout(cy, layoutConfig, layout, setLayout);
    }

    // Keep the selection state up to date (sadly not handled by cy.json({elements: elements} above,
    // so we have to fix it ourselves))
    if (previousProps && setSymmetricDifference(previousProps.selectedNodeIds, selectedNodeIds).size > 0) {
      syncSelection(cy, selectedNodeIds);
    }

    // @ts-ignore
    if (previousProps.style !== style) {
      cy.style()
        // @ts-ignore
        .fromJson(style)
        .update();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, selectedNodeIds, style, resizeEvent]);

  return (
    <div className={classes.root}>
      <div id="cytoscape-container" className={classes.cytoscapeContainer} />
      <Toolbar
        cytoscapeLayoutStore={cytoscapeLayoutStore}
        onZoomIn={() => cy && zoomIn(cy)}
        onZoomOut={() => cy && zoomOut(cy)}
        onFit={() => cy && fit(cy)}
        onFocusOnSelection={() => cy && focusOnSelection(cy)}
      />
    </div>
  );
};

interface ICytoscapeComp {
  elements: any;
  selectedNodeIds: Set<string>;
  resizeEvent: number;
  style: any;
  layoutConfig: any;
  cytoscapeLayoutStore: CytoscapeLayoutStore;
  onNodeClick: (target: any) => void;
  onNodeDoubleClick: (target: any) => void;
  onNodeCtxClick?: (target: any) => void;
  onSelect?: (selection: Array<any>) => void;
  onUnselect?: (selection: Array<any>) => void;
}

export default CytoscapeComp;
