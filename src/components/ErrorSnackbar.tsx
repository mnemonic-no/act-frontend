import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme: Theme) => ({
  close: {},
  errorMessage: { wordBreak: 'break-all' }
}));

const ErrorSnackbarComp = ({ errorEvent, onClose }: IErrorSnackbarProps) => {
  const classes = useStyles();
  if (!errorEvent) return null;
  const { error } = errorEvent;

  // @ts-ignore
  const title = errorEvent.title || error.title;
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={errorEvent.error !== null}
      onClose={onClose}
      ClickAwayListenerProps={{ onClickAway: onClose }}
      message={
        <div>
          <Typography variant="subtitle1" color="inherit">
            {title}
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

export interface IErrorSnackbarProps {
  errorEvent: { title?: string; error: Error } | null;
  onClose: () => void;
}

export default observer(ErrorSnackbarComp);
