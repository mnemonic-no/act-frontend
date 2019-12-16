import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import GroupByAccordionComp, { IGroupByAccordionComp } from '../../../components/GroupByAccordion';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  title: {
    paddingLeft: theme.spacing(1),
    paddingTop: theme.spacing(0.3)
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: theme.spacing(1.2),
    paddingRight: theme.spacing(1.5),
    paddingBottom: theme.spacing(1)
  },
  titleLink: {
    cursor: 'pointer',
    paddingLeft: theme.spacing(1)
  },
  sectionTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid ' + theme.palette.grey[300]
  },
  contentContainer: {
    minHeight: 0,
    flex: '1 0 300px',
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: theme.spacing(1),
    backgroundColor: theme.palette.grey[100]
  },
  factPaper: {
    marginBottom: theme.spacing(2)
  },
  actions: {
    flex: '0 0 auto',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  }
}));

const MultiSelectInformationComp = (props: IMultiSelectInformationComp) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.titleContainer}>
        <Typography variant="h6" className={classes.title}>
          {props.title}
        </Typography>
        <FormControlLabel
          label="Highlight"
          labelPlacement="start"
          control={<Switch onClick={props.onToggleFadeUnselected} checked={props.fadeUnselected} />}
        />
        <Tooltip title="Clear selection">
          <Button size="small" variant="outlined" onClick={props.onClearSelectionClick}>
            Clear
          </Button>
        </Tooltip>
      </div>
      <Divider />

      <div className={classes.contentContainer}>
        <Paper className={classes.factPaper}>
          <div className={classes.sectionTitle}>
            <Typography variant="subtitle1" onClick={props.factTitle.onClick} className={classes.titleLink}>
              {props.factTitle.text}
            </Typography>
            <IconButton onClick={props.factTitle.onClearClick}>
              <CloseIcon />
            </IconButton>
          </div>

          <List dense disablePadding>
            {props.factTypeLinks.map(({ text, onClick }) => {
              return (
                <ListItem key={text} button onClick={onClick}>
                  <ListItemText primary={<div>{text}</div>} />
                </ListItem>
              );
            })}
          </List>
        </Paper>

        <Paper>
          <div className={classes.sectionTitle}>
            <Typography variant="subtitle1" onClick={props.objectTitle.onClick} className={classes.titleLink}>
              {props.objectTitle.text}
            </Typography>

            <IconButton onClick={props.objectTitle.onClearClick}>
              <CloseIcon />
            </IconButton>
          </div>
          <GroupByAccordionComp {...props.objectTypeGroupByAccordion} />
        </Paper>
      </div>

      <Divider />
      <div className={classes.actions}>
        {props.actions.map(a => {
          return (
            <Tooltip key={a.text} title={a.tooltip}>
              <span>
                <Button onClick={a.onClick}>{a.text}</Button>
              </span>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};

export interface IMultiSelectInformationComp {
  title: string;
  fadeUnselected: boolean;
  onToggleFadeUnselected: () => void;
  factTitle: { text: string; onClick: () => void; onClearClick: () => void };
  factTypeLinks: Array<{ text: string; onClick: () => void }>;
  objectTitle: { text: string; onClick: () => void; onClearClick: () => void };
  objectTypeGroupByAccordion: IGroupByAccordionComp;
  onClearSelectionClick: () => void;
  actions: Array<{ text: string; tooltip: string; onClick: () => void }>;
}

export default observer(MultiSelectInformationComp);
