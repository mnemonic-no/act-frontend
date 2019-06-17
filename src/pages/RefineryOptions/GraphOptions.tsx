import React from 'react';
import { compose } from 'recompose';
import { withStyles } from '@material-ui/core/styles/index';
import Grid from '@material-ui/core/Grid/index';
import List from '@material-ui/core/List/index';
import ListItem from '@material-ui/core/ListItem/index';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction/index';
import ListItemText from '@material-ui/core/ListItemText/index';
import Switch from '@material-ui/core/Switch/index';
import { observer } from 'mobx-react';

const styles = (theme:any) => ({});

const GraphOptionsComp = ({ classes, graphOptions } : {classes: any, graphOptions: any}) => (
  <Grid container spacing={16}>
    <Grid item xs={12}>
      <List dense>
        <ListItem disableGutters>
          <ListItemText primary='Edges' secondary={'Show labels'} />
          <ListItemSecondaryAction>
            <Switch
              onClick={() => graphOptions.toggleShowFactEdgeLabels()}
              checked={graphOptions.showFactEdgeLabels}/>
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem disableGutters>
          <ListItemText
            primary='Retractions'
            secondary='Show retracted facts'/>
          <ListItemSecondaryAction>
            <Switch
              onClick={() => {graphOptions.toggleShowRetractions()}}
              checked={graphOptions.showRetractions}/>
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    </Grid>
  </Grid>
);

export default compose(
  withStyles(styles),
  observer
    // @ts-ignore
)(GraphOptionsComp);
