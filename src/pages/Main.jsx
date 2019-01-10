import React from 'react';
import {
  shallowEqual,
  compose,
  withState,
  withHandlers,
  branch,
  lifecycle,
  withProps
} from 'recompose';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import LinearProgress from '@material-ui/core/LinearProgress';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import { observer } from 'mobx-react';
import classNames from 'classnames';

import {
  searchCriteriadataLoader,
  autoResolveDataLoader
} from '../core/dataLoaders';
import withDataLoader, { chainDataLoaders } from '../util/withDataLoader';
import GraphView from './GraphView';
import GraphEmpty from './GraphEmpty';
import SearchForm from '../components/SearchForm';
import DataOptions from '../components/DataOptions';
import GraphOptions from '../components/GraphOptions';
import LayoutOptions from '../components/LayoutOptions';
import ErrorSnackbar from '../components/ErrorSnackbar';
import dataState, { Data } from '../state/data';
import dataFetching from '../state/dataFetching';
import graphInformation from '../state/graphInformation';
import GraphInformation from '../components/GraphInformation';
import { AboutButton } from '../components/About';
import DataNavigation from '../components/DataNavigation';

const drawerWidth = 360;
const infoDrawerWidth = 360;

const styles = theme => {
  const appBarHeight = theme.spacing.unit * 8;
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
      // Drawer z-index is 1301
      // Need to change strategy if we want other drawers to come on top
      zIndex: 1301
    },
    appBarLeft: {
      display: 'flex',
      flexGrow: 1
    },
    appBarLogo: {
      height: 46,
      maxWidth: 'none'
    },

    drawerDocked: {},
    drawerPaper: {
      position: 'relative',
      marginTop: appBarHeight,
      height: `calc(100% - ${appBarHeight}px)`,
      width: drawerWidth,
      backgroundColor: '#FAFAFA'
    },
    content: {
      position: 'relative',
      marginTop: appBarHeight,
      height: `calc(100% - ${appBarHeight}px)`,
      width: '100%',

      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      })
    },

    infoDrawerDocked: {},
    infoDrawerPaper: {
      position: 'relative',
      marginTop: appBarHeight,
      height: `calc(100% - ${appBarHeight}px)`,
      width: infoDrawerWidth
    },

    //
    paper: {
      padding: theme.spacing.unit * 2,
      marginLeft: theme.spacing.unit * 2,
      marginRight: theme.spacing.unit * 2,
      marginTop: theme.spacing.unit * 2
    },
    paperNoPadding: {
      marginLeft: theme.spacing.unit * 2,
      marginRight: theme.spacing.unit * 2,
      marginTop: theme.spacing.unit * 2
    }
  };
};

const Main = ({
  classes,
  onSearchSubmit,
  dataState,
  onClearData,
  isLoading,
  error,
  errorOpen,
  onErrorClose,
  onNodeClick,
  onNodeCtxClick,
  searchCriteria,
  graphInformation,
  dataFetching
}) => (
  <div className={classes.root}>
    <div className={classes.appFrame}>
      {/* Header */}
      <div className={classes.appBar}>
        <AppBar position='static'>
          <Toolbar>
            <div className={classes.appBarLeft}>
              <a href='/' alt='home'>
                <img
                  src='/act-logo-onDark.svg'
                  alt='ACT'
                  className={classes.appBarLogo}
                />
              </a>
            </div>
            <Button color='inherit' component='a' href='/examples'>
              Examples
            </Button>
            <AboutButton />
          </Toolbar>
          {(isLoading || dataFetching.isLoading) && (
            <LinearProgress mode='query' color='secondary' />
          )}
        </AppBar>
      </div>

      {/* Drawer */}
      <Drawer
        variant='permanent'
        classes={{ paper: classes.drawerPaper, docked: classes.drawerDocked }}
      >
        {/* Search Form */}
        <Paper className={classes.paper}>
          <SearchForm
            onSubmit={onSearchSubmit}
            initialFields={searchCriteria}
            onClearData={onClearData}
          />
        </Paper>

        {/* Data navigation */}
        {!dataState.isEmpty && (
          <Paper className={classes.paperNoPadding}>
            {/* <pre style={{ overflowY: 'scroll' }}>
              {JSON.stringify(dataState.current.searchHistory, undefined, 2)}
            </pre> */}
            <DataNavigation />
          </Paper>
        )}

        {/* View options */}
        <Paper className={classes.paper}>{<LayoutOptions />}</Paper>

        <Paper className={classes.paper}>
          <GraphOptions />
          <Divider />
          <DataOptions />
        </Paper>
      </Drawer>

      {/* Graph */}
      <main className={classNames(classes.content)}>
        {!dataState.isEmpty && (
          <GraphView
            {...{
              onNodeClick,
              onNodeCtxClick
            }}
          />
        )}
        {dataState.isEmpty && <GraphEmpty />}
      </main>

      {/* Info drawer */}
      {!dataState.isEmpty && (
        <Drawer
          variant='permanent'
          anchor='right'
          classes={{
            paper: classes.infoDrawerPaper,
            docked: classes.infoDrawerDocked
          }}
        >
          <GraphInformation {...{ onSearchSubmit }} />
        </Drawer>
      )}
    </div>
    {/* Error */}
    <ErrorSnackbar {...{ error }} />
  </div>
);

