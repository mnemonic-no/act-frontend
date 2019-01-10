import React from 'react';
import { compose } from 'recompose';
import { withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

const styles = theme => ({
  loadingOverlay: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    zIndex: 100,

    // Negeate dialog padding
    marginTop: -theme.spacing.unit * 3,
    marginLeft: -theme.spacing.unit * 3
  },
  loadingChild: {
    zIndex: 101
  }
});

const DialogLoadingOverlayComp = ({ classes }) => (
  <div className={classes.loadingOverlay}>
    <LinearProgress className={classes.loadingChild} color='secondary' />
  </div>
);

export default compose(withStyles(styles))(DialogLoadingOverlayComp);
