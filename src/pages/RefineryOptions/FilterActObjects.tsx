import React from 'react';
import { compose } from 'recompose';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react';

import config from '../../config';
import { ObjectTypeFilter } from '../RefineryStore';

const styles = (theme: Theme) =>
  createStyles({
    checkbox: {
      height: '36px',
      width: '48px'
    },
    ...Object.keys(config.objectColors)
      .map(name => ({
        // @ts-ignore
        [name]: { color: config.objectColors[name] }
      }))
      .reduce((acc, x) => Object.assign({}, acc, x), {})
  });

const FilterObjectsComp = ({ objectTypeFilters, onChange, classes }: IFilterObjectsComp) => (
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

interface IFilterObjectsComp extends WithStyles<typeof styles> {
  objectTypeFilters: Array<ObjectTypeFilter>;
  onChange: Function;
}

export default compose<IFilterObjectsComp, Omit<IFilterObjectsComp, 'classes'>>(
  withStyles(styles),
  observer
)(FilterObjectsComp);
