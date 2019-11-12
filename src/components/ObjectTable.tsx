import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';

import { ActObject } from '../core/types';
import { objectTypeToColor, renderObjectValue } from '../util/util';

export type ColumnKind = 'objectType' | 'objectValue';

export type SortOrder = {
  order: 'asc' | 'desc';
  orderBy: ColumnKind;
};

export interface IObjectRow {
  actObject: ActObject;
  isSelected?: boolean;
  label?: string;
  onRowClick?: (object: ActObject) => void;
  onCheckboxClick?: (obj: ActObject) => void;
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

const ObjectRowComp = ({ actObject, label, onRowClick, onCheckboxClick, isSelected }: IObjectRow) => {
  const classes = useStyles();

  const objectValueString = renderObjectValue(actObject, 256);

  return (
    <TableRow
      hover
      selected={isSelected}
      classes={{ root: classes.row }}
      onClick={onRowClick && (() => onRowClick(actObject))}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={Boolean(isSelected)}
          onClick={
            onCheckboxClick &&
            (e => {
              e.stopPropagation();
              onCheckboxClick(actObject);
            })
          }
        />
      </TableCell>
      <TableCell classes={{ root: classes.cell }} size="small">
        <span style={{ color: objectTypeToColor(actObject.type.name) }}>{actObject.type.name}</span>
      </TableCell>
      <TableCell classes={{ root: classes.cell }} size="small">
        {label ? (
          <Tooltip title={'Value: ' + objectValueString} enterDelay={500}>
            <span>{label}</span>
          </Tooltip>
        ) : (
          <span>{objectValueString}</span>
        )}
      </TableCell>
    </TableRow>
  );
};

const columns: Array<{ label: string; kind: ColumnKind }> = [
  { label: 'Type', kind: 'objectType' },
  { label: 'Value', kind: 'objectValue' }
];

const ObjectTableComp = ({
  rows,
  sortOrder,
  onRowClick,
  onCheckboxClick,
  onSelectAllClick,
  onSortChange
}: IObjectTableComp) => {
  const classes = useStyles();
  const isSelectAll = rows.length === rows.filter(x => x.isSelected).length;

  return (
    <Table size="small">
      <TableHead>
        <TableRow classes={{ root: classes.row }}>
          <TableCell padding="checkbox">
            {onSelectAllClick && (
              <Checkbox checked={isSelectAll} onClick={onSelectAllClick} inputProps={{ 'aria-label': 'Select all' }} />
            )}
          </TableCell>
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
          <ObjectRowComp key={row.actObject.id} {...row} onRowClick={onRowClick} onCheckboxClick={onCheckboxClick} />
        ))}
      </TableBody>
    </Table>
  );
};

export interface IObjectTableComp {
  rows: Array<IObjectRow>;
  sortOrder: SortOrder;
  onSortChange: (ck: ColumnKind) => void;
  onRowClick: (obj: ActObject) => void;
  onSelectAllClick?: () => void;
  onCheckboxClick?: (obj: ActObject) => void;
}

export default observer(ObjectTableComp);
