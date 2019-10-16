import React from 'react';
import { Grid, Button, Typography, Tooltip } from '@material-ui/core';
import { PredefinedObjectQuery } from '../../pages/types';

const PredefinedObjectQueriesComp = ({ predefinedObjectQueries, onClick }: IPredefinedObjectQueriesComp) => {
  if (predefinedObjectQueries.length === 0) return null;

  return (
    <>
      <Typography variant="body1" gutterBottom>
        Predefined graph queries
      </Typography>
      <Grid container spacing={1} justify={'flex-start'}>
        {predefinedObjectQueries.map(q => {
          return (
            <React.Fragment key={q.name}>
              <Grid item>
                <Tooltip title={q.description}>
                  <Button size="small" variant="outlined" onClick={() => onClick(q)}>
                    {q.name}
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

interface IPredefinedObjectQueriesComp {
  predefinedObjectQueries: Array<PredefinedObjectQuery>;
  onClick: (q: PredefinedObjectQuery) => void;
}

export default PredefinedObjectQueriesComp;
