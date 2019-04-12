import React from 'react';
import { compose } from 'recompose';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { withStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react';

import config from '../../config';
import {ObjectTypeFilter} from "../RefineryStore";

// @ts-ignore
const styles = theme => ({
  checkbox: {
    height: '36px',
    width: '48px'
  },
  ...Object.keys(config.objectColors)
    .map(name => ({
        // @ts-ignore
      [name]: {color: config.objectColors[name]}
    }))
    .reduce((acc, x) => Object.assign({}, acc, x), {})
});

const FilterObjectsComp = ({ objectTypeFilters, onChange, classes } : {objectTypeFilters: Array<ObjectTypeFilter>, onChange: Function, classes: any}) => (
  <FormGroup>
    <FormLabel>Filter objects</FormLabel>
    {objectTypeFilters.map((objectTypeFilter) => (
      <FormControlLabel
        key={objectTypeFilter.id}
        classes={{
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

export default compose(
  withStyles(styles),
  observer
    // @ts-ignore
)(FilterObjectsComp);
