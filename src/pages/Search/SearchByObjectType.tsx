import { observer } from 'mobx-react';
import React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import ObjectType from '../../components/ObjectType';
import QueryAutoSuggest from './QueryAutoSuggest';
import SearchByObjectTypeStore from './SearchByObjectTypeStore';
import ActObjectAutoSuggest from '../../components/ActObjectAutoSuggest';

const useStyles = makeStyles((theme: Theme) => ({
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
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <ObjectType fullWidth value={store.objectType} onChange={store.onObjectTypeChange} />
        </Grid>
        <Grid item xs={12}>
          <ActObjectAutoSuggest {...store.autoSuggester} fullWidth required placeholder="Object value" />
        </Grid>
        <Grid item xs={12}>
          <QueryAutoSuggest
            required={false}
            fullWidth
            placeholder="Query"
            label="Graph query"
            helperText={'A Graph query, like g.outE()'}
            {...store.queryInput}
          />
        </Grid>
        <Grid item xs={12}>
          <div className={classes.buttonContainer}>
            <Button type="submit">Search</Button>
            <Button onClick={store.onClear}>Clear</Button>
          </div>
        </Grid>
      </Grid>
    </form>
  );
};

interface ISearch {
  store: SearchByObjectTypeStore;
}

export default observer(SearchByObjectTypeComp);
