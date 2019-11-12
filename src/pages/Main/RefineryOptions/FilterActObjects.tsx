import React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import { observer } from 'mobx-react';

import config from '../../../config';
import { ObjectTypeFilter } from '../../../core/types';

const useStyles = makeStyles((theme: Theme) => ({
  checkbox: {
    height: '36px',
    width: '48px',
    padding: theme.spacing(0.5)
  },
  ...Object.keys(config.objectColors)
    .map(name => ({
      // @ts-ignore
      [name]: { color: config.objectColors[name] }
    }))
    .reduce((acc, x) => Object.assign({}, acc, x), {})
}));

const FilterObjectsComp = ({ objectTypeFilters, onChange }: IFilterObjectsComp) => {
  const classes = useStyles();
  return (
    <FormGroup>
      <FormLabel>Filter objects</FormLabel>
      {objectTypeFilters.map(objectTypeFilter => (
        <FormControlLabel
          key={objectTypeFilter.id}
          classes={{
            // @ts-ignore
            label: classes[objectTypeFilter.name]
          }}
          control={
            <Checkbox
              classes={{
                root: classes.checkbox
              }}
              disableRipple
              checked={objectTypeFilter.checked}
              onChange={e => onChange(objectTypeFilter, e.target.checked)}
            />
          }
          label={objectTypeFilter.name}
        />
      ))}
    </FormGroup>
  );
};

interface IFilterObjectsComp {
  objectTypeFilters: Array<ObjectTypeFilter>;
  onChange: Function;
}

export default observer(FilterObjectsComp);
