import React from 'react';
import { compose, withProps } from 'recompose';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import { observer } from 'mobx-react';

import filteringOptions from '../state/filteringOptions';
import FilterObjects from '../components/FilterObjects';
import RelativeDateSelector from '../components/RelativeDateSelector';
import ListItemControl from './ListItemControl';

const styles = theme => ({});

const DateOptionsComp = ({ classes, filteringOptions }) => (
  <Grid container spacing={16}>
    <Grid item xs={12}>
      <List dense>
        <ListItem disableGutters>
          <ListItemText primary='Date' secondary='Filter by max time' />
          <ListItemSecondaryAction>
            <ListItemControl>
              <RelativeDateSelector
                value={filteringOptions.endTimestamp}
                onChange={x => filteringOptions.setEndTimestamp(x)}
              />
            </ListItemControl>
          </ListItemSecondaryAction>
        </ListItem>
      </List>

      <FilterObjects
        value={filteringOptions.objectTypes}
        onChange={x => filteringOptions.setObjectTypes(x)}
      />
    </Grid>
  </Grid>
);

export default compose(
  withStyles(styles),
  withProps({ filteringOptions }),
  observer
)(DateOptionsComp);
