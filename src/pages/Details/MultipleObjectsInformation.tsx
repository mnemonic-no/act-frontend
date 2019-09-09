import React from 'react';
import { observer } from 'mobx-react';
import CloseIcon from '@material-ui/icons/Close';
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Theme,
  Tooltip,
  Typography
} from '@material-ui/core';

import { ActObject } from '../types';
import { objectTypeToColor, renderObjectValue } from '../../util/utils';

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(2),
    paddingBottom: 0,
    height: `calc(100% - ${theme.spacing(3)}px)`
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingRight: theme.spacing(2)
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

const MultipleObjectsInformationComp = ({
  title,
  objects,
  onObjectClick,
  onPruneObjectsClick,
  onClearSelectionClick
}: IMultipleObjectsInformationComp) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.titleContainer}>
        <Typography variant="h6">{title}</Typography>
        <Tooltip title="Clear selection">
          <Button size="small" variant="outlined" onClick={onClearSelectionClick}>
            Clear
          </Button>
        </Tooltip>
      </div>

      <div className={classes.objectList}>
        <List>
          {objects.map((object: ActObject) => {
            return (
              <ListItem
                key={object.id}
                dense
                button
                onClick={() => {
                  onObjectClick(object);
                }}>
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

export interface IMultipleObjectsInformationComp {
  id: string;
  title: string;
  objects: Array<ActObject>;
  onObjectClick: (obj: ActObject) => void;
  onPruneObjectsClick: () => void;
  onClearSelectionClick: () => void;
}

export default observer(MultipleObjectsInformationComp);
