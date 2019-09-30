import React from 'react';
import { Button, Grid, makeStyles, Theme, Tooltip } from '@material-ui/core';
import ActObjectAutoSuggest, { IActObjectAutoSuggestComp } from '../../components/ActObjectAutoSuggest';

const useStyles = makeStyles((theme: Theme) => ({
  root: { outline: '1px solid pink' },
  footer: {
    display: 'flex',
    justifyContent: 'space-between'
  }
}));

const SearchSimpleComp = ({ autoSuggester, onClear, onSearch }: ISearchSimpleComp) => {
  const classes = useStyles();

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSearch();
      }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <ActObjectAutoSuggest {...autoSuggester} fullWidth required placeholder="Search for objects" />
        </Grid>
        <Grid item xs={12}>
          <div className={classes.footer}>
            <Tooltip title="Show the search result in a designated view">
              <Button type="submit">Search</Button>
            </Tooltip>
            <Tooltip title="Clear the input box">
              <Button onClick={onClear}>Clear</Button>
            </Tooltip>
          </div>
        </Grid>
      </Grid>
    </form>
  );
};

interface ISearchSimpleComp {
  autoSuggester: Omit<IActObjectAutoSuggestComp, 'fullWidth' | 'required' | 'helperText' | 'placeholder'>;
  onClear: () => void;
  onSearch: () => void;
}

export default SearchSimpleComp;
