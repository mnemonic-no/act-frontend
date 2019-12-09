import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import ActObjectAutoSuggest from '../../../components/ActObjectAutoSuggest';
import ObjectType from '../../../components/ObjectType';
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

const SearchByObjectTypeComp = ({ store }: ISearch) => {
  const classes = useStyles();

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        store.submitSearch();
      }}>
      <div className={classes.root}>
        <Typography variant="subtitle2">Graph Query</Typography>
        <ObjectType fullWidth value={store.objectType} onChange={store.onObjectTypeChange} />
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
          <Button type="submit">Search</Button>
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
