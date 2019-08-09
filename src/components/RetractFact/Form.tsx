import React from 'react';
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import AccessModeSelector from '../AccessModeSelector';
import DialogError from '../DialogError';
import DialogLoadingOverlay from '../DialogLoadingOverlay';

const RetractFactFormComp = ({
  fields,
  onSubmit,
  onChange,
  ContentComp,
  ActionsComp,
  close,
  isSubmitting,
  error,
  fact
}: IRetractFactFormComp) => (
  <form
    onSubmit={e => {
      e.preventDefault();
      onSubmit();
    }}>
    <ContentComp>
      {/* Loading state */}
      {isSubmitting && <DialogLoadingOverlay />}

      {/* Error state */}
      {error && <DialogError error={error} />}

      {/* Title */}
      <Typography variant="h6" gutterBottom>
        Retract fact
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        {fact && fact.id}
      </Typography>

      <br />
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <AccessModeSelector fullWidth value={fields.accessMode} onChange={(v: any) => onChange('accessMode', v)} />
        </Grid>
      </Grid>
      <br />
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <TextField
            autoFocus
            multiline
            value={fields.comment}
            onChange={v => onChange('comment', v.target.value)}
            label="Comment"
          />
        </Grid>
      </Grid>
    </ContentComp>
    <ActionsComp>
      <Button onClick={close}>Cancel</Button>
      <Button type="submit" variant="contained" color="secondary">
        Retract
      </Button>
    </ActionsComp>
  </form>
);

interface IRetractFactFormComp {
  fields: any;
  fact: any;
  error: any;
  ContentComp: any;
  ActionsComp: any;
  isSubmitting: boolean;
  onSubmit: () => void;
  onChange: (reason: string, value: any) => void;
  close: () => void;
}

export default RetractFactFormComp;
