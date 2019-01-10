import React from 'react';
import { compose } from 'recompose';
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import AddIcon from '@material-ui/icons/Add';
import TextField from '@material-ui/core/TextField';

import AccessModeSelector from '../AccessModeSelector';
import ObjectFactDirection from './ObjectFactDirection';
import DialogError from '../DialogError';
import DialogLoadingOverlay from '../DialogLoadingOverlay';

const CreateFactFormComp = ({
  fields,
  onSubmit,
  onChange,
  ContentComp,
  ActionsComp,
  close,
  factTypes,
  objectTypes,
  isSubmitting,
  error
}) => (
  <form
    onSubmit={e => {
      e.preventDefault();
      onSubmit();
    }}
  >
    <ContentComp>
      {/* Loading state */}
      {isSubmitting && <DialogLoadingOverlay />}

      {/* Error state */}
      {error && <DialogError error={error} />}

      <Typography color='primary' variant='subheading'>
        Fact
      </Typography>
      <br />
      <Grid container spacing={16}>
        <Grid item xs={4}>
          <TextField
            label='Fact type'
            autoFocus
            value={fields.factType}
            onChange={v => onChange('factType', v.target.value)}
            select
            SelectProps={{
              native: true
            }}
          >
            {factTypes.map(x => (
              <option key={x.name} value={x.name}>
                {x.name}
              </option>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={4}>
          <TextField
            required
            label='Fact value'
            value={fields.factValue}
            onChange={v => onChange('factValue', v.target.value)}
          />
        </Grid>
      </Grid>
      <br />
      <Typography color='primary' variant='subheading'>
        Objects
      </Typography>
      <br />
      {fields.bindings.map((x, index) => (
        <React.Fragment key={index}>
          <ObjectFactDirection
            objectTypes={objectTypes}
            value={x}
            onChange={v => {
              const newBidings = [
                ...fields.bindings.slice(0, index),
                v,
                ...fields.bindings.slice(index + 1)
              ];
              newBidings[index] = v;
              onChange('bindings', newBidings);
            }}
          />
          {/* {index > 0 && (
            <IconButton onClick={() => {
              onChange('bindings', [...fields.bindings.slice(0, index), ...fields.bindings.slice(index + 1)]);
            }}>
              <RemoveIcon />
            </IconButton>
          )} */}
          <br />
        </React.Fragment>
      ))}
      <Button
        size='small'
        color='primary'
        variant='outlined'
        onClick={() => {
          onChange(
            'bindings',
            fields.bindings.concat({
              objectType: objectTypes[0],
              objectValue: '',
              direction: objectTypes[0].directions[0]
            })
          );
        }}
      >
        <AddIcon />
      </Button>
      <br />
      <br />
      <Typography color='primary' variant='subheading'>
        Options
      </Typography>
      <br />
      <Grid container spacing={16}>
        <Grid item xs={4}>
          <AccessModeSelector
            fullWidth
            value={fields.accessMode}
            onChange={v => onChange('accessMode', v)}
          />
        </Grid>
      </Grid>
      <br />
      <Grid container spacing={16}>
        <Grid item xs={8}>
          <TextField
            multiline
            value={fields.comment}
            onChange={v => onChange('comment', v.target.value)}
            label='Comment'
          />
        </Grid>
      </Grid>
    </ContentComp>
    <ActionsComp>
      <Button onClick={close}>Cancel</Button>
      <Button type='submit' variant='raised' color='secondary'>
        Submit
      </Button>
    </ActionsComp>
  </form>
);

export default compose()(CreateFactFormComp);
