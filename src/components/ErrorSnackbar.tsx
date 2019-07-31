import React from 'react'
import {compose} from 'recompose'
import {createStyles, Theme, WithStyles, withStyles} from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import {observer} from "mobx-react";

const styles = (theme: Theme) => createStyles({
    close: {},
    errorMessage: {wordBreak: "break-all"}
});

const ErrorSnackbarComp = ({error, onClose, classes}: IErrorSnackbarComp) =>
    <Snackbar
        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
        open={error !== null}
        onClose={onClose}
        ClickAwayListenerProps={{onClickAway: onClose}}
        message={
            <div>
                <Typography variant='subtitle1' color='inherit'>
                    {error && error.title}
                </Typography>
                <div id='message-id' className={classes.errorMessage}>{error && error.message}</div>
            </div>
        }
        action={[
            <IconButton
                key='close'
                aria-label='Close'
                color='inherit'
                className={classes.close}
                onClick={onClose}>
                <CloseIcon/>
            </IconButton>
        ]}
    />;

interface IErrorSnackbarComp extends WithStyles<typeof styles> {
    error: any
    onClose: () => void
}

export default compose<IErrorSnackbarComp, Pick<IErrorSnackbarComp, Exclude<keyof IErrorSnackbarComp, "classes">>>(
    withStyles(styles),
    observer
)(ErrorSnackbarComp)
