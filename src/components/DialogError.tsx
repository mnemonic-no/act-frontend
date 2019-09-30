import React from 'react';
import { makeStyles, Theme, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  error: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.grey[200],

    marginBottom: theme.spacing(2),
    // Negate dialog padding
    marginTop: -theme.spacing(3),
    marginLeft: -theme.spacing(3),
    marginRight: -theme.spacing(3)
  }
}));

const toErrorMessage = (error: any) => {
  if (error instanceof Error) {
    // @ts-ignore
    return (error.title ? error.title : '') + ' ' + error.message;
  }
  return JSON.stringify(error);
};

const DialogErrorComp = ({ error }: IDialogErrorComp) => {
  const classes = useStyles();
  return (
    <div className={classes.error}>
      <Typography color="error" variant="body1">
        Something went wrong
      </Typography>
      <Typography component="pre" color="error" style={{ fontSize: 10 }}>
        {toErrorMessage(error)}
      </Typography>
    </div>
  );
};

interface IDialogErrorComp {
  error: any;
}

export default DialogErrorComp;
