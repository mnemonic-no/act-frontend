import React from 'react';
import { compose } from 'recompose';
import { createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import LockIcon from '@material-ui/icons/Lock';
import GroupIcon from '@material-ui/icons/Group';
import { observer } from 'mobx-react';

const styles = () =>
  createStyles({
    menuItemIcon: {
      marginTop: -4,
      marginBottom: -4
    }
  });

const AccessModeSelectorComp = ({ classes, onChange, value, ...rest }: IAccessModeSelectorComp) => (
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

interface IAccessModeSelectorComp extends WithStyles<typeof styles> {
  onChange: Function;
  value: string;
  [key: string]: any;
}

export default compose<IAccessModeSelectorComp, Omit<IAccessModeSelectorComp, 'classes'>>(
  withStyles(styles),
  observer
)(AccessModeSelectorComp);
