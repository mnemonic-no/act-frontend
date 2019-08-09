import React from 'react';
import { compose, lifecycle, branch } from 'recompose';
import TextField from '@material-ui/core/TextField';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import withObjectTypes from './withObjectTypes';

const styles = () => ({
  option: {
    backgroundColor: 'white'
  }
});

const ObjectTypeComp = ({ classes, data, value, onChange, fullWidth }: IObjectTypeComp) => (
  <TextField
    fullWidth={fullWidth}
    SelectProps={{
      native: true
    }}
    label="Object Type"
    value={value}
    onChange={e => onChange(e.target.value)}
    select>
    {data.map(({ id, name }: { id: string; name: string }) => (
      <option key={id} value={name} className={classes.option}>
        {name}
      </option>
    ))}
  </TextField>
);

interface IObjectTypeComp extends WithStyles<typeof styles> {
  data: any;
  value: any;
  onChange: (arg: string) => void;
  fullWidth: boolean;
}

export default compose<IObjectTypeComp, Omit<IObjectTypeComp, 'classes' | 'data'>>(
  branch(({ data }: any) => !data, withObjectTypes()),

  // Call onChange to set value if value === ""
  lifecycle({
    componentDidMount() {
      // @ts-ignore
      if (!this.props.value) {
        // @ts-ignore
        this.props.onChange(this.props.data[0].name);
      }
    }
  }),
  withStyles(styles)
)(ObjectTypeComp);
