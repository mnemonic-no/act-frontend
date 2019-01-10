import React from 'react';
import { compose } from 'recompose';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import deformed from '../util/deformed';
import ObjectType from './ObjectType';
import ObjectValueAutosuggest from './ObjectValueAutosuggest';

const Fields = {
  objectType: '',
  objectValue: '',
  query: ''
};

const SearchFormComp = ({ fields, onSubmit, onChange, onClearData }) => (
  <form
    onSubmit={e => {
      e.preventDefault();
      onSubmit();
    }}
  >
    <Grid container spacing={16}>
      <Grid item xs={12}>
        <ObjectType
          fullWidth
          value={fields.objectType}
          onChange={value => onChange('objectType', value)}
        />
      </Grid>
      <Grid item xs={12}>
        <ObjectValueAutosuggest
          required
          autoFocus={fields.objectValue === ''}
          fullWidth
          label={'Object value'}
          value={fields.objectValue}
          onChange={value => onChange('objectValue', value)}
          objectType={fields.objectType}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          inputProps={{
            spellCheck: false
          }}
          fullWidth
          label={'Gremlin query'}
          helperText={'A Gremlin query, like g.outE()'}
          value={fields.query}
          onChange={e => onChange('query', e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <Button type='submit'>Search</Button>
        <Button onClick={onClearData}>Clear graph</Button>
      </Grid>
    </Grid>
  </form>
);

export default compose(deformed(Fields))(SearchFormComp);
