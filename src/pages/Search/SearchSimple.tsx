import React from 'react';
import { Button, Grid, makeStyles, TextField, Theme, Tooltip } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  root: { outline: '1px solid pink' },
  footer: {
    display: 'flex',
    justifyContent: 'space-between'
  }
}));

const SearchSimpleComp = ({ label, value, onChange, onClear, onSearch }: ISearchSimpleComp) => {
  const classes = useStyles();

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSearch();
      }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            {...{ label, value, onChange: (event: any) => onChange(event.target.value) }}
            required
            fullWidth
            autoFocus
          />
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
  label: string;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onSearch: () => void;
}

export default SearchSimpleComp;
