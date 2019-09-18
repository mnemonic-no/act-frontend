import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TableBody from '@material-ui/core/TableBody';
import Table from '@material-ui/core/Table';

import { ActObject } from '../pages/types';
import { objectTypeToColor, renderObjectValue } from '../util/utils';

export type ColumnKind = 'objectType' | 'objectValue';

export type SortOrder = {
  order: 'asc' | 'desc';
  orderBy: ColumnKind;
};

export interface IObjectRow {
  actObject: ActObject;
  onRowClick?: (object: ActObject) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  cell: {
    paddingLeft: theme.spacing(2)
  },
  row: {
    cursor: 'pointer',
    height: theme.spacing(4)
  }
}));

const ObjectRowComp = ({ actObject, onRowClick }: IObjectRow) => {
  const classes = useStyles();

  return (
    <TableRow hover classes={{ root: classes.row }} onClick={onRowClick && (() => onRowClick(actObject))}>
      <TableCell classes={{ root: classes.cell }} size="small">
        <span style={{ color: objectTypeToColor(actObject.type.name) }}>{actObject.type.name}</span>
      </TableCell>
      <TableCell classes={{ root: classes.cell }} size="small">
        {renderObjectValue(actObject, 256)}
      </TableCell>
    </TableRow>
  );
};

const columns: Array<{ label: string; kind: ColumnKind }> = [
  { label: 'Type', kind: 'objectType' },
  { label: 'Value', kind: 'objectValue' }
];

const ObjectTableComp = ({ rows, sortOrder, onRowClick, onSortChange }: IObjectTableComp) => {
  const classes = useStyles();

  return (
    <Table>
      <TableHead>
        <TableRow classes={{ root: classes.row }}>
          {columns.map(({ label, kind }) => (
            <TableCell key={kind} classes={{ root: classes.cell }} size="small">
              <TableSortLabel
                onClick={() => onSortChange(kind)}
                direction={sortOrder.order}
                active={sortOrder.orderBy === kind}>
                {label}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row: IObjectRow) => (
          <ObjectRowComp key={row.actObject.id} {...row} onRowClick={onRowClick} />
        ))}
      </TableBody>
    </Table>
  );
};

interface IObjectTableComp {
  rows: Array<IObjectRow>;
  sortOrder: SortOrder;
  onSortChange: (ck: ColumnKind) => void;
  onRowClick: (obj: ActObject) => void;
}

export default observer(ObjectTableComp);
