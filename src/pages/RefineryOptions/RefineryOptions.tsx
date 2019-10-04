import * as React from 'react';

import { observer } from 'mobx-react';
import { Grid, List, ListItem, ListItemText, ListItemSecondaryAction, Switch } from '@material-ui/core';

import FilterActObjects from './FilterActObjects';
import ListItemControl from '../../components/ListItemControl';
import RefineryOptionsStore from './RefineryOptionsStore';
import RelativeDateSelector from '../../components/RelativeDateSelector';
import { ObjectTypeFilter } from '../types';

const RefineryOptions = ({ store }: { store: RefineryOptionsStore }) => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <List dense>
        <ListItem disableGutters>
          <ListItemText primary="Retractions" secondary="Show retracted facts" />
          <ListItemSecondaryAction>
            <Switch
              onClick={() => {
                store.filterOptions.toggleIncludeRetractions();
              }}
              checked={store.filterOptions.includeRetractions}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem disableGutters>
          <ListItemText primary="Orphans" secondary="Show orphans" />
          <ListItemSecondaryAction>
            <Switch onClick={store.filterOptions.toggleIncludeOrphans} checked={store.filterOptions.includeOrphans} />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem disableGutters>
          <ListItemText primary="Date" secondary="Filter by max time" />
          <ListItemSecondaryAction>
            <ListItemControl>
              <RelativeDateSelector
                value={store.filterOptions.endTimestamp}
                onChange={(x: any) => store.filterOptions.setEndTimestamp(x)}
              />
            </ListItemControl>
          </ListItemSecondaryAction>
        </ListItem>
      </List>

      <FilterActObjects
        objectTypeFilters={store.filterOptions.objectTypeFilters}
        onChange={(x: ObjectTypeFilter) => store.filterOptions.toggleObjectTypeFilter(x)}
      />
    </Grid>
  </Grid>
);

export default observer(RefineryOptions);
