import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Toolbar from '@material-ui/core/Toolbar';
import {createStyles, WithStyles, withStyles} from '@material-ui/core/styles';
import FilterCenterFocusIcon from '@material-ui/icons/FilterCenterFocus';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import Paper from '@material-ui/core/Paper';
import {Theme} from "@material-ui/core";

const styles = (theme: Theme) => createStyles({
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
});

const ToolbarComp = ({ classes, onZoomIn, onZoomOut, onFit, onFocusOnSelection } : IToolbarComp) => (
  <Toolbar
    disableGutters
    classes={{ root: classes.toolbar }}
    className={classes.toolbarPosition}>
    <Tooltip title='Focus on selection' placement='top'>
      <Paper className={classes.toolbarButtonPaper}>
        <IconButton onClick={onFocusOnSelection}>
          <FilterCenterFocusIcon />
        </IconButton>
      </Paper>
    </Tooltip>

    <Tooltip title='Fit' placement='top'>
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

interface IToolbarComp extends WithStyles<typeof styles> {
    onZoomIn : () => void,
    onZoomOut: () => void,
    onFit : () => void,
    onFocusOnSelection : () => void
}

export default withStyles(styles)(ToolbarComp);
