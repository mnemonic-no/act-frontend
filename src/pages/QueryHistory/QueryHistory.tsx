import { compose } from 'recompose';

import React from 'react';
import Paper from '@material-ui/core/Paper';
import QueryHistoryStore from './QueryHistoryStore';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Switch from '@material-ui/core/Switch';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core';
import { observer } from 'mobx-react';
import Typography from '@material-ui/core/Typography';

const styles = (theme: Theme) =>
  createStyles({
    listItem: {
      paddingLeft: theme.spacing(2)
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
      padding: theme.spacing(2),
      paddingTop: theme.spacing(),
      paddingBottom: theme.spacing(),
      display: 'flex',
      justifyContent: 'space-between'
    },
    listItemText: {
      overflowX: 'hidden',
      whiteSpace: 'nowrap'
    }
  });

const QueryHistory = ({ store, classes }: IQueryHistory) => (
  <Paper>
    <List dense>
      <ListItem>
        <Typography variant="subtitle2">Query History</Typography>
      </ListItem>
      {!store.isEmpty && (
        <ListItem dense disableGutters classes={{ root: classes.listItem }}>
          <ListItemText primary="Merge previous" />
          <ListItemSecondaryAction>
            <Switch onClick={() => store.flipMergePrevious()} checked={store.mergePrevious} />
          </ListItemSecondaryAction>
        </ListItem>
      )}
    </List>
    {!store.isEmpty && (
      <>
        <Divider />
        <List dense>
          {store.queryItems.map(item => (
            <ListItem
              classes={{
                root: classes.listItem,
                container: `${item.isSelected ? classes.activeItem : ''} ${classes.item}`
              }}
              button
              disableGutters
              dense
              key={item.id}
              onClick={item.onClick}>
              <ListItemText
                classes={{ root: classes.listItemText }}
                secondaryTypographyProps={{ component: 'div' }}
                primary={<span>{item.title}</span>}
                secondary={
                  <>
                    {item.details.map((detail, idx) => (
                      <div key={idx}>{detail}</div>
                    ))}
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton onClick={item.onRemoveClick} classes={{ root: classes.removeButton }}>
                  <CloseIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <Divider />
      </>
    )}
    <div className={classes.buttons}>
      <Tooltip title="Export the whole search history as JSON">
        <span>
          <Button onClick={store.onExport} disabled={store.isEmpty}>
            Export
          </Button>
        </span>
      </Tooltip>
      <Tooltip title="Import a previously exported search history">
        <Button component="label">
          Import
          <input id="importButton" type="file" style={{ display: 'none' }} onChange={store.onImport} />
        </Button>
      </Tooltip>
      <Tooltip title="Clear the graph">
        <span>
          <Button onClick={store.onClear} disabled={store.isEmpty}>
            Clear
          </Button>
        </span>
      </Tooltip>
    </div>
  </Paper>
);

interface IQueryHistory extends WithStyles<typeof styles> {
  store: QueryHistoryStore;
}

export default compose<IQueryHistory, Omit<IQueryHistory, 'classes'>>(
  withStyles(styles),
  observer
)(QueryHistory);
