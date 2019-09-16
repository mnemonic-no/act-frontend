import React from 'react';
import { Grid, List, ListItem, ListItemSecondaryAction, ListItemText, Switch } from '@material-ui/core';
import { observer } from 'mobx-react';

const GraphOptionsComp = ({ graphOptions }: IGraphOptionsComp) => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <List dense>
        <ListItem disableGutters>
          <ListItemText primary="Edges" secondary={'Show labels'} />
          <ListItemSecondaryAction>
            <Switch onClick={() => graphOptions.toggleShowFactEdgeLabels()} checked={graphOptions.showFactEdgeLabels} />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem disableGutters>
          <ListItemText primary="Retractions" secondary="Show retracted facts" />
          <ListItemSecondaryAction>
            <Switch
              onClick={() => {
                graphOptions.toggleShowRetractions();
              }}
              checked={graphOptions.showRetractions}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem disableGutters>
          <ListItemText primary="Orphans" secondary="Show orphans" />
          <ListItemSecondaryAction>
            <Switch
              onClick={() => {
                graphOptions.toggleShowOrphans();
              }}
              checked={graphOptions.showOrphans}
            />
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    </Grid>
  </Grid>
);

interface IGraphOptionsComp {
  graphOptions: {
    showOrphans: boolean;
    showFactEdgeLabels: boolean;
    showRetractions: boolean;
    toggleShowOrphans: () => void;
    toggleShowFactEdgeLabels: () => void;
    toggleShowRetractions: () => void;
  };
}

export default observer(GraphOptionsComp);
