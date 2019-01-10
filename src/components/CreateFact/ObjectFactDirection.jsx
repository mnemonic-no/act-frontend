import React from 'react';
import {
  compose,
  withState,
  lifecycle,
  shallowEqual,
  withHandlers,
  onlyUpdateForKeys
} from 'recompose';
import Grid from '@material-ui/core/Grid';

import TextField from '@material-ui/core/TextField';
import ObjectType from '../ObjectType';
import ObjectValueAutosuggest from '../ObjectValueAutosuggest';

const ObjectFactDirectionComp = ({
  objectTypes,
  onChange,
  value,
  objectValueRefFunc,
  directionRef
}) => (
  <Grid container spacing={16}>
    <Grid item xs={4}>
      <ObjectType
        onChange={x =>
          onChange({ objectType: objectTypes.find(y => y.name === x) })
        }
        data={objectTypes}
        value={value.objectType.name}
      />
    </Grid>
    <Grid item xs={4}>
      <ObjectValueAutosuggest
        label={'Object value'}
        value={value.objectValue}
        objectType={value.objectType.name}
        onChange={x => onChange({ objectValue: x })}
        inputRef={objectValueRefFunc}
      />
    </Grid>
    <Grid item xs={4}>
      <TextField
        inputRef={directionRef}
        label='Direction'
        select
        SelectProps={{ native: true }}
        value={value.direction}
        onChange={e => onChange({ direction: e.target.value })}
      >
        {value.objectType.directions.map(x => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </TextField>
    </Grid>
  </Grid>
);

export default compose(
  withState('objectValueRef', 'objectValueRefFunc', null),
  withHandlers({
    onChange: ({ value, onChange, objectValueRef }) => newValue => {
      const newValue2 = { ...value, ...newValue };

      // Clear value if objectType name has changed
      if (value.objectType.name !== newValue2.objectType.name) {
        newValue2.objectValue = '';
        objectValueRef.focus();
      }

      // Reset direction if incompatible
      if (newValue2.objectType.directions.indexOf(newValue2.direction) < 0) {
        newValue2.direction = newValue2.objectType.directions[0];
      }

      onChange(newValue2);
    }
  }),
  lifecycle({
    componentDidUpdate (prevProps) {
      if (!shallowEqual(prevProps.objectTypes, this.props.objectTypes)) {
        const newObjectType = this.props.objectTypes.find(
          x => x.name === this.props.value.objectType.name
        );
        if (newObjectType) {
          this.props.onChange({ objectType: newObjectType });
        } else {
          this.props.onChange({ objectType: this.props.objectTypes[0] });
        }
      }
    }
  }),
  onlyUpdateForKeys(['value', 'objectTypes'])
)(ObjectFactDirectionComp);
