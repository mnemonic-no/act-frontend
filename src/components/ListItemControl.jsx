// Helper function
import React from 'react';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    flex: '0 0 auto',
    height: theme.spacing.unit * 6,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: theme.spacing.unit * 12
  }
});

const ListItemControlComp = ({ classes, children }) => <div className={classes.root}>{children}</div>;

export default withStyles(styles)(ListItemControlComp);
