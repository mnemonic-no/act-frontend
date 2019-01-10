import React from 'react';
import { compose } from 'recompose';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  error: {
    padding: theme.spacing.unit * 3,

    backgroundColor: theme.palette.grey[200],

    marginBottom: theme.spacing.unit * 2,

    // Negeate dialog padding
    marginTop: -theme.spacing.unit * 3,
    marginLeft: -theme.spacing.unit * 3,
    marginRight: -theme.spacing.unit * 3
  }
});

const DialogErrorComp = ({ classes, error }) => (
  <div className={classes.error}>
    <Typography color='error' variant='body2'>
      Something went wrong
    </Typography>
    <Typography component='pre' color='error' style={{ fontSize: 10 }}>
      {JSON.stringify(error, 0, 2)}
    </Typography>
  </div>
);

export default compose(withStyles(styles))(DialogErrorComp);
