import React from 'react';
import {
  compose,
  withState,
  withHandlers,
  lifecycle,
  renameProp
} from 'recompose';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

const styles = theme => ({});

const ErrorSnackbarComp = ({ errorOpen, onErrorClose, error, classes }) => (
  <Snackbar
    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    open={errorOpen}
    onClose={onErrorClose}
    message={
      <div>
        <Typography variant='subheading' color='inherit'>
          {error && error.title}
        </Typography>
        <span id='message-id'>{error && error.message}</span>
      </div>
    }
    action={[
      <IconButton
        key='close'
        aria-label='Close'
        color='inherit'
        className={classes.close}
        onClick={onErrorClose}
      >
        <CloseIcon />
      </IconButton>
    ]}
  />
);

export default compose(
  withStyles(styles),
  withState('errorOpen', 'setErrorOpen', false),
  withState('error2', 'setError2', ({ error }) => error),
  withHandlers({
    onErrorClose: ({ setErrorOpen }) => (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
      setErrorOpen(false);
    }
  }),
  lifecycle({
    componentWillReceiveProps (nextProps) {
      if (!nextProps.error && nextProps.errorOpen) {
        nextProps.setErrorOpen(false);
      } else if (nextProps.error && nextProps.error !== this.props.error) {
        nextProps.setError2(nextProps.error);
        nextProps.setErrorOpen(true);
      }
    }
  }),
  renameProp('error2', 'error')
)(ErrorSnackbarComp);
