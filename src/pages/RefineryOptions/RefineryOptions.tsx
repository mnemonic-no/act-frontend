import RefineryOptionsStore from './RefineryOptionsStore';
import * as React from 'react';
import GraphOptions from './GraphOptions';
import Divider from '@material-ui/core/Divider';
import { observer } from 'mobx-react';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemControl from '../../components/ListItemControl';
import RelativeDateSelector from '../../components/RelativeDateSelector';
import FilterActObjects from './FilterActObjects';
import { ObjectTypeFilter } from '../RefineryStore';

const RefineryOptionsFilter = ({ filterOptions }: any) => (
  <Grid container spacing={16}>
    <Grid item xs={12}>
      <List dense>
        <ListItem disableGutters>
          <ListItemText primary="Date" secondary="Filter by max time" />
          <ListItemSecondaryAction>
            <ListItemControl>
              <RelativeDateSelector
                value={filterOptions.endTimestamp}
                onChange={(x: any) => filterOptions.setEndTimestamp(x)}
              />
            </ListItemControl>
          </ListItemSecondaryAction>
        </ListItem>
      </List>

      <FilterActObjects
        objectTypeFilters={filterOptions.objectTypeFilters}
        onChange={(x: ObjectTypeFilter) => filterOptions.toggleObjectTypeFilter(x)}
      />
    </Grid>
  </Grid>
);

const RefineryOptions = ({ store }: { store: RefineryOptionsStore }) => (
  <div>
    <GraphOptions graphOptions={store.graphOptions} />
    <Divider />
    <RefineryOptionsFilter filterOptions={store.filterOptions} />
  </div>
);

export default observer(RefineryOptions);
