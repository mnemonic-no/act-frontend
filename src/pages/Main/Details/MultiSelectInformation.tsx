import React from 'react';
import { observer } from 'mobx-react';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme } from '@material-ui/core/styles';

import { ActObject } from '../../../core/types';
import { objectTypeToColor, renderObjectValue } from '../../../util/util';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingBottom: 0,
    height: `calc(100% - ${theme.spacing(3)}px)`
  },
  title: {
    paddingTop: '2px'
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(1)
  },
  titleLink: {
    cursor: 'pointer'
  },
  objectList: {
    minHeight: 0,
    flex: '1 0 300px',
    overflowY: 'auto'
  },
  actions: {
    flex: '0 0 auto',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  }
}));

const MultiSelectInformationComp = ({
  title,
  factTitle,
  factTypeLinks,
  objectTitle,
  objects,
  fadeUnselected,
  onToggleFadeUnselected,
  onObjectClick,
  onPruneObjectsClick,
  onClearSelectionClick
}: IMultiSelectInformationComp) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.titleContainer}>
        <Typography variant="h6" className={classes.title}>
          {title}
        </Typography>
        <FormControlLabel
          label="Highlight"
          labelPlacement="start"
          control={<Switch onClick={onToggleFadeUnselected} checked={fadeUnselected} />}
        />
        <Tooltip title="Clear selection">
          <Button size="small" variant="outlined" onClick={onClearSelectionClick}>
            Clear
          </Button>
        </Tooltip>
      </div>
      <Typography variant="subtitle1" onClick={factTitle.onClick} className={classes.titleLink}>
        {factTitle.text}
      </Typography>
      <List dense disablePadding>
        {factTypeLinks.map(({ text, onClick }) => {
          return (
            <ListItem key={text} button onClick={onClick}>
              <ListItemText primary={<div>{text}</div>} />
            </ListItem>
          );
        })}
      </List>
      <Typography variant="subtitle1" onClick={objectTitle.onClick} className={classes.titleLink}>
        {objectTitle.text}
      </Typography>
      <div className={classes.objectList}>
        <List disablePadding>
          {objects.map((object: ActObject) => {
            return (
              <ListItem key={object.id} dense>
                <ListItemText
                  primary={
                    <div>
                      <span style={{ color: objectTypeToColor(object.type.name) }}>{object.type.name + ' '}</span>
                      <span>{renderObjectValue(object, 20)}</span>
                    </div>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="delete" onClick={() => onObjectClick(object)}>
                    <CloseIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </div>
      <div className={classes.actions}>
        <Tooltip title="Prune the selected objects from the view">
          <span>
            <Button onClick={onPruneObjectsClick}>Prune objects</Button>
          </span>
        </Tooltip>
      </div>
    </div>
  );
};

export interface IMultiSelectInformationComp {
  title: string;
  fadeUnselected: boolean;
  onToggleFadeUnselected: () => void;
  factTitle: { text: string; onClick: () => void };
  factTypeLinks: Array<{ text: string; onClick: () => void }>;
  objectTitle: { text: string; onClick: () => void };
  objects: Array<ActObject>;
  onObjectClick: (obj: ActObject) => void;
  onPruneObjectsClick: () => void;
  onClearSelectionClick: () => void;
}

export default observer(MultiSelectInformationComp);
