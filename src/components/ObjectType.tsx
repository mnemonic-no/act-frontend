import React, { useEffect } from 'react';
import { compose, branch } from 'recompose';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import withObjectTypes from './withObjectTypes';

const useStyles = makeStyles(() => ({
  option: {
    backgroundColor: 'white'
  }
}));

const ObjectTypeComp = ({ data, value, onChange, fullWidth }: IObjectTypeComp) => {
  const classes = useStyles();

  useEffect(() => {
    // Call onChange to set value if value === ""
    if (!value) {
      // @ts-ignore
      onChange(data[0].name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
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
};

interface IObjectTypeComp {
  data: any;
  value: any;
  onChange: (arg: string) => void;
  fullWidth: boolean;
}

export default compose<IObjectTypeComp, Omit<IObjectTypeComp, 'data'>>(
  branch(({ data }: any) => !data, withObjectTypes())
)(ObjectTypeComp);
