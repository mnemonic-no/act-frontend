import React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import ActIcon from './ActIcon';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  extensionPanelRoot: {
    margin: '1px 0 !important',
    boxShadow: 'none !important',
    '&:last-child': {
      boxShadow: theme.shadows['1']
    },
    '&:before': {
      opacity: '1 !important' as any
    }
  },
  expansionPanelSummary: {
    padding: theme.spacing(0, 1)
  },
  expansionPanelSummaryTitle: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between'
  },
  expansionPanelDetails: {
    display: 'flex',
    flexFlow: 'column nowrap',
    padding: theme.spacing(1),
    paddingTop: 0
  },
  actions: {
    paddingBottom: theme.spacing(1),
    '& > *': {
      marginRight: theme.spacing(1)
    }
  },
  listItemText: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  }
}));

const GroupByAccordionComp = (props: IGroupByAccordionComp) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {props.groups.map(group => {
        return (
          <ExpansionPanel
            key={group.title.text}
            classes={{ root: classes.extensionPanelRoot }}
            expanded={Boolean(group.isExpanded)}
            onChange={() => props.onToggle(group)}>
            <ExpansionPanelSummary classes={{ root: classes.expansionPanelSummary }} expandIcon={<ExpandMoreIcon />}>
              <div className={classes.expansionPanelSummaryTitle}>
                <Typography variant={'body2'} style={{ color: group.title.color }}>
                  {group.title.text}
                </Typography>
                <Typography variant={'body2'}>{group.items.length}</Typography>
              </div>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails className={classes.expansionPanelDetails}>
              <div className={classes.actions}>
                {group.actions.map(action => {
                  return (
                    <Button key={action.text} variant="outlined" onClick={action.onClick}>
                      {action.text}
                    </Button>
                  );
                })}
              </div>
              <List disablePadding>
                {group.items.map(item => {
                  return (
                    <ListItem key={item.text} dense>
                      <ListItemText className={classes.listItemText}>{item.text}</ListItemText>

                      {item.iconAction && (
                        <ListItemSecondaryAction>
                          <Tooltip title={item.iconAction.tooltip} enterDelay={500}>
                            <IconButton edge="end" onClick={item.iconAction.onClick}>
                              <ActIcon iconId={item.iconAction.icon} />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  );
                })}
              </List>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        );
      })}
    </div>
  );
};

export interface IGroup {
  title: { text: string; color: string };
  isExpanded: boolean;
  actions: Array<{ text: string; onClick: () => void }>;
  items: Array<{ text: string; iconAction: { icon: string; tooltip: string; onClick: () => void } }>;
}

export interface IGroupByAccordionComp {
  onToggle: (group: IGroup) => void;
  groups: Array<IGroup>;
}

export default GroupByAccordionComp;
