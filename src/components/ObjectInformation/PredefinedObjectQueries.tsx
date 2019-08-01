import React from 'react';
import { withStyles, createStyles, Theme, WithStyles } from '@material-ui/core';
import { Grid, Button, Typography, Tooltip } from '@material-ui/core';
import { PredefinedObjectQuery } from '../../pages/Details/DetailsStore';

const styles = (theme: Theme) =>
  createStyles({
    items: {
      minHeight: 120,
      overflow: 'scroll',
      padding: theme.spacing.unit
    }
  });

const PredefinedObjectQueriesComp = ({ predefinedObjectQueries, onClick, classes }: IPredefinedObjectQueriesComp) => {
  if (predefinedObjectQueries.length === 0) return null;

  return (
    <React.Fragment>
      <Typography variant="body1" gutterBottom>
        Predefined graph queries
      </Typography>
      <Grid container spacing={8} className={classes.items}>
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
    </React.Fragment>
  );
};

interface IPredefinedObjectQueriesComp extends WithStyles<typeof styles> {
  predefinedObjectQueries: Array<PredefinedObjectQuery>;
  onClick: (q: PredefinedObjectQuery) => void;
}

export default withStyles(styles)(PredefinedObjectQueriesComp);
