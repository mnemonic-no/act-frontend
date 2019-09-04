import React from 'react';
import { observer } from 'mobx-react';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles, Theme } from '@material-ui/core';

import { ActFact } from '../types';
import { factColor } from '../../util/utils';
import config from '../../config';

export type ColumnKind =
  | 'sourceType'
  | 'sourceValue'
  | 'factType'
  | 'factValue'
  | 'destinationType'
  | 'destinationValue'
  | 'isBidirectional'
  | 'isOneLegged'
  | 'isRetracted';

export type SortOrder = {
  order: 'asc' | 'desc';
  orderBy: ColumnKind;
};

export type FactRow = {
  id: string;
  fact: ActFact;
  isSelected: boolean;
  cells: Array<{ text: string; kind: ColumnKind }>;
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    overflow: 'auto',
    height: '100%'
  },
  header: {
    padding: '16px 10px 18px 0',
    display: 'flex',
    flexDirection: 'row-reverse'
  },
  tableContainer: {
    overflowY: 'auto'
  },
  headerCell: {
    paddingLeft: theme.spacing(2)
  },
  cell: {
    paddingLeft: theme.spacing(2)
  },
  row: {
    cursor: 'pointer',
    height: theme.spacing(4)
  },
  wordBreak: {
    wordBreak: 'break-word'
  },
  factType: {
    color: factColor
  },
  ...Object.keys(config.objectColors)
    .map(name => ({
      [name]: {
        // @ts-ignore
        color: config.objectColors[name]
      }
    }))
    .reduce((acc, x) => Object.assign({}, acc, x), {})
}));

const cellClassNames = ({ kind, text }: { kind: ColumnKind; text: string }, classes: any) => {
  switch (kind) {
    case 'sourceType':
      const sourceType = classes[text] ? classes[text] : '';
      return `${classes.cell} ${sourceType}`;
    case 'sourceValue':
      return `${classes.cell} ${classes.wordBreak}`;
    case 'factType':
      return `${classes.cell} ${classes.factType}`;
    case 'factValue':
      return classes.cell;
    case 'destinationType':
      const destinationType = classes[text] ? classes[text] : '';
      return `${classes.cell} ${destinationType}`;
    case 'destinationValue':
      return `${classes.cell} ${classes.wordBreak}`;
    case 'isRetracted':
      return `${classes.cell}`;
    case 'isBidirectional':
      return classes.cell;
    case 'isOneLegged':
      return classes.cell;
    default:
      // eslint-disable-next-line
      const _exhaustiveCheck: never = kind;
  }
};

const FactRowComp = ({ fact, cells, isSelected, onRowClick }: IFactRowComp) => {
  const classes = useStyles();

  return (
    <TableRow hover selected={isSelected} classes={{ root: classes.row }} onClick={() => onRowClick(fact)}>
      {cells.map((cell: any, idx: number) => (
        <TableCell key={idx} className={cellClassNames(cell, classes)} size="small">
          {cell.text}
        </TableCell>
      ))}
    </TableRow>
  );
};

interface IFactRowComp extends FactRow {
  onRowClick: (f: ActFact) => void;
}

export const ActFactRow = observer(FactRowComp);

const FactsTableComp = ({ rows, columns, sortOrder, onSortChange, onRowClick, onExportClick }: IFactsTableComp) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Button variant="outlined" size="small" onClick={onExportClick}>
          Export to CSV
        </Button>
      </div>

      <div className={classes.tableContainer}>
        <Table>
          <TableHead>
            <TableRow classes={{ root: classes.row }}>
              {columns.map(({ label, kind, tooltip }) => (
                <TableCell key={kind} classes={{ root: classes.headerCell }} size="small">
                  <Tooltip title={tooltip || ''}>
                    <TableSortLabel
                      onClick={() => onSortChange(kind)}
                      direction={sortOrder.order}
                      active={sortOrder.orderBy === kind}>
                      {label}
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
              <ActFactRow key={row.id} {...row} onRowClick={fact => onRowClick(fact)} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

interface IFactsTableComp {
  rows: Array<FactRow>;
  columns: Array<{ label: string; kind: ColumnKind; tooltip?: string }>;
  sortOrder: SortOrder;
  onSortChange: (n: ColumnKind) => void;
  onRowClick: (f: ActFact) => void;
  onExportClick: () => void;
}

export default observer(FactsTableComp);
