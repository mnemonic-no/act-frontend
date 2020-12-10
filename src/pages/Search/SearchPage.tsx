import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import SearchIcon from '@material-ui/icons/Search';

import ActObjectAutoSuggest, { IActObjectAutoSuggestComp } from '../../components/ActObjectAutoSuggest';
import Details from './Details/Details';
import HistoryButton from './HistoryButton';
import Page from '../Page';
import Results from './Results/Results';
import SearchPageStore from './SearchPageStore';
import SingleValueFilter, { ISingleValueFilterComp } from '../../components/SingleValueFilter';

const useSearchOnlyStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flex: '1 0 0',
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
    width: 512,
    marginBottom: theme.spacing(2)
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
    alignItems: 'flex-start',
    margin: '10px 10px 0 10px'
  },
  searchInput: {
    flex: '1 0 auto',
    paddingRight: theme.spacing(2)
  },
  historyButton: {
    paddingTop: theme.spacing(1)
  },
  resultsContainer: {
    flex: '1 0 auto',
    display: 'flex',
    margin: '10px',
    overflow: 'hidden',
    minWidth: 0
  },
  results: {
    flex: '1 1 auto',
    minWidth: 0,
    display: 'flex',
    overflow: 'hidden'
  },
  details: {
    flex: '0 0 500px',
    minWidth: '500px',
    overflow: 'hidden',

    display: 'flex',
    borderLeft: '1px solid',
    borderColor: theme.palette.grey['200']
  }
}));

const useSearchInputStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    '& :first-child': {
      flex: '1 0 auto'
    }
  },
  searchButton: {
    paddingLeft: '20px'
  }
}));

const SearchInput = (props: {
  autoSuggest: Omit<IActObjectAutoSuggestComp, 'fullWidth' | 'required' | 'helperText' | 'placeholder'>;
  objectTypeFilter: ISingleValueFilterComp;
  isAdvancedSearchEnabled: boolean;
  advancedSearchButton: { text: string; onClick: () => void };
  onSearch: () => void;
}) => {
  const classes = useSearchInputStyles();

  return (
    <>
      <form
        onSubmit={e => {
          e.preventDefault();
          props.onSearch();
        }}>
        <div className={classes.root}>
          <ActObjectAutoSuggest {...props.autoSuggest} fullWidth required placeholder="Search for objects" />
          <div className={classes.searchButton}>
            <IconButton color={'primary'} onClick={props.onSearch}>
              <SearchIcon fontSize={'large'} />
            </IconButton>
          </div>
        </div>
      </form>

      {!props.isAdvancedSearchEnabled && (
        <Button size="small" onClick={props.advancedSearchButton.onClick}>
          {props.advancedSearchButton.text}
        </Button>
      )}
      {props.isAdvancedSearchEnabled && <SingleValueFilter {...props.objectTypeFilter} />}
    </>
  );
};

const SearchOnly = (props: {
  searchInput: Omit<IActObjectAutoSuggestComp, 'fullWidth' | 'required' | 'helperText' | 'placeholder'>;
  objectTypeFilter: ISingleValueFilterComp;
  isAdvancedSearchEnabled: boolean;
  advancedSearchButton: { text: string; onClick: () => void };

  onSearch: () => void;
}) => {
  const classes = useSearchOnlyStyles();

  return (
    <div className={classes.root}>
      <div className={classes.spacer} />
      <div className={classes.searchContainer}>
        <img className={classes.logo} src="/act-logo-onWhite.svg" alt="ACT | The Open Threat Intelligence Platform" />
        <SearchInput
          autoSuggest={props.searchInput}
          onSearch={props.onSearch}
          objectTypeFilter={props.objectTypeFilter}
          isAdvancedSearchEnabled={props.isAdvancedSearchEnabled}
          advancedSearchButton={props.advancedSearchButton}
        />
      </div>
    </div>
  );
};

const SearchWithResults = observer(({ store }: { store: SearchPageStore }) => {
  const classes = useResultStyles();

  const {
    searchInput,
    searchHistoryItems,
    onSearch,
    objectTypeFilter,
    isAdvancedSearchEnabled,
    advancedSearchButton
  } = store.prepared;

  return (
    <div className={classes.root}>
      <Paper className={classes.searchContainer}>
        <div className={classes.searchInput}>
          <SearchInput
            autoSuggest={searchInput}
            onSearch={onSearch}
            objectTypeFilter={objectTypeFilter}
            isAdvancedSearchEnabled={isAdvancedSearchEnabled}
            advancedSearchButton={advancedSearchButton}
          />
        </div>
        <div className={classes.historyButton}>
          <HistoryButton historyItems={searchHistoryItems} />
        </div>
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

const SearchPage = ({ store, headerComp }: ISearchPageProps) => {
  return (
    <Page {...store.prepared.page} headerComp={headerComp}>
      {!store.prepared.hasActiveSearch && <SearchOnly {...store.prepared} />}
      {store.prepared.hasActiveSearch && <SearchWithResults store={store} />}
    </Page>
  );
};

interface ISearchPageProps {
  store: SearchPageStore;
  headerComp: React.ReactNode;
}

export default observer(SearchPage);
