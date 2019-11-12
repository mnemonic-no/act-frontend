import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Theme, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing(12)
  }
}));

const CenteredLoadingCircleComp = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CircularProgress />
    </div>
  );
};

export default CenteredLoadingCircleComp;
