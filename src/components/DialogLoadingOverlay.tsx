import React from 'react';
import { LinearProgress, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  loadingOverlay: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    zIndex: 100,

    // Negeate dialog padding
    marginTop: -theme.spacing(3),
    marginLeft: -theme.spacing(3)
  },
  loadingChild: {
    zIndex: 101
  }
}));

const DialogLoadingOverlayComp = () => {
  const classes = useStyles();

  return (
    <div className={classes.loadingOverlay}>
      <LinearProgress className={classes.loadingChild} color="secondary" />
    </div>
  );
};

export default DialogLoadingOverlayComp;
