import React from 'react';
import { IconButton, makeStyles, Paper, Theme, Tooltip, Toolbar } from '@material-ui/core';
import FilterCenterFocusIcon from '@material-ui/icons/FilterCenterFocus';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

const useStyles = makeStyles((theme: Theme) => ({
  toolbar: {
    flexDirection: 'column'
  },
  toolbarPosition: {
    position: 'absolute',
    bottom: '48px',
    right: '48px'
  },
  toolbarButtonPaper: {
    marginTop: '10px'
  },

  gmToolbarPosition: {
    position: 'absolute',
    bottom: '33px',
    right: '20px'
  },
  gmPaperMargin: {
    marginTop: '3px'
  },
  gmPaperSize: {
    height: '29px',
    width: '29px'
  },
  gmIconSize: {
    height: '15px',
    width: '15px'
  }
}));

const ToolbarComp = ({ onZoomIn, onZoomOut, onFit, onFocusOnSelection }: IToolbarComp) => {
  const classes = useStyles();
  return (
    <Toolbar disableGutters classes={{ root: classes.toolbar }} className={classes.toolbarPosition}>
      <Tooltip title="Focus on selection" placement="top">
        <Paper className={classes.toolbarButtonPaper}>
          <IconButton onClick={onFocusOnSelection}>
            <FilterCenterFocusIcon />
          </IconButton>
        </Paper>
      </Tooltip>

      <Tooltip title="Fit" placement="top">
        <Paper className={classes.toolbarButtonPaper}>
          <IconButton onClick={onFit}>
            <ZoomOutMapIcon />
          </IconButton>
        </Paper>
      </Tooltip>

      <Paper className={classes.toolbarButtonPaper}>
        <IconButton onClick={onZoomIn}>
          <AddIcon />
        </IconButton>
      </Paper>

      <Paper className={classes.toolbarButtonPaper}>
        <IconButton onClick={onZoomOut}>
          <RemoveIcon />
        </IconButton>
      </Paper>
    </Toolbar>
  );
};

interface IToolbarComp {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onFocusOnSelection: () => void;
}

export default ToolbarComp;
