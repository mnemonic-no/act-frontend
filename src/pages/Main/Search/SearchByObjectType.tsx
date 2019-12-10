import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { LoadingStatus, NamedId, TLoadable } from '../../../core/types';
import { ErrorComp, LoadingComp } from '../../../components/Loadable';
import ActObjectAutoSuggest from '../../../components/ActObjectAutoSuggest';
import ActObjectType from '../../../components/ActObjectType';
import QueryAutoSuggest from './QueryAutoSuggest';
import SearchByObjectTypeStore from './SearchByObjectTypeStore';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridGap: theme.spacing(1.5)
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between'
  }
}));

const ActObjectTypeSelector = (props: {
  loadable: TLoadable<any>;
  onChange: (value: string) => void;
  value: string;
  objectTypes: Array<NamedId>;
}) => {
  switch (props.loadable.status) {
    case LoadingStatus.REJECTED:
      return <ErrorComp error={props.loadable.error} />;
    case LoadingStatus.PENDING:
      return <LoadingComp text="Loading" />;
    case LoadingStatus.DONE:
      return <ActObjectType fullWidth onChange={props.onChange} value={props.value} objectTypes={props.objectTypes} />;
  }
};

const SearchByObjectTypeComp = ({ store }: ISearch) => {
  const classes = useStyles();

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (store.isReadyToSearch) {
          store.submitSearch();
        }
      }}>
      <div className={classes.root}>
        <Typography variant="subtitle2">Graph Query</Typography>
        <ActObjectTypeSelector {...store.objectTypeSelector} />
        <ActObjectAutoSuggest {...store.autoSuggester} fullWidth required placeholder="Object value" />
        <QueryAutoSuggest
          required={false}
          fullWidth
          placeholder="Query"
          label="Graph query"
          helperText={'A Graph query, like g.outE()'}
          {...store.queryInput}
        />
        <div className={classes.buttonContainer}>
          <Button type="submit" disabled={!store.isReadyToSearch}>
            Search
          </Button>
          <Button onClick={store.onClear}>Clear</Button>
        </div>
      </div>
    </form>
  );
};

interface ISearch {
  store: SearchByObjectTypeStore;
}

export default observer(SearchByObjectTypeComp);
