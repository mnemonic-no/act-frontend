import React from 'react';
import CloseIcon from '@material-ui/icons/Close';
import {
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  makeStyles,
  Switch,
  Theme,
  Tooltip,
  Typography
} from '@material-ui/core';
import { observer } from 'mobx-react';

import QueryHistoryStore from './QueryHistoryStore';

const useStyles = makeStyles((theme: Theme) => ({
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
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  }
}));

const QueryHistory = ({ store }: IQueryHistory) => {
  const classes = useStyles();

  return (
    <Paper>
      <List dense>
        <ListItem>
          <Typography variant="subtitle2">History</Typography>
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
};

interface IQueryHistory {
  store: QueryHistoryStore;
}

export default observer(QueryHistory);
