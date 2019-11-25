import React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { observer } from 'mobx-react';
import AppBar from '@material-ui/core/AppBar/AppBar';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import SearchIcon from '@material-ui/icons/Search';
import TimelineIcon from '@material-ui/icons/Timeline';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';

import AboutButton from '../components/About';
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
    contentArea: {
      marginTop: appBarHeight,
      width: '100%',
      height: `calc(100% - ${appBarHeight}px)`,
      display: 'flex',
      flexFlow: 'row nowrap'
    },

    leftMenu: {
      flex: '0 0 50px',
      borderRight: '1px solid ' + theme.palette.divider
    },

    content: {
      flex: '1 0 0',
      overflow: 'auto',
      display: 'flex',
      flexFlow: 'column nowrap'
    }
  };
});

const useLeftMenuStyles = makeStyles(() => ({
  root: { paddingTop: '8px' }
}));

export type TMenuButton = {
  text: string;
  tooltip: string;
  icon: 'graph' | 'search';
  isActive: boolean;
  onClick: () => void;
};

const MenuIcon = (props: { icon: 'graph' | 'search' }) => {
  if (props.icon === 'graph') return <TimelineIcon />;
  if (props.icon === 'search') return <SearchIcon />;
  return <TimelineIcon />;
};

const LeftMenuComp = (props: { items: Array<TMenuButton> }) => {
  const classes = useLeftMenuStyles();

  return (
    <div className={classes.root}>
      <List>
        {props.items.map(b => {
          return (
            <Tooltip key={b.icon} title={b.tooltip} enterDelay={500}>
              <ListItem button selected={b.isActive} onClick={b.onClick}>
                <MenuIcon icon={b.icon} />
              </ListItem>
            </Tooltip>
          );
        })}
      </List>
    </div>
  );
};

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

        <div className={classes.contentArea}>
          <div className={classes.leftMenu}>
            <LeftMenuComp items={props.leftMenuItems} />
          </div>

          <div className={classes.content}>
            <ErrorBoundary>{props.children}</ErrorBoundary>
          </div>
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
  leftMenuItems: Array<any>;
}

export default observer(PageComp);
