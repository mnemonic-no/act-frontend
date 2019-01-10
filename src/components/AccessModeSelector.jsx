import React from 'react';
import { compose } from 'recompose';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import LockIcon from '@material-ui/icons/Lock';
import GroupIcon from '@material-ui/icons/Group';

const styles = () => ({
  menuItemIcon: {
    marginTop: -4,
    marginBottom: -4
  }
});

const AccessModeSelectorComp = ({ classes, onChange, value, ...rest }) => (
  <TextField
    label='Access mode'
    onChange={e => onChange(e.target.value)}
    value={value}
    select
    {...rest}
  >
    <MenuItem value='Public'>
      <LockOpenIcon className={classes.menuItemIcon} />&nbsp;Public
    </MenuItem>
    <MenuItem value='RoleBased'>
      <GroupIcon className={classes.menuItemIcon} />&nbsp;Role Based
    </MenuItem>
    <MenuItem disabled value='Explicit'>
      <LockIcon className={classes.menuItemIcon} />&nbsp;Explicit
    </MenuItem>
  </TextField>
);

export default compose(withStyles(styles))(AccessModeSelectorComp);
