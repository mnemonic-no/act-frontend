import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme: Theme) => ({
  close: {},
  errorMessage: { wordBreak: 'break-all' }
}));

const ErrorSnackbarComp = ({ error, onClose }: IErrorSnackbarComp) => {
  const classes = useStyles();
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={error !== null}
      onClose={onClose}
      ClickAwayListenerProps={{ onClickAway: onClose }}
      message={
        <div>
          <Typography variant="subtitle1" color="inherit">
            {error && error.title}
          </Typography>
          <div id="message-id" className={classes.errorMessage}>
            {error && error.message}
          </div>
        </div>
      }
      action={[
        <IconButton key="close" aria-label="Close" color="inherit" className={classes.close} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ]}
    />
  );
};

export interface IErrorSnackbarComp {
  error: any;
  onClose: () => void;
}

export default observer(ErrorSnackbarComp);
