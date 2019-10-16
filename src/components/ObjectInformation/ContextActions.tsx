import React from 'react';
import { Button, Grid, Tooltip, Typography } from '@material-ui/core';
import { ContextAction } from '../../pages/types';

const ContextActions = ({ actions }: { actions: Array<ContextAction> }) => {
  if (!actions || actions.length === 0) return null;

  return (
    <>
      <Typography variant="body1" gutterBottom>
        Actions
      </Typography>
      <Grid container spacing={1}>
        {actions.map(action => {
          return (
            <Grid item key={action.name}>
              <Tooltip title={action.description}>
                <Button size="small" variant="outlined" onClick={action.onClick} href={action.href}>
                  {action.name}
                </Button>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};

export default ContextActions;
