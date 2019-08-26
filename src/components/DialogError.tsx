import React from 'react';
import { compose } from 'recompose';
import Typography from '@material-ui/core/Typography';
import { withStyles, WithStyles, createStyles, Theme } from '@material-ui/core';

const styles = (theme: Theme) =>
  createStyles({
    error: {
      padding: theme.spacing(3),

      backgroundColor: theme.palette.grey[200],

      marginBottom: theme.spacing(2),

      // Negeate dialog padding
      marginTop: -theme.spacing(3),
      marginLeft: -theme.spacing(3),
      marginRight: -theme.spacing(3)
    }
  });

const toErrorMessage = (error: any) => {
  if (error instanceof Error) {
    // @ts-ignore
    return (error.title ? error.title : '') + ' ' + error.message;
  }
  return JSON.stringify(error);
};

const DialogErrorComp = ({ classes, error }: IDialogErrorComp) => {
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

interface IDialogErrorComp extends WithStyles<typeof styles> {
  error: any;
}

export default compose<IDialogErrorComp, Omit<IDialogErrorComp, 'classes'>>(withStyles(styles))(DialogErrorComp);
