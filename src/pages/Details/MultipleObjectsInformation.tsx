import React from 'react';
import { observer } from 'mobx-react';
import Typography from '@material-ui/core/Typography';
import {
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Theme
} from '@material-ui/core';
import { ActObject } from '../types';
import DeleteIcon from '@material-ui/icons/Delete';
import { objectTypeToColor, renderObjectValue } from '../../util/utils';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    paddingBottom: 0,
    height: `calc(100% - ${theme.spacing(3)}px)`
  }
}));

const MultipleObjectsInformationComp = ({ id, title, objects, onObjectClick }: IMultipleObjectsInformationComp) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Typography variant="h6">{title}</Typography>

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
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
};

export interface IMultipleObjectsInformationComp {
  id: string;
  title: string;
  objects: Array<ActObject>;
  onObjectClick: (obj: ActObject) => void;
}

export default observer(MultipleObjectsInformationComp);
