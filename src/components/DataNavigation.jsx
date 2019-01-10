import React from 'react';
import { compose, withProps, withHandlers } from 'recompose';
import { saveAs } from 'file-saver';
import { observer } from 'mobx-react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';

import { withStyles } from '@material-ui/core/styles';
import Close from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';

import dataState from '../state/data';
import filteringOptions from '../state/filteringOptions';
import dataFetching from '../state/dataFetching';

const styles = theme => ({
  listItem: {
    paddingLeft: theme.spacing.unit * 2
  },
  item: {},
  activeItem: {
    borderLeft: `2px solid ${theme.palette.primary.main}`
  },
  removeButton: {
    opacity: 0,
    '$item:hover &': {
      opacity: 1
    },
    transition: theme.transitions.create('opacity', {
      duration: theme.transitions.duration.shortest
    })
  },
  buttons: {
    padding: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit
  },
  listItemText: {
    overflowX: 'hidden'
  }
});

const DataListItemText = ({ node }) => {
  // Determine node type
  if (node.search.resolvedFacts) {
    return <i>resolved facts</i>;
  } else if (node.search.createFact) {
    return <i>create fact: {`${node.search.factType}`}</i>;
  }
  return `${node.search.objectType}: ${node.search.objectValue}`;
};

const DataNavigationComp = ({
  classes,
  dataState,
  dataFetching,
  filteringOptions,
  onExport
}) => (
  <div>
    <List dense>
      <ListItem dense disableGutters classes={{ root: classes.listItem }}>
        <ListItemText primary='Merge previous' />
        <ListItemSecondaryAction>
          <Switch
            onClick={() =>
              filteringOptions.setMergePrevious(!filteringOptions.mergePrevious)
            }
            checked={filteringOptions.mergePrevious}
          />
        </ListItemSecondaryAction>
      </ListItem>
    </List>
    <Divider />
    <List dense>
      {dataState.dataList.map(node => (
        <ListItem
          classes={{
            root: classes.listItem,
            container: `${
              node === dataState.current ? classes.activeItem : ''
            } ${classes.item}`
          }}
          button
          disableGutters
          dense
          key={`${Math.random()}-${JSON.stringify(node.search)}`}
          onClick={() => dataState.updateCurrent(node)}
        >
          <ListItemText
            classes={{ root: classes.listItemText }}
            primary={<DataListItemText node={node} />}
            secondary={node.search.query}
          />
          <ListItemSecondaryAction>
            <IconButton
              onClick={() => dataState.removeNode(node)}
              classes={{ root: classes.removeButton }}
            >
              <Close />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
    <Divider />
    <div className={classes.buttons}>
      <Tooltip title='Export the whole search history as JSON'>
        <Button onClick={() => onExport()}>Export</Button>
      </Tooltip>

      <Tooltip title='Resolve direct facts between the current objects in the graph'>
        <Button onClick={() => dataFetching.resolveCurrentFacts()}>
          RESOLVE FACTS
        </Button>
      </Tooltip>
      {/* <Button>Import</Button> */}
    </div>
  </div>
);

const onExport = ({ dataState }) => () => {
  const blob = new window.Blob(
    [JSON.stringify(dataState.searchTree, null, 2)],
    { type: 'application/json' }
  );
  saveAs(blob, 'act-search-history.json');
};

export default compose(
  withStyles(styles),
  withProps({ dataState, filteringOptions, dataFetching }),
  withHandlers({ onExport }),
  observer
)(DataNavigationComp);
