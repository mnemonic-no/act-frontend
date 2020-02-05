import React from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import { ActionButton } from '../core/types';

const TitledButtonListComp = (props: ITitledButtonListProps) => {
  if (props.buttons.length === 0) return null;

  return (
    <>
      <Typography variant="body1" gutterBottom>
        {props.title}
      </Typography>
      <Grid container spacing={1} justify={'flex-start'}>
        {props.buttons.map(b => {
          return (
            <React.Fragment key={b.text}>
              <Grid item>
                <Tooltip title={b.tooltip}>
                  <Button size="small" variant="outlined" onClick={b.onClick} href={b.href}>
                    {b.text}
                  </Button>
                </Tooltip>
              </Grid>
            </React.Fragment>
          );
        })}
      </Grid>
    </>
  );
};

export interface ITitledButtonListProps {
  title: string;
  buttons: Array<ActionButton>;
}

export default TitledButtonListComp;
