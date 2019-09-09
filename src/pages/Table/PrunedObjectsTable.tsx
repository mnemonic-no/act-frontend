import React from 'react';
import { observer } from 'mobx-react';
import { ActObject } from '../types';
import { makeStyles, Theme } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TableBody from '@material-ui/core/TableBody';
import Table from '@material-ui/core/Table';
import { objectTypeToColor, renderObjectValue } from '../../util/utils';

export type ColumnKind = 'objectType' | 'objectValue';

export type SortOrder = {
  order: 'asc' | 'desc';
  orderBy: ColumnKind;
};

export interface IPrunedObjectRow {
  actObject: ActObject;
  title: string;
  onRowClick?: (object: ActObject) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: '100%'
  },
  header: {
    padding: '16px 10px 18px 80px',
    display: 'flex'
  },
  tableContainer: {
    overflowY: 'auto'
  },
  cell: {
    paddingLeft: theme.spacing(2)
  },
  row: {
    cursor: 'pointer',
    height: theme.spacing(4)
  }
}));

const PrunedObjectRowComp = ({ actObject, title, onRowClick }: IPrunedObjectRow) => {
  const classes = useStyles();

  return (
    <TableRow hover classes={{ root: classes.row }} onClick={onRowClick && (() => onRowClick(actObject))}>
      <TableCell classes={{ root: classes.cell }} size="small">
        <span style={{ color: objectTypeToColor(actObject.type.name) }}>{title}</span>
      </TableCell>
      <TableCell classes={{ root: classes.cell }} size="small">
        {renderObjectValue(actObject, 256)}
      </TableCell>
    </TableRow>
  );
};

const PrunedObjectsTableComp = ({
  rows,
  columns,
  sortOrder,
  onRowClick,
  onSortChange,
  onClearButtonClick
}: IPrunedObjectsTableComp) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Button variant="outlined" size="small" onClick={onClearButtonClick}>
          Unprune all
        </Button>
      </div>

      <div className={classes.tableContainer}>
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
            {rows.map((row: IPrunedObjectRow) => (
              <PrunedObjectRowComp key={row.actObject.id} {...row} onRowClick={onRowClick} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

interface IPrunedObjectsTableComp {
  rows: Array<any>;
  sortOrder: SortOrder;
  columns: Array<{ label: string; kind: ColumnKind }>;
  onSortChange: (ck: ColumnKind) => void;
  onClearButtonClick: () => void;
  onRowClick: (obj: ActObject) => void;
}

export default observer(PrunedObjectsTableComp);
