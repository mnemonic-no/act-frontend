import React from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import { ContextAction } from '../../core/types';

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
