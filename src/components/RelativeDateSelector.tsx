import React, { useState } from 'react';
import { compose, withState, withProps, branch } from 'recompose';
import { Theme, makeStyles } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import CheckIcon from '@material-ui/icons/Check';
import DayPicker from 'react-day-picker';
import Dialog from '@material-ui/core/Dialog';
import Divider from '@material-ui/core/Divider';
import formatDate from 'date-fns/format';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import subHours from 'date-fns/subHours';
import subWeeks from 'date-fns/subWeeks';
import subMonths from 'date-fns/subMonths';
import Typography from '@material-ui/core/Typography';
import 'react-day-picker/lib/style.css';

const RELATIVE_OPTIONS = ['Any time', 'Hour ago', '24 hours ago', 'Week ago', 'Month ago'];

export const relativeStringToDate = (x: Date | string) => {
  if (x instanceof Date) {
    return x;
  }
  switch (x) {
    case 'Any time':
      return new Date();
    case 'Hour ago':
      return subHours(new Date(), 1);
    case '24 hours ago':
      return subHours(new Date(), 24);
    case 'Week ago':
      return subWeeks(new Date(), 1);
    case 'Month ago':
      return subMonths(new Date(), 1);
    default:
      throw new Error(`Cannot convert relativeDateString: ${x}`);
  }
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    // paddingTop: theme.spacing.unit,
    // paddingBottom: theme.spacing.unit
  },
  selector: {
    cursor: 'pointer'
  },
  arrowDown: {
    verticalAlign: 'middle',
    marginLeft: '-2px'
  },
  checkIcon: {
    marginRight: theme.spacing()
  },
  checkIconPlaceholder: {
    width: 24,
    marginRight: theme.spacing()
  },
  listItem: {
    paddingLeft: theme.spacing(),
    paddingRight: theme.spacing()
  },
  optionText: {
    paddingLeft: 0
  },
  datePicker: {
    fontFamily: theme.typography.fontFamily
  }
}));

const RelativeDateSelectorComp = ({ defaultValue, value, onChange }: IRelativeDateSelectorComp) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  return (
    <div className={classes.root}>
      <div
        onClick={() => {
          setOpen(true);
        }}
        ref={node => {
          setAnchorEl(node);
        }}
        className={classes.selector}>
        <Typography variant={value === defaultValue ? 'body2' : 'body1'}>
          {value instanceof Date ? formatDate(value, 'MMM d, yyyy') : value}
          <ArrowDropDown className={classes.arrowDown} />
        </Typography>
      </div>

      <Popover
        {...{ open, anchorEl }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setOpen(false)}>
        <List>
          {RELATIVE_OPTIONS.map(option => (
            <ListItem
              className={classes.listItem}
              key={option}
              dense
              button
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}>
              {option === value && (
                <ListItemIcon classes={{ root: classes.checkIcon }}>
                  <CheckIcon />
                </ListItemIcon>
              )}
              {option !== value && <span className={classes.checkIconPlaceholder} />}
              <ListItemText classes={{ root: classes.optionText }} primary={option} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem className={classes.listItem} dense button onClick={() => setDatePickerOpen(true)}>
            {value instanceof Date ? (
              <ListItemIcon classes={{ root: classes.checkIcon }}>
                <CheckIcon />
              </ListItemIcon>
            ) : (
              <span className={classes.checkIconPlaceholder} />
            )}
            <ListItemText classes={{ root: classes.optionText }} primary={'Custom date…'} />
          </ListItem>
        </List>
      </Popover>

      {/* Custom date dialog */}
      <Dialog
        open={datePickerOpen}
        onClose={() => {
          setDatePickerOpen(false);
          setOpen(false);
        }}>
        <DayPicker
          className={classes.datePicker}
          firstDayOfWeek={1}
          onDayClick={date => {
            setDatePickerOpen(false);
            setOpen(false);
            onChange(date);
          }}
          selectedDays={value instanceof Date ? value : undefined}
        />
      </Dialog>
    </div>
  );
};

interface IRelativeDateSelectorComp {
  defaultValue: any;
  value: any;
  onChange: (x: any) => void;
}

export default compose<
  IRelativeDateSelectorComp,
  Omit<IRelativeDateSelectorComp, 'defaultValue' | 'open' | 'setOpen' | 'datePickerOpen' | 'setDatePickerOpen'>
>(
  withProps({ defaultValue: 'Any time' }),
  branch(
    ({ value, onChange }: { value: any; onChange: () => void }) => !(value && onChange),
    withState('value', 'onChange', ({ defaultValue }: any) => defaultValue)
  )
)(RelativeDateSelectorComp);
