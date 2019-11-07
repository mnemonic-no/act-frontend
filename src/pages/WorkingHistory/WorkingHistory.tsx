import React from 'react';
import cc from 'clsx';
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
  },
  listItemSecondary: {
    display: 'flex'
  },
  detailsText: {
    display: 'inline-block',
    marginLeft: '4px'
  },
  tag: {
    padding: '0 8px',
    borderRadius: '8px',
    border: '0',
    background: '#eaeaea',
    textTransform: 'uppercase'
  }
}));

const WorkingHistory = (props: IWorkingHistory) => {
  const classes = useStyles();

  return (
    <Paper>
      <List dense>
        <ListItem>
          <Typography variant="subtitle2">History</Typography>
        </ListItem>
        {!props.isEmpty && (
          <ListItem dense disableGutters classes={{ root: classes.listItem }}>
            <ListItemText primary="Merge previous" />
            <ListItemSecondaryAction>
              <Switch onClick={() => props.mergePrevious.onClick()} checked={props.mergePrevious.checked} />
            </ListItemSecondaryAction>
          </ListItem>
        )}
      </List>
      {!props.isEmpty && (
        <>
          <Divider />
          <List dense>
            {props.historyItems.map(item => (
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
                  classes={{ root: classes.listItemText, secondary: classes.listItemSecondary }}
                  secondaryTypographyProps={{ component: 'div' }}
                  primary={<span>{item.title}</span>}
                  secondary={
                    item.details && (
                      <>
                        <div>{item.details.label}</div>
                        <div className={cc(classes.detailsText, { [classes.tag]: item.details.kind === 'tag' })}>
                          {item.details.text}
                        </div>
                      </>
                    )
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
            <Button onClick={props.onExport} disabled={props.isEmpty}>
              Export
            </Button>
          </span>
        </Tooltip>
        <Tooltip title="Import a previously exported search history">
          <Button component="label">
            Import
            <input id="importButton" type="file" style={{ display: 'none' }} onChange={props.onImport} />
          </Button>
        </Tooltip>
        <Tooltip title="Clear the graph">
          <span>
            <Button onClick={props.onClear} disabled={props.isEmpty}>
              Clear
            </Button>
          </span>
        </Tooltip>
      </div>
    </Paper>
  );
};

export type TIcon = 'remove' | 'copy';
export type TAction = { icon: TIcon; onClick: () => void; tooltip: string };
export type TDetails = { kind: 'tag' | 'label-text'; label: string; text: string };

export type TWorkingHistoryItem = {
  id: string;
  title: string;
  isSelected: boolean;
  details?: TDetails;
  onClick: () => void;
  actions: Array<TAction>;
};

interface IWorkingHistory {
  historyItems: Array<TWorkingHistoryItem>;
  mergePrevious: { checked: boolean; onClick: () => void };
  isEmpty: boolean;
  onImport: (fileEvent: any) => void;
  onExport: () => void;
  onClear: () => void;
}

export default observer(WorkingHistory);
