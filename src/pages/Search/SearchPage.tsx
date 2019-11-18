import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

import ActObjectAutoSuggest, { IActObjectAutoSuggestComp } from '../../components/ActObjectAutoSuggest';
import Details from './Details/Details';
import HistoryButton from './HistoryButton';
import Page from '../Page';
import Results from './Results/Results';
import SearchPageStore from './SearchPageStore';

const useSearchOnlyStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    height: '100%',
    flexFlow: 'column nowrap',
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchContainer: {
    flex: '1 0 auto',
    padding: '20px'
  },
  spacer: {
    flex: '0 10 30%'
  },
  logo: {
    width: 512
  }
}));

const useResultStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'column nowrap',
    height: '100%',
    backgroundColor: theme.palette.grey['100']
  },
  searchContainer: {
    padding: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '10px 10px 0 10px'
  },
  searchInput: {
    flex: '1 0 auto',
    paddingRight: theme.spacing(2)
  },
  resultsContainer: {
    display: 'flex',
    margin: '10px',
    height: '100%'
  },
  results: {
    flex: '1 1 50%',
    overflowX: 'auto'
  },
  details: {
    flex: '1 1 50%',
    display: 'flex',
    borderLeft: '1px solid',
    borderColor: theme.palette.grey['200']
  }
}));

const SearchOnly = (props: {
  searchInput: Omit<IActObjectAutoSuggestComp, 'fullWidth' | 'required' | 'helperText' | 'placeholder'>;
  onSearch: () => void;
}) => {
  const classes = useSearchOnlyStyles();

  return (
    <div className={classes.root}>
      <div className={classes.spacer} />
      <div className={classes.searchContainer}>
        <img className={classes.logo} src="/act-logo-onWhite.svg" alt="ACT | The Open Threat Intelligence Platform" />
        <form
          onSubmit={e => {
            e.preventDefault();
            props.onSearch();
          }}>
          <ActObjectAutoSuggest {...props.searchInput} fullWidth required placeholder="Search for objects" />
        </form>
      </div>
    </div>
  );
};

const SearchWithResults = observer(({ store }: { store: SearchPageStore }) => {
  const classes = useResultStyles();

  const { searchInput, searchHistoryItems, onSearch } = store.prepared;

  return (
    <div className={classes.root}>
      <Paper className={classes.searchContainer}>
        <div className={classes.searchInput}>
          <form
            onSubmit={e => {
              e.preventDefault();
              onSearch();
            }}>
            <ActObjectAutoSuggest {...searchInput} fullWidth required placeholder="Search for objects" />
          </form>
        </div>
        <HistoryButton historyItems={searchHistoryItems} />
      </Paper>
      <Paper className={classes.resultsContainer}>
        <div className={classes.results}>
          <Results {...store.ui.resultsStore.prepared} />
        </div>
        <div className={classes.details}>
          <Details {...store.ui.detailsStore.prepared} />
        </div>
      </Paper>
    </div>
  );
});

const SearchPage = ({ store }: { store: SearchPageStore }) => {
  const error = { error: null, onClose: () => {} };

  return (
    <Page errorSnackbar={error} isLoading={false} leftMenuItems={store.prepared.pageMenu}>
      {!store.prepared.hasActiveSearch && <SearchOnly {...store.prepared} />}
      {store.prepared.hasActiveSearch && <SearchWithResults store={store} />}
    </Page>
  );
};

export default observer(SearchPage);
