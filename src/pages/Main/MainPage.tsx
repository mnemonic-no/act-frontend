import React from 'react';
import { observer } from 'mobx-react';
import cc from 'clsx';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import Paper from '@material-ui/core/Paper';

import Content from './Content/Content';
import Details from './Details/Details';
import GraphEmpty from './GraphView/GraphEmpty';
import MainPageStore from './MainPageStore';
import Page from '../Page';
import RefineryOptions from './RefineryOptions/RefineryOptions';
import Search from './Search/Search';
import WorkingHistory from './WorkingHistory/WorkingHistory';

const drawerWidth = 380;

const useStyles = makeStyles((theme: Theme) => {
  const enterTransition = theme.transitions.create(['all'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  });

  const leaveTransition = theme.transitions.create(['all'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  });

  return {
    mainFrame: {
      display: 'flex',
      width: '100%',
      height: '100%',
      position: 'relative'
    },

    sideContainer: {
      position: 'relative',
      overflow: 'visible',
      zIndex: 200,
      flexGrow: 0,
      flexShrink: 0
    },
    sideContainerOpen: {
      flexBasis: drawerWidth + 'px',
      transition: enterTransition
    },
    sideContainerClosed: {
      flexBasis: 0,
      transition: leaveTransition
    },
    searchDrawerPaper: {
      backgroundColor: '#FAFAFA'
    },

    content: {
      position: 'relative',
      overflow: 'hidden',
      flex: '1 0 300px',

      display: 'flex',
      flexDirection: 'column'
    },

    sideDrawerPaper: {
      position: 'relative'
    },
    sideDrawerDocked: {
      overflowY: 'auto',
      maxWidth: drawerWidth + 'px',
      height: '100%'
    },

    paper: {
      padding: theme.spacing(1.5),
      marginLeft: theme.spacing(1.5),
      marginRight: theme.spacing(1.5),
      marginTop: theme.spacing(1.5)
    },
    paperNoPadding: {
      marginLeft: theme.spacing(1.5),
      marginRight: theme.spacing(1.5),
      marginTop: theme.spacing(1.5)
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
      top: 56,
      right: '-48px'
    },
    toggleButtonLeft: {
      borderTopLeftRadius: '10px',
      borderBottomLeftRadius: '10px',
      borderWidth: '1px 0 1px 1px',
      top: 4,
      left: '-48px'
    }
  };
});

const MainPage = ({ store }: { store: MainPageStore }) => {
  const classes = useStyles();

  return (
    <Page errorSnackbar={store.errorSnackbar} isLoading={store.backendStore.isLoading}>
      <div className={classes.mainFrame}>
        {/* Search container */}
        <div
          data-container-id="searchContainer"
          onTransitionEnd={(event: any) => {
            if (event.target.getAttribute('data-container-id') === 'searchContainer') {
              store.ui.graphViewStore.rerender();
            }
          }}
          className={cc(classes.sideContainer, {
            [classes.sideContainerOpen]: store.isSearchDrawerOpen,
            [classes.sideContainerClosed]: !store.isSearchDrawerOpen
          })}>
          <div className={cc(classes.toggleButton, classes.toggleButtonRight)}>
            <IconButton onClick={store.toggleSearchDrawer}>
              {store.isSearchDrawerOpen ? <KeyboardArrowLeftIcon /> : <KeyboardArrowRightIcon />}
            </IconButton>
          </div>

          <Drawer
            open={store.isSearchDrawerOpen}
            anchor="left"
            variant="permanent"
            classes={{
              paper: cc(classes.sideDrawerPaper, classes.searchDrawerPaper),
              docked: classes.sideDrawerDocked
            }}>
            {store.isSearchDrawerOpen && (
              <>
                <Paper className={classes.paper}>
                  <Search store={store.ui.searchStore} />
                </Paper>

                <Paper className={classes.paperNoPadding}>
                  <WorkingHistory {...store.ui.workingHistoryStore.prepared} />
                </Paper>

                <Paper className={classes.paper}>
                  <RefineryOptions store={store.ui.refineryOptionsStore} />
                </Paper>
              </>
            )}
          </Drawer>
        </div>

        {/* Content */}
        {store.hasContent ? (
          <Content {...store.ui.contentStore.prepared} rootClass={classes.content} />
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
          className={cc(classes.sideContainer, {
            [classes.sideContainerOpen]: store.ui.detailsStore.isOpen,
            [classes.sideContainerClosed]: !store.ui.detailsStore.isOpen
          })}>
          <div className={cc(classes.toggleButton, classes.toggleButtonLeft)}>
            <IconButton onClick={store.ui.detailsStore.toggle}>
              {store.ui.detailsStore.isOpen ? <KeyboardArrowRightIcon /> : <KeyboardArrowLeftIcon />}
            </IconButton>
          </div>

          <Drawer
            open={store.ui.detailsStore.isOpen}
            variant="permanent"
            anchor="right"
            classes={{
              paper: classes.sideDrawerPaper,
              docked: classes.sideDrawerDocked
            }}>
            {store.ui.detailsStore.isOpen && <Details store={store.ui.detailsStore} />}
          </Drawer>
        </div>
      </div>
    </Page>
  );
};

export default observer(MainPage);
