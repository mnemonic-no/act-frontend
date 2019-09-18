import React from 'react';
import { observer } from 'mobx-react';
import {
  AppBar,
  Button,
  Drawer,
  IconButton,
  LinearProgress,
  makeStyles,
  Paper,
  Theme,
  Toolbar
} from '@material-ui/core';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';

import AboutButton from '../components/About';
import CytoscapeLayout from './CytoscapeLayout/CytoscapeLayout';
import ErrorSnackbar from '../components/ErrorSnackbar';
import ErrorBoundary from '../components/ErrorBoundary';
import GraphEmpty from './GraphView/GraphEmpty';
import MainPageStore from './MainPageStore';
import Details from './Details/Details';
import WorkingHistory from './WorkingHistory/WorkingHistory';
import RefineryOptions from './RefineryOptions/RefineryOptions';
import Search from './Search/Search';
import Content from './Content';

const drawerWidth = 380;
const detailsDrawerWidth = 360;

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
    mainFrame: {
      display: 'flex',
      width: '100%'
    },

    errorBoundary: {
      marginTop: appBarHeight
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

    searchContainer: {
      position: 'relative',
      overflow: 'visible',
      zIndex: 200,
      flexGrow: 0,
      flexShrink: 0
    },
    searchContainerOpen: {
      flexBasis: drawerWidth + 'px',
      transition: theme.transitions.create('flex-basis', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    searchContainerClosed: {
      flexBasis: 0,
      transition: theme.transitions.create('flex-basis', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      })
    },
    searchDrawerDocked: {
      overflowY: 'auto',
      maxWidth: drawerWidth + 'px',
      height: '100%'
    },
    searchDrawerPaper: {
      position: 'relative',
      marginTop: appBarHeight,
      height: `calc(100% - ${appBarHeight}px)`,
      backgroundColor: '#FAFAFA'
    },
    content: {
      position: 'relative',
      marginTop: appBarHeight,
      height: `calc(100% - ${appBarHeight}px)`,

      overflow: 'hidden',
      flex: '1 0 300px',

      display: 'flex',
      flexDirection: 'column'
    },

    detailsContainer: {
      position: 'relative',
      overflow: 'visible',
      zIndex: 200,
      flexGrow: 0,
      flexShrink: 0
    },
    detailsContainerOpen: {
      flexBasis: detailsDrawerWidth + 'px',
      transition: theme.transitions.create('flex-basis', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.shortest
      })
    },
    detailsContainerClosed: {
      flexBasis: 0,
      transition: theme.transitions.create('flex-basis', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      })
    },
    detailsDrawerPaper: {
      marginTop: appBarHeight,
      width: detailsDrawerWidth + 'px',
      height: `calc(100% - ${appBarHeight}px)`
    },
    detailsDrawerPaperOpen: {
      width: detailsDrawerWidth + 'px'
    },
    detailsDrawerPaperClosed: {
      width: 0
    },

    paper: {
      padding: theme.spacing(2),
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
      marginTop: theme.spacing(2)
    },
    paperNoPadding: {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
      marginTop: theme.spacing(2)
    },

    toggleButton: {
      background: theme.palette.common.white,
      borderColor: theme.palette.divider,
      borderStyle: 'solid',
      position: 'absolute',
      zIndex: 99999
    },
    toggleButtonRight: {
      borderTopRightRadius: '10px',
      borderBottomRightRadius: '10px',
      borderWidth: '1px 1px 1px 0',
      top: appBarHeight + 56,
      right: '-48px'
    },
    toggleButtonLeft: {
      borderTopLeftRadius: '10px',
      borderBottomLeftRadius: '10px',
      borderWidth: '1px 0 1px 1px',
      top: appBarHeight + 4,
      left: '-48px'
    }
  };
});

const store = new MainPageStore();
store.initByUrl(window.location);

const MainPage = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.appFrame}>
        {/* Header */}
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
            {store.backendStore.isLoading && <LinearProgress variant="query" color="secondary" />}
          </AppBar>
        </div>

        <ErrorBoundary className={classes.errorBoundary}>
          <div className={classes.mainFrame}>
            {/* Search container */}
            <div
              data-container-id="searchContainer"
              onTransitionEnd={(event: any) => {
                if (event.target.getAttribute('data-container-id') === 'searchContainer') {
                  store.ui.graphViewStore.rerender();
                }
              }}
              className={`${classes.searchContainer} ${
                store.isSearchDrawerOpen ? classes.searchContainerOpen : classes.searchContainerClosed
              }`}>
              <div className={`${classes.toggleButton} ${classes.toggleButtonRight}`}>
                <IconButton onClick={store.toggleSearchDrawer}>
                  {store.isSearchDrawerOpen ? <KeyboardArrowLeftIcon /> : <KeyboardArrowRightIcon />}
                </IconButton>
              </div>

              <Drawer
                open={store.isSearchDrawerOpen}
                anchor="left"
                variant="permanent"
                classes={{
                  paper: classes.searchDrawerPaper,
                  docked: classes.searchDrawerDocked
                }}>
                {store.isSearchDrawerOpen && (
                  <>
                    <Paper className={classes.paper}>
                      <Search store={store.ui.searchStore} />
                    </Paper>

                    <Paper className={classes.paperNoPadding}>
                      <WorkingHistory store={store.ui.workingHistoryStore} />
                    </Paper>

                    <Paper className={classes.paper}>
                      <CytoscapeLayout store={store.ui.cytoscapeLayoutStore} />
                    </Paper>

                    <Paper className={classes.paper}>
                      <RefineryOptions store={store.ui.refineryOptionsStore} />
                    </Paper>
                  </>
                )}
              </Drawer>
            </div>

            {/* Content */}
            {!store.workingHistory.isEmpty ? (
              <Content {...store.content} rootClass={classes.content} />
            ) : (
              <GraphEmpty />
            )}

            {/* Details drawer */}
            <div
              data-container-id="detailsContainer"
              onTransitionEnd={(event: any) => {
                if (event.target.getAttribute('data-container-id') === 'detailsContainer') {
                  store.ui.graphViewStore.rerender();
                }
              }}
              className={`${classes.detailsContainer} ${
                store.ui.detailsStore.isOpen ? classes.detailsContainerOpen : classes.detailsContainerClosed
              }`}>
              <div className={`${classes.toggleButton} ${classes.toggleButtonLeft}`}>
                <IconButton onClick={store.ui.detailsStore.toggle}>
                  {store.ui.detailsStore.isOpen ? <KeyboardArrowRightIcon /> : <KeyboardArrowLeftIcon />}
                </IconButton>
              </div>

              <Drawer
                open={store.ui.detailsStore.isOpen}
                variant="permanent"
                anchor="right"
                classes={{
                  paper: `${classes.detailsDrawerPaper} ${
                    store.ui.detailsStore.isOpen ? classes.detailsDrawerPaperOpen : classes.detailsDrawerPaperClosed
                  }`
                }}>
                <Details store={store.ui.detailsStore} />
              </Drawer>
            </div>
          </div>
        </ErrorBoundary>
      </div>

      <ErrorSnackbar {...store.errorSnackbar} />
    </div>
  );
};

export default observer(MainPage);
