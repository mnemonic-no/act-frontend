import React from 'react';
import CloseIcon from '@material-ui/icons/Close';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import WorkingHistoryStore from './WorkingHistoryStore';

const useStyles = makeStyles((theme: Theme) => ({
  listItem: {
    paddingLeft: theme.spacing(2)
  },
  item: {},
  activeItem: {
    borderLeft: `2px solid ${theme.palette.primary.main}`
  },
  actionButton: {
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

const WorkingHistory = ({ store }: IWorkingHistory) => {
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
                  {item.actions.map((a, idx) => (
                    <Tooltip key={idx} title={a.tooltip} enterDelay={800}>
                      <IconButton onClick={a.onClick} classes={{ root: classes.actionButton }}>
                        {a.icon === 'remove' && <CloseIcon />}
                        {a.icon === 'copy' && <AssignmentIcon />}
                      </IconButton>
                    </Tooltip>
                  ))}
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

interface IWorkingHistory {
  store: WorkingHistoryStore;
}

export default observer(WorkingHistory);
