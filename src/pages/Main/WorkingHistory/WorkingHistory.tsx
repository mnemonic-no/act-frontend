import React from 'react';
import cc from 'clsx';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Fade from '@material-ui/core/Fade';
import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import ActIcon from '../../../components/ActIcon';

const useStyles = makeStyles((theme: Theme) => ({
  buttons: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(),
    paddingBottom: theme.spacing(),
    display: 'flex',
    justifyContent: 'space-between'
  },
  mergeItem: {
    paddingLeft: theme.spacing(2)
  }
}));

const useItemStyles = makeStyles((theme: Theme) => ({
  listItem: {
    paddingLeft: theme.spacing(2)
  },
  activeItem: {
    borderLeft: `2px solid ${theme.palette.primary.main}`
  },
  item: {},
  actionButton: {
    opacity: 0,
    '$item:hover &': {
      opacity: 1
    },
    transition: theme.transitions.create('opacity', {
      duration: theme.transitions.duration.shortest
    })
  },
  listItemText: {
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  listItemSecondary: {
    display: 'flex',
    color: theme.palette.text.secondary
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
  },
  errorIndicator: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.error.dark
  },
  errorText: {
    paddingLeft: theme.spacing(0.5)
  }
}));

const WorkingHistoryItem = (item: TWorkingHistoryItem) => {
  const classes = useItemStyles();

  return (
    <ListItem
      classes={{
        root: classes.listItem,
        container: cc(classes.item, { [classes.activeItem]: item.isSelected })
      }}
      button
      disableGutters
      dense
      key={item.id}
      onClick={item.onClick}>
      <ListItemText
        disableTypography={true}
        primary={
          <>
            <Fade in={item.isLoading} timeout={500}>
              <LinearProgress variant="query" color="secondary" />
            </Fade>
            {item.error && (
              <Tooltip title={item.error}>
                <div className={classes.errorIndicator}>
                  <ActIcon iconId="error" /> <div className={classes.errorText}>Failed</div>
                </div>
              </Tooltip>
            )}
            <Typography variant="body2" className={classes.listItemText}>
              {item.title.map((t, idx) => (
                <span key={idx} style={{ color: t.color || 'currentColor' }}>
                  {t.text}
                </span>
              ))}
            </Typography>
          </>
        }
        secondary={
          item.details && (
            <Typography variant="body2" className={classes.listItemSecondary}>
              <span>{item.details.label}</span>
              <span className={cc(classes.detailsText, { [classes.tag]: item.details.kind === 'tag' })}>
                {item.details.text}
              </span>
            </Typography>
          )
        }
      />
      <ListItemSecondaryAction>
        {item.actions.map((a, idx) => (
          <Tooltip key={idx} title={a.tooltip} enterDelay={800}>
            <IconButton onClick={a.onClick} classes={{ root: classes.actionButton }}>
              <ActIcon iconId={a.icon} />
            </IconButton>
          </Tooltip>
        ))}
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const WorkingHistory = (props: IWorkingHistory) => {
  const classes = useStyles();

  return (
    <>
      <List dense>
        <ListItem>
          <Typography variant="subtitle2">History</Typography>
        </ListItem>
        {!props.isEmpty && (
          <ListItem dense disableGutters classes={{ root: classes.mergeItem }}>
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
              <WorkingHistoryItem key={item.id} {...item} />
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
    </>
  );
};

export type TIcon = 'remove' | 'copy';
export type TAction = { icon: TIcon; onClick: () => void; tooltip: string };
export type TDetails = { kind: 'tag' | 'label-text'; label: string; text: string };

export type TWorkingHistoryItem = {
  id: string;
  title: Array<{ text: string; color?: string }>;
  isLoading: boolean;
  error?: string;
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
