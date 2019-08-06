import React from 'react';
import { observer } from 'mobx-react';
import { compose } from 'recompose';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core';

import { ActFact } from '../types';
import { factColor } from '../../util/utils';
import config from '../../config';
import Tooltip from '@material-ui/core/Tooltip';

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
  key: string;
  fact: ActFact;
  isSelected: boolean;
  cells: Array<{ text: string; kind: ColumnKind }>;
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      overflowY: 'scroll',
      overflowX: 'scroll',
      height: '100%'
    },
    headerCell: {
      paddingLeft: theme.spacing.unit * 2
    },
    cell: {
      paddingLeft: theme.spacing.unit * 2
    },
    row: {
      cursor: 'pointer',
      height: theme.spacing.unit * 4
    },
    header: {
      padding: '0 10px 4px 0',
      display: 'flex',
      flexDirection: 'row-reverse'
    },
    wordBreak: {
      wordBreak: 'break-all'
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
  });

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

const FactRowComp = ({ key, fact, cells, isSelected, onRowClick, classes }: IFactRowComp) => (
  <TableRow key={key} hover selected={isSelected} classes={{ root: classes.row }} onClick={() => onRowClick(fact)}>
    {cells.map((cell: any, idx: number) => (
      <TableCell key={idx} className={cellClassNames(cell, classes)} padding="dense">
        {cell.text}
      </TableCell>
    ))}
  </TableRow>
);

interface IFactRowComp extends FactRow, WithStyles<typeof styles> {
  onRowClick: (f: ActFact) => void;
}

export const ActFactRow = compose<IFactRowComp, Omit<IFactRowComp, 'classes'>>(
  withStyles(styles),
  observer
)(FactRowComp);

const FactsTableComp = ({
  rows,
  columns,
  sortOrder,
  onSortChange,
  onRowClick,
  onExportClick,
  classes
}: IFactsTableComp) => (
  <div className={classes.root}>
    <div className={classes.header}>
      <Button variant="outlined" size="small" onClick={onExportClick}>
        Export to CSV
      </Button>
    </div>

    <div style={{ overflowY: 'scroll' }}>
      <Table>
        <TableHead>
          <TableRow classes={{ root: classes.row }}>
            {columns.map(({ label, kind, tooltip }) => (
              <TableCell key={kind} classes={{ root: classes.headerCell }} padding="dense">
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
            <ActFactRow {...row} onRowClick={fact => onRowClick(fact)} />
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

interface IFactsTableComp extends WithStyles<typeof styles> {
  rows: Array<FactRow>;
  columns: Array<{ label: string; kind: ColumnKind; tooltip?: string }>;
  sortOrder: SortOrder;
  onSortChange: (n: ColumnKind) => void;
  onRowClick: (f: ActFact) => void;
  onExportClick: () => void;
}

export default compose<IFactsTableComp, Omit<IFactsTableComp, 'classes'>>(
  withStyles(styles),
  observer
)(FactsTableComp);
