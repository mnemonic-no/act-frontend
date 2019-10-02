import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, MenuItem, TextField } from '@material-ui/core';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import LockIcon from '@material-ui/icons/Lock';
import GroupIcon from '@material-ui/icons/Group';

const useStyles = makeStyles(() => ({
  menuItemIcon: {
    marginTop: -4,
    marginBottom: -4
  }
}));

const AccessModeSelectorComp = ({ onChange, value, ...rest }: IAccessModeSelectorComp) => {
  const classes = useStyles();

  return (
    <TextField
      label="Access mode"
      onChange={e => onChange(e.target.value)}
      value={value}
      select
      SelectProps={{ native: false }}
      {...rest}>
      <MenuItem value={'Public'}>
        <LockOpenIcon className={classes.menuItemIcon} />
        &nbsp;Public
      </MenuItem>
      <MenuItem value={'RoleBased'}>
        <GroupIcon className={classes.menuItemIcon} />
        &nbsp;Role Based
      </MenuItem>
      <MenuItem value={'Explicit'} disabled>
        <LockIcon className={classes.menuItemIcon} />
        &nbsp;Explicit
      </MenuItem>
    </TextField>
  );
};

interface IAccessModeSelectorComp {
  onChange: (value: string) => void;
  value: string;
  [key: string]: any;
}

export default observer(AccessModeSelectorComp);