export default compose(
  withRouter,
  withStyles(styles),

  // API
  withState('searchCriteria', 'setSearchCriteria', ({ match }) => {
    const uriDecoded = {
      objectType: match.params.objectType
        ? decodeURIComponent(match.params.objectType)
        : undefined,
      objectValue: match.params.objectValue
        ? decodeURIComponent(match.params.objectValue)
        : undefined,
      query: match.params.query
        ? decodeURIComponent(match.params.query)
        : undefined
    };
    const { objectType, objectValue, query } = uriDecoded;
    if (objectType && objectValue && query) {
      return { objectType, objectValue, query };
    } else if (objectType && objectValue) {
      return { objectType, objectValue };
    }
    return null;
  }),
  withProps({ graphInformation }),
  withHandlers({
    onSearchSubmit: ({
      setSearchCriteria,
      searchCriteria,
      history,
      graphInformation
    }) => fields => {
      // Update search criteria and location.
      // Make it a new object every time to force a new update
      let { objectType, objectValue, query } = fields;
      objectType = objectType && objectType.trim();
      objectValue = objectValue && objectValue.trim();
      query = query && query.trim();

      if (objectType && objectValue && query) {
        setSearchCriteria({ objectType, objectValue, query });
        history.push(
          `/gremlin/${encodeURIComponent(objectType)}/${encodeURIComponent(
            objectValue
          )}/${encodeURIComponent(query)}`
        );
      } else if (objectType && objectValue) {
        setSearchCriteria({ objectType, objectValue });
        history.push(
          `/object-fact-query/${encodeURIComponent(
            objectType
          )}/${encodeURIComponent(objectValue)}`
        );
      }
    },
    onUUIDSearch: ({ setSearchCriteria }) => uuid => {
      setSearchCriteria({ uuid });
    }
  }),
  withHandlers({
    onNodeClick: ({ setSearchCriteria }) => node => {
      // More verbose when using name and type
      // Could perhaps do the search with uuid, and also save name and type
      setSearchCriteria({
        objectType: node.data('type'),
        objectValue: node.data('value')
      });
    }
  }),

  // DataLoading, since we're using branch, everything under here will remount after withDataLoader is rendered.
  branch(
    ({ searchCriteria }) => Boolean(searchCriteria),
    compose(
      withDataLoader(
        chainDataLoaders(searchCriteriadataLoader, autoResolveDataLoader),
        {
          shouldLoadData: (props, nextProps) =>
            props.searchCriteria !== nextProps.searchCriteria
        }
      )
    )
  ),

  // DATA STATE
  withProps({ dataState, dataFetching, graphInformation }),
  observer,
  lifecycle({
    componentWillReceiveProps (nextProps) {
      if (!nextProps.data || nextProps.data === this.props.data) return;

      // Disregard if search is same as before
      // TODO: Optimize by not searching at all...
      if (
        nextProps.dataState.current.searchHistory.some(history =>
          shallowEqual(nextProps.searchCriteria, history)
        )
      ) {
        return;
      }
      const data = new Data(nextProps.data);
      nextProps.dataState.addNode({
        data,
        search: nextProps.searchCriteria
      });

      // Select the searched object (can't do that on gremlin queries)
      if (!nextProps.searchCriteria.query) {
        const searchedNode = data.objectsData.find(
          object =>
            object.type.name === nextProps.searchCriteria.objectType &&
            object.value === nextProps.searchCriteria.objectValue
        );
        if (searchedNode) {
          nextProps.graphInformation.setSelectedNode({
            id: searchedNode.id,
            type: 'object'
          });
        }
      }
    }
  }),
  observer,
  withHandlers({
    onClearData: ({ onClear, dataState, history }) => () => {
      if (typeof onClear === 'function') {
        onClear();
      }
      dataState.clear();
      history.push('/');
    },
    onNodeCtxClick: ({ graphInformation }) => node => {
      graphInformation.setSelectedNode({
        id: node.data('isFact') ? node.data('factId') : node.id(),
        type: node.data('isFact') ? 'fact' : 'object'
      });
    }
  }),
  observer
)(Main);
