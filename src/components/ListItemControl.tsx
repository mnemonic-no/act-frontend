import React from 'react';
import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flex: '0 0 auto',
    height: theme.spacing(6),
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: theme.spacing(12)
  }
}));

const ListItemControlComp = ({ children }: { children: any }) => {
  const classes = useStyles();
  return <div className={classes.root}>{children}</div>;
};

export default ListItemControlComp;
