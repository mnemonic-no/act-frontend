import React from 'react';
import PropTypes from 'prop-types';
import { compose, withHandlers, withContext, setPropTypes } from 'recompose';
import { ShortcutManager, Shortcuts } from 'react-shortcuts';
import { withStyles } from '@material-ui/core/styles';

// Shortcuts
const keymap = {
  GRAPH: {
    MOVE_UP: ['up', 'k'],
    MOVE_DOWN: ['down', 'j'],
    MOVE_LEFT: ['left', 'h'],
    MOVE_RIGHT: ['right', 'l'],
    ZOOM_IN: ['+'],
    ZOOM_OUT: ['-']
  }
};
const shortcutManager = new ShortcutManager(keymap);

const handleShortcuts = ({ cy }) => (action, event) => {
  event.preventDefault();
  switch (action) {
    case 'MOVE_UP':
      // TODO: Move viewport or graph?
      cy.panBy({ x: 0, y: -35 });
      break;
    case 'MOVE_DOWN':
      cy.panBy({ x: 0, y: 35 });
      break;
    case 'MOVE_LEFT':
      cy.panBy({ x: -35, y: 0 });
      break;
    case 'MOVE_RIGHT':
      cy.panBy({ x: 35, y: 0 });
      break;
    case 'ZOOM_IN':
      cy.zoom(cy.zoom() * (1 + 0.25));
      break;
    case 'ZOOM_OUT':
      cy.zoom(cy.zoom() * (1 - 0.25));
      break;
    default:
  }
};

const styles = {
  shortcuts: {
    height: '100%'
  }
};

const CytoscapeShortcutsProviderComp = ({
  classes,
  handleShortcuts,
  children
}) => (
  <Shortcuts
    name='GRAPH'
    handler={handleShortcuts}
    className={classes.shortcuts}
  >
    {children}
  </Shortcuts>
);

export default compose(
  setPropTypes({
    cy: PropTypes.object
  }),
  withContext(
    {
      shortcuts: PropTypes.object.isRequired
    },
    () => ({ shortcuts: shortcutManager })
  ),
  withHandlers({
    handleShortcuts
  }),
  withStyles(styles)
)(CytoscapeShortcutsProviderComp);
