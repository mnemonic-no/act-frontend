import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Toolbar from '@material-ui/core/Toolbar';
import { withStyles } from '@material-ui/core/styles';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import Paper from '@material-ui/core/Paper';

const styles = theme => ({
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

const ToolbarComp = ({ classes, onZoomIn, onZoomOut, onFit }) => (
  <Toolbar
    disableGutters
    classes={{ root: classes.toolbar }}
    className={classes.toolbarPosition}>
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

export default withStyles(styles)(ToolbarComp);
