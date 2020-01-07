import React from 'react';
import { observer } from 'mobx-react';
import cc from 'clsx';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Paper from '@material-ui/core/Paper';

import Content from './Content/Content';
import Details from './Details/Details';
import GraphEmpty from './GraphView/GraphEmpty';
import MainPageStore from './MainPageStore';
import Page from '../Page';
import RefineryOptions from './RefineryOptions/RefineryOptions';
import ShowHideButton from '../../components/ShowHideButton';
import WorkingHistory from './WorkingHistory/WorkingHistory';
import SearchByObjectType from './Search/SearchByObjectType';

const drawerWidth = 360;

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
      backgroundColor: theme.palette.grey['100']
    },
    content: {
      position: 'relative',
      overflow: 'hidden',
      flex: '1 1 100px',

      display: 'flex',
      flexDirection: 'column'
    }
  };
});

const useDrawerStyles = makeStyles((theme: Theme) => ({
  paper: {
    position: 'relative'
  },
  closed: {
    border: 0
  },
  docked: {
    overflowY: 'auto',
    maxWidth: drawerWidth + 'px',
    height: '100%'
  }
}));

const useSearchStyles = makeStyles((theme: Theme) => ({
  padding: {
    padding: theme.spacing(1.5)
  },
  paper: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1)
  }
}));

const MainPage = ({ store }: { store: MainPageStore }) => {
  const classes = useStyles();
  const drawerClasses = useDrawerStyles();
  const searchClasses = useSearchStyles();

  return (
    <Page errorSnackbar={store.errorSnackbar} isLoading={store.backendStore.isLoading} leftMenuItems={store.pageMenu}>
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
          <ShowHideButton
            isOpen={store.isSearchDrawerOpen}
            onClick={store.toggleSearchDrawer}
            attachedTo={'right'}
            placement={{ top: 52, right: '-48px' }}
          />
          <Drawer
            open={store.isSearchDrawerOpen}
            anchor="left"
            variant="permanent"
            classes={{
              paper: cc(drawerClasses.paper, classes.searchDrawerPaper, {
                [drawerClasses.closed]: !store.isSearchDrawerOpen
              }),
              docked: drawerClasses.docked
            }}>
            {store.isSearchDrawerOpen && (
              <>
                <Paper className={cc(searchClasses.paper, searchClasses.padding)}>
                  <SearchByObjectType store={store.ui.searchStore} />
                </Paper>
                <Paper className={searchClasses.paper}>
                  <WorkingHistory {...store.ui.workingHistoryStore.prepared} />
                </Paper>
                <Paper className={cc(searchClasses.paper, searchClasses.padding)}>
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
          <GraphEmpty navigateFn={(url: string) => store.appStore.goToUrl(url)} />
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
          <ShowHideButton
            isOpen={store.ui.detailsStore.isOpen}
            onClick={store.ui.detailsStore.toggle}
            attachedTo={'left'}
            placement={{ top: 7, left: '-48px' }}
          />

          <Drawer
            open={store.ui.detailsStore.isOpen}
            variant="permanent"
            anchor="right"
            classes={{
              paper: drawerClasses.paper,
              docked: drawerClasses.docked
            }}>
            {store.ui.detailsStore.isOpen && <Details store={store.ui.detailsStore} />}
          </Drawer>
        </div>
      </div>
    </Page>
  );
};

export default observer(MainPage);
