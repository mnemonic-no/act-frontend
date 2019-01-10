import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
  root: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing.unit * 12
  }
});
const CenteredLoadingCircleComp = ({ classes }) => (
  <div className={classes.root}>
    <CircularProgress />
  </div>
);

export default withStyles(styles)(CenteredLoadingCircleComp);
