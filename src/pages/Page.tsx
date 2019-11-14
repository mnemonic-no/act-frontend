import React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { observer } from 'mobx-react';

import AppBar from '@material-ui/core/AppBar/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import AboutButton from '../components/About';
import LinearProgress from '@material-ui/core/LinearProgress';
import ErrorBoundary from '../components/ErrorBoundary';
import ErrorSnackbar, { IErrorSnackbarComp } from '../components/ErrorSnackbar';

const useStyles = makeStyles((theme: Theme) => {
  const appBarHeight = theme.spacing(8);
  return {
    root: {
      height: '100vh',
      zIndex: 1,
      overflow: 'hidden'
    },
    appFrame: {
      position: 'relative',
      display: 'flex',
      width: '100%',
      height: '100%'
    },
    appBar: {
      position: 'absolute',
      height: appBarHeight,
      width: '100%',

      // Make sure appbar is on top
      // Drawer z-index is 1200
      // Need to change strategy if we want other drawers to come on top
      zIndex: 1201
    },
    appBarLeft: {
      display: 'flex',
      flexGrow: 1
    },
    appBarLogo: {
      height: 46,
      maxWidth: 'none'
    },
    content: {
      marginTop: appBarHeight,
      width: '100%',
      height: `calc(100% - ${appBarHeight}px)`,
      position: 'relative'
    }
  };
});

const PageComp = (props: IPageComp) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.appFrame}>
        <div className={classes.appBar}>
          <AppBar position="static">
            <Toolbar>
              <div className={classes.appBarLeft}>
                <a href="/">
                  <img src="/act-logo-onDark.svg" alt="ACT" className={classes.appBarLogo} />
                </a>
              </div>
              <Button color="inherit" component="a" href="/examples">
                Examples
              </Button>
              <AboutButton />
            </Toolbar>
            {props.isLoading && <LinearProgress variant="query" color="secondary" />}
          </AppBar>
        </div>

        <div className={classes.content}>
          <ErrorBoundary>{props.children}</ErrorBoundary>
        </div>
      </div>

      <ErrorSnackbar {...props.errorSnackbar} />
    </div>
  );
};

export interface IPageComp {
  children: any;
  errorSnackbar: IErrorSnackbarComp;
  isLoading: boolean;
}

export default observer(PageComp);
