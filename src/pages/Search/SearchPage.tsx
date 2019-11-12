import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';

import Page from '../Page';
import ActObjectAutoSuggest, { IActObjectAutoSuggestComp } from '../../components/ActObjectAutoSuggest';
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
    height: '100%'
  },
  searchContainer: {
    padding: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  searchInput: {
    flex: '1 0 auto',
    paddingRight: theme.spacing(2)
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
        <form
          onSubmit={e => {
            e.preventDefault();
            props.onSearch();
          }}>
          <img className={classes.logo} src="/act-logo-onWhite.svg" alt="ACT | The Open Threat Intelligence Platform" />
          <ActObjectAutoSuggest {...props.searchInput} fullWidth required placeholder="Search for objects" />
        </form>
      </div>
    </div>
  );
};

const SearchWithResults = observer(({ store }: { store: SearchPageStore }) => {
  const classes = useResultStyles();

  const { searchInput } = store.prepared;

  return (
    <div className={classes.root}>
      <div className={classes.searchContainer}>
        <div className={classes.searchInput}>
          <ActObjectAutoSuggest {...searchInput} fullWidth required placeholder="Search for objects" />
        </div>
      </div>
      <div>SHOW RESULTS HERE</div>
    </div>
  );
});

const SearchPage = ({ store }: { store: SearchPageStore }) => {
  const error = { error: null, onClose: () => {} };

  return (
    <Page errorSnackbar={error} isLoading={false}>
      {!store.prepared.hasActiveSearch && <SearchOnly {...store.prepared} />}
      {store.prepared.hasActiveSearch && <SearchWithResults store={store} />}
    </Page>
  );
};

export default observer(SearchPage);
