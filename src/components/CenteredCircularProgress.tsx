import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles, WithStyles, createStyles, Theme } from '@material-ui/core';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: theme.spacing.unit * 12
    }
  });

const CenteredLoadingCircleComp = ({ classes }: WithStyles<typeof styles>) => (
  <div className={classes.root}>
    <CircularProgress />
  </div>
);

export default withStyles(styles)(CenteredLoadingCircleComp);
