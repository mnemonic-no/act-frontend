import React from 'react';
import { compose } from 'recompose';
import LinearProgress from '@material-ui/core/LinearProgress';
import { withStyles, WithStyles, createStyles, Theme } from '@material-ui/core';

const styles = (theme: Theme) =>
  createStyles({
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
  });

const DialogLoadingOverlayComp = ({ classes }: IDialogLoadingOverlayComp) => (
  <div className={classes.loadingOverlay}>
    <LinearProgress className={classes.loadingChild} color="secondary" />
  </div>
);

interface IDialogLoadingOverlayComp extends WithStyles<typeof styles> {}

export default compose<IDialogLoadingOverlayComp, {}>(withStyles(styles))(DialogLoadingOverlayComp);
