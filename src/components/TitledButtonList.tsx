import React from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import { TActionButton } from '../core/types';

const TitledButtonListComp = (props: ITitledButtonListProps) => {
  if (props.buttons.length === 0) return null;

  return (
    <>
      <Typography variant="body1" gutterBottom>
        {props.title}
      </Typography>
      <Grid container spacing={1} justifyContent={'flex-start'}>
        {props.buttons.map(b => {
          const customProps = b.href ? { target: '_blank', rel: 'noopener noreferrer' } : {};
          return (
            <Grid key={b.text} item>
              <Tooltip title={b.tooltip}>
                <Button {...customProps} size="small" variant="outlined" onClick={b.onClick} href={b.href}>
                  {b.text}
                </Button>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};

export interface ITitledButtonListProps {
  title: string;
  buttons: Array<TActionButton>;
}

export default TitledButtonListComp;
