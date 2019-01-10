import React from 'react';
import { compose, lifecycle, branch } from 'recompose';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import withObjectTypes from './withObjectTypes';

const styles = () => ({
  option: {
    backgroundColor: 'white'
  }
});

const ObjectTypeComp = ({ classes, data, value, onChange, fullWidth }) => (
  <TextField
    fullWidth={fullWidth}
    SelectProps={{
      native: true
    }}
    label='Object Type'
    value={value}
    onChange={e => onChange(e.target.value)}
    select
  >
    {data.map(({ id, name }) => (
      <option key={id} value={name} className={classes.option}>
        {name}
      </option>
    ))}
  </TextField>
);

export default compose(
  branch(({ data }) => !data, withObjectTypes()),

  // Call onChange to set value if value === ""
  lifecycle({
    componentDidMount () {
      if (!this.props.value) {
        this.props.onChange(this.props.data[0].name);
      }
    }
  }),
  withStyles(styles)
)(ObjectTypeComp);
