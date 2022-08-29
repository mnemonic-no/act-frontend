import React from 'react';
import { TActionButton } from '../core/types';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

const ActionButton = (props: TActionButton) => {
  return <Tooltip title={props.tooltip || ""} enterDelay={500}>
    <Button size="small" variant="outlined" onClick={props.onClick} href={props.href}>
      {props.text}
    </Button>
  </Tooltip>
}

export default ActionButton;
