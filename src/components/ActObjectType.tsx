import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

import { NamedId } from '../core/types';

const useStyles = makeStyles(() => ({
  option: {
    backgroundColor: 'white'
  }
}));

const ActObjectTypeComp = ({ objectTypes, value, onChange, fullWidth }: IActObjectTypeComp) => {
  const classes = useStyles();

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
      {objectTypes.map(({ id, name }: NamedId) => (
        <option key={id} value={name} className={classes.option}>
          {name}
        </option>
      ))}
    </TextField>
  );
};

interface IActObjectTypeComp {
  value: string;
  objectTypes: Array<NamedId>;
  onChange: (arg: string) => void;
  fullWidth: boolean;
}

export default observer(ActObjectTypeComp);
