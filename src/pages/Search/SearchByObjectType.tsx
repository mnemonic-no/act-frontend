import { Button, Grid, makeStyles, Theme } from '@material-ui/core';
import { observer } from 'mobx-react';
import React from 'react';

import ObjectType from '../../components/ObjectType';
import ObjectValueAutosuggest from '../../components/ObjectValueAutosuggest';
import QueryAutoSuggest from './QueryAutoSuggest';
import SearchByObjectTypeStore from './SearchByObjectTypeStore';

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
          <ObjectType fullWidth value={store.objectType} onChange={(value: string) => (store.objectType = value)} />
        </Grid>
        <Grid item xs={12}>
          <ObjectValueAutosuggest
            required
            autoFocus={store.objectValue === ''}
            fullWidth
            label={'Object value'}
            value={store.objectValue}
            onChange={(value: string) => (store.objectValue = value)}
            objectType={store.objectType}
          />
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
