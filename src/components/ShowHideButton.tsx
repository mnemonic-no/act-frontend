import React from 'react';
import cc from 'clsx';
import { makeStyles, Theme } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

const useStyles = makeStyles((theme: Theme) => ({
  common: {
    background: theme.palette.common.white,
    borderColor: theme.palette.divider,
    borderStyle: 'solid',
    position: 'absolute',
    zIndex: 99999
  },
  placement: (props: { placement: TPlacement; attachedTo: TAttachedTo }) => ({
    top: props.placement.top || undefined,
    bottom: props.placement.bottom || undefined,
    left: props.placement.left || undefined,
    right: props.placement.right || undefined
  }),
  borders: (props: { placement: TPlacement; attachedTo: TAttachedTo }) => {
    const borderConfig = {
      left: {
        borderTopLeftRadius: '10px',
        borderBottomLeftRadius: '10px',
        borderWidth: '1px 0 1px 1px'
      },
      right: {
        borderTopRightRadius: '10px',
        borderBottomRightRadius: '10px',
        borderWidth: '1px 1px 1px 0'
      },
      top: {
        borderBottomLeftRadius: '10px',
        borderBottomRightRadius: '10px',
        borderWidth: '0 1px 1px 1px'
      },
      bottom: {
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        borderWidth: '1px 1px 0 1px'
      }
    };

    return borderConfig[props.attachedTo];
  }
}));

const ArrowIcon = ({ attachedTo, isOpen }: any) => {
  if (attachedTo === 'left' && isOpen) {
    return <KeyboardArrowRightIcon />;
  }
  if (attachedTo === 'left' && !isOpen) {
    return <KeyboardArrowLeftIcon />;
  }
  if (attachedTo === 'right' && isOpen) {
    return <KeyboardArrowLeftIcon />;
  }
  if (attachedTo === 'right' && !isOpen) {
    return <KeyboardArrowRightIcon />;
  }
  if (attachedTo === 'top' && isOpen) {
    return <KeyboardArrowUpIcon />;
  }
  if (attachedTo === 'top' && !isOpen) {
    return <KeyboardArrowDownIcon />;
  }
  if (attachedTo === 'bottom' && isOpen) {
    return <KeyboardArrowDownIcon />;
  }
  if (attachedTo === 'bottom' && !isOpen) {
    return <KeyboardArrowUpIcon />;
  }
  return <KeyboardArrowDownIcon />;
};

const ShowHideButton = (props: IShowHideButton) => {
  const classes = useStyles({ attachedTo: props.attachedTo, placement: props.placement });

  return (
    <div className={cc(classes.common, classes.placement, classes.borders)}>
      <IconButton onClick={props.onClick}>
        <ArrowIcon attachedTo={props.attachedTo} isOpen={props.isOpen} />
      </IconButton>
    </div>
  );
};

export type TAttachedTo = 'left' | 'right' | 'top' | 'bottom';
export type TPlacement = { top?: any; bottom?: any; right?: any; left?: any };

export interface IShowHideButton {
  onClick: () => void;
  attachedTo: TAttachedTo;
  placement: TPlacement;
  isOpen: boolean;
}

export default ShowHideButton;
