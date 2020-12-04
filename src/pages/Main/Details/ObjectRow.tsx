import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import { renderObjectValue } from '../../../util/util';
import { ActObject } from '../../../core/types';

const useStyles = makeStyles((theme: Theme) => ({
  cell: {
    paddingLeft: theme.spacing(2)
  },
  cellValue: {
    wordBreak: 'break-word'
  },
  row: {
    cursor: 'pointer',
    height: theme.spacing(4)
  }
}));

const ObjectRowComp = ({ onRowClick, object, color }: IOBjectRowComp) => {
  const classes = useStyles();
  return (
    <TableRow key={object.id} hover classes={{ root: classes.row }} onClick={() => onRowClick(object)}>
      <TableCell classes={{ root: classes.cell }} size="small">
        <span style={{ color: color }}>{object.type.name}</span>
      </TableCell>
      <TableCell classes={{ root: `${classes.cell} ${classes.cellValue}` }} size="small">
        {renderObjectValue(object, 256)}
      </TableCell>
    </TableRow>
  );
};

interface IOBjectRowComp {
  object: ActObject;
  color: string;
  onRowClick: (o: ActObject) => void;
}

export const ObjectRow = observer(ObjectRowComp);
