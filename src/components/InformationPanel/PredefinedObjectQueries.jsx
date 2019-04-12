import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import config from '../../config';
import { Grid, Button, Typography, Tooltip } from '@material-ui/core';

const styles = theme => ({
  root: {},
  items: {
    height: 120,
    overflow: 'scroll',
    padding: theme.spacing.unit
  }
});

const PredefinedObjectQueriesComp = ({ data, onSearchSubmit, classes }) => {
  const onSearchClick = x => {
    onSearchSubmit({
      objectType: data.type.name,
      objectValue: data.value,
      query: x.query
    })
  };

  const queries = config.predefinedObjectQueries.filter(x =>
    x.objects.find(objectType => objectType === data.type.name)
  );
  if (queries.length === 0) return null

  return (
    <React.Fragment>
      <Typography variant='body1' gutterBottom>
        Predefined graph queries
      </Typography>
      <Grid container spacing={8} className={classes.items}>
        {queries.map(x => {
          return (
            <React.Fragment key={x.name}>
              <Grid item>
                <Tooltip title={x.description}>
                  <Button
                    size='small'
                    variant='outlined'
                    onClick={() => onSearchClick(x)}
                  >
                    {x.name}
                  </Button>
                </Tooltip>
              </Grid>
            </React.Fragment>
          )
        })}
      </Grid>
    </React.Fragment>
  )
};

const PredefinedObjectQueries = withStyles(styles)(PredefinedObjectQueriesComp)

export default PredefinedObjectQueries
