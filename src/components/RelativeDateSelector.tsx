import React, { useState } from 'react';
import { compose, withState, withProps, branch } from 'recompose';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import CheckIcon from '@material-ui/icons/Check';
import Divider from '@material-ui/core/Divider';
import Dialog from '@material-ui/core/Dialog';
import subHours from 'date-fns/subHours';
import subWeeks from 'date-fns/subWeeks';
import subMonths from 'date-fns/subMonths';
import formatDate from 'date-fns/format';
import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import { withStyles, WithStyles, createStyles, Theme } from '@material-ui/core';

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

const styles = (theme: Theme) =>
  createStyles({
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
      marginRight: theme.spacing.unit
    },
    checkIconPlaceholder: {
      width: 24,
      marginRight: theme.spacing.unit
    },
    listItem: {
      paddingLeft: theme.spacing.unit,
      paddingRight: theme.spacing.unit
    },
    optionText: {
      paddingLeft: 0
    },
    datePicker: {
      fontFamily: theme.typography.fontFamily
    }
  });

const RelativeDateSelectorComp = ({
  open,
  setOpen,
  defaultValue,
  value,
  onChange,
  classes,
  datePickerOpen,
  setDatePickerOpen
}: IRelativeDateSelectorComp) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

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
          {value instanceof Date ? formatDate(value, 'MMM D, YYYY') : value}
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
                setOpen(false, () => onChange(option));
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

interface IRelativeDateSelectorComp extends WithStyles<typeof styles> {
  open: boolean;
  setOpen: (x: boolean, fn?: () => void) => void;
  defaultValue: any;
  value: any;
  onChange: (x: any) => void;
  datePickerOpen: boolean;
  setDatePickerOpen: (x: boolean) => void;
}

export default compose<
  IRelativeDateSelectorComp,
  Omit<
    IRelativeDateSelectorComp,
    'classes' | 'defaultValue' | 'open' | 'setOpen' | 'datePickerOpen' | 'setDatePickerOpen'
  >
>(
  withProps({ defaultValue: 'Any time' }),
  branch(
    ({ value, onChange }: { value: any; onChange: () => void }) => !(value && onChange),
    withState('value', 'onChange', ({ defaultValue }: any) => defaultValue)
  ),
  withState('open', 'setOpen', false),
  withState('datePickerOpen', 'setDatePickerOpen', false),
  withStyles(styles)
)(RelativeDateSelectorComp);