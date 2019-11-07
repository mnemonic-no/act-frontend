import React, { useState } from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import FilterCenterFocusIcon from '@material-ui/icons/FilterCenterFocus';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import List from '@material-ui/core/List';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import RemoveIcon from '@material-ui/icons/Remove';
import SettingsIcon from '@material-ui/icons/Settings';
import Switch from '@material-ui/core/Switch';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';

import CytoscapeLayout from '../pages/CytoscapeLayout/CytoscapeLayout';
import CytoscapeLayoutStore from '../pages/CytoscapeLayout/CytoscapeLayoutStore';

const useStyles = makeStyles((theme: Theme) => ({
  toolbar: {
    flexDirection: 'column'
  },
  toolbarButtonPaper: {
    marginTop: '8px'
  },
  button: {
    padding: '8px'
  },
  popperRoot: {
    marginRight: '10px',
    padding: theme.spacing(2),
    maxWidth: '350px',
    minWidth: '300px',
    overflowY: 'auto',
    maxHeight: '30vh'
  }
}));

const ConfigButton = ({ cytoscapeLayoutStore }: any) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [configOpen, setConfigOpen] = useState(false);

  return (
    <div
      ref={node => {
        setAnchorEl(node);
      }}>
      <Tooltip title="Graph settings" placement="top">
        <Paper className={classes.toolbarButtonPaper}>
          <IconButton className={classes.button} onClick={() => setConfigOpen(!configOpen)}>
            <SettingsIcon />
          </IconButton>
        </Paper>
      </Tooltip>
      <Popper disablePortal={true} container={anchorEl} open={configOpen} anchorEl={anchorEl} placement="left-end">
        <ClickAwayListener onClickAway={() => setConfigOpen(!configOpen)}>
          <Paper className={classes.popperRoot}>
            <List>
              <ListItem disableGutters>
                <ListItemText primary="Edges" secondary={'Show labels'} />
                <ListItemSecondaryAction>
                  <Switch
                    onClick={() => cytoscapeLayoutStore.toggleShowFactEdgeLabels()}
                    checked={cytoscapeLayoutStore.showFactEdgeLabels}
                  />
                </ListItemSecondaryAction>
              </ListItem>

              <CytoscapeLayout store={cytoscapeLayoutStore} />
            </List>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </div>
  );
};

const ToolbarComp = ({ onZoomIn, onZoomOut, onFit, onFocusOnSelection, cytoscapeLayoutStore }: IToolbarComp) => {
  const classes = useStyles();
  return (
    <Toolbar disableGutters classes={{ root: classes.toolbar }}>
      <ConfigButton cytoscapeLayoutStore={cytoscapeLayoutStore} />

      <Tooltip title="Focus on selection" placement="top">
        <Paper className={classes.toolbarButtonPaper}>
          <IconButton className={classes.button} onClick={onFocusOnSelection}>
            <FilterCenterFocusIcon />
          </IconButton>
        </Paper>
      </Tooltip>

      <Tooltip title="Fit" placement="top">
        <Paper className={classes.toolbarButtonPaper}>
          <IconButton className={classes.button} onClick={onFit}>
            <ZoomOutMapIcon />
          </IconButton>
        </Paper>
      </Tooltip>

      <Tooltip title="Zoom in" placement="top">
        <Paper className={classes.toolbarButtonPaper}>
          <IconButton className={classes.button} onClick={onZoomIn}>
            <AddIcon />
          </IconButton>
        </Paper>
      </Tooltip>

      <Tooltip title="Zoom out" placement="top">
        <Paper className={classes.toolbarButtonPaper}>
          <IconButton className={classes.button} onClick={onZoomOut}>
            <RemoveIcon />
          </IconButton>
        </Paper>
      </Tooltip>
    </Toolbar>
  );
};

interface IToolbarComp {
  cytoscapeLayoutStore: CytoscapeLayoutStore;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onFocusOnSelection: () => void;
}

export default ToolbarComp;
