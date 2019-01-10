import React from 'react';
import { compose, withProps } from 'recompose';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Switch from '@material-ui/core/Switch';
import { observer } from 'mobx-react';

import graphOptions from '../state/graphOptions';

const styles = theme => ({});

const GraphOptionsComp = ({ classes, graphOptions }) => (
  <Grid container spacing={16}>
    <Grid item xs={12}>
      <List dense>
        <ListItem disableGutters>
          <ListItemText primary='Facts' secondary={'Display as nodes'} />
          <ListItemSecondaryAction>
            <Switch
              onClick={() =>
                graphOptions.setShowFactsAsNodes(!graphOptions.showFactsAsNodes)
              }
              checked={graphOptions.showFactsAsNodes}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem disableGutters>
          <ListItemText primary='Edges' secondary={'Show labels'} />
          <ListItemSecondaryAction>
            <Switch
              onClick={() =>
                graphOptions.setShowFactEdgeLabels(
                  !graphOptions.showFactEdgeLabels
                )
              }
              checked={graphOptions.showFactEdgeLabels}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem disableGutters>
          <ListItemText
            primary='Retractions'
            secondary='Show retracted facts'
          />
          <ListItemSecondaryAction>
            <Switch
              onClick={() => {
                graphOptions.setShowRetractions(!graphOptions.showRetractions);
              }}
              checked={graphOptions.showRetractions}
            />
          </ListItemSecondaryAction>
        </ListItem>
        {/* <ListItem disableGutters>
          <ListItemText
            primary='Nodes'
            secondary='Lock in place'
          />
          <ListItemSecondaryAction>
            <Switch
              onClick={() => setLockNodes(!lockNodes)}
              checked={lockNodes}
              />
          </ListItemSecondaryAction>
        </ListItem> */}
      </List>
    </Grid>
  </Grid>
);

export default compose(
  withStyles(styles),
  withProps({ graphOptions }),
  observer
)(GraphOptionsComp);
