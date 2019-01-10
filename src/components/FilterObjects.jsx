import React from 'react';
import { compose, withHandlers, mapProps } from 'recompose';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { withStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react';

import config from '../config.json';

const styles = theme => ({
  checkbox: {
    height: '36px',
    width: '48px'
  },
  ...Object.keys(config.objectColors)
    .map(name => ({
      [name]: {
        color: config.objectColors[name]
      }
    }))
    .reduce((acc, x) => Object.assign({}, acc, x), {})
});

const FilterObjectsComp = ({ objectTypes, onChange, classes }) => (
  <FormGroup>
    <FormLabel>Filter objects</FormLabel>
    {objectTypes.map(({ name, id, checked }) => (
      <FormControlLabel
        key={id}
        classes={{
          label: classes[name]
        }}
        control={
          <Checkbox
            classes={{
              root: classes.checkbox
            }}
            disableRipple
            checked={checked}
            onChange={e => onChange(id, e.target.checked)}
          />
        }
        label={name}
      />
    ))}
  </FormGroup>
);

export default compose(
  mapProps(({ value, onChange }) => ({
    onChange,
    objectTypes: value
  })),
  withHandlers({
    onChange: ({ objectTypes, onChange }) => (id, value) => {
      const newCheckedObjectTypes = objectTypes.map(objectType => {
        if (objectType.id === id) {
          return Object.assign({}, objectType, {
            checked: value
          });
        }
        return objectType;
      });
      onChange(newCheckedObjectTypes);
    }
  }),
  withStyles(styles),
  observer
)(FilterObjectsComp);
