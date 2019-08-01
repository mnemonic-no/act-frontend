// Helper function
import React from 'react';
import { withStyles, WithStyles, createStyles, Theme } from '@material-ui/core';

const styles = (theme: Theme) =>
  createStyles({
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

const ListItemControlComp = ({ classes, children }: WithStyles<typeof styles> & { children: any }) => (
  <div className={classes.root}>{children}</div>
);

export default withStyles(styles)(ListItemControlComp);
