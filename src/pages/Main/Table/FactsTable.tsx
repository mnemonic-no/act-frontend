import cc from 'clsx';
import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';

import { ActFact } from '../../../core/types';
import { factColor } from '../../../util/util';
import config from '../../../config';
import MultiSelect, { IMultiSelect } from '../../../components/MultiSelect';

export type ColumnKind =
  | 'timestamp'
  | 'lastSeenTimestamp'
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
  cells: Array<{ text: string; kind: ColumnKind; isFaded?: boolean }>;
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'column nowrap',
    overflow: 'auto'
  },
  header: {
    padding: '16px 10px 18px 55px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tableContainer: {
    overflow: 'auto',
    flex: '1 0 auto'
  },
  headerCell: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(0.5)
  },
  cell: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(0.5)
  },
  fade: {
    opacity: 0.5
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

const FactRowComp = ({ fact, cells, isSelected, onRowClick }: IFactRowComp) => {
  const classes = useStyles();

  return (
    <TableRow hover selected={isSelected} classes={{ root: classes.row }} onClick={() => onRowClick(fact)}>
      {cells.map((cell: { kind: ColumnKind; text: string; isFaded?: boolean }, idx: number) => (
        <TableCell
          key={idx}
          className={cc(classes.cell, {
            // @ts-ignore
            [classes[cell.text]]: ['sourceType', 'destinationType'].some(k => k === cell.kind),
            [classes.wordBreak]: ['sourceValue', 'destinationValue'].some(k => k === cell.kind),
            [classes.factType]: cell.kind === 'factType',
            [classes.fade]: cell.isFaded
          })}
          size="small">
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

const FactsTableComp = ({
  rows,
  columns,
  sortOrder,
  selectedFilter,
  typeMultiSelect,
  onSortChange,
  onRowClick,
  onExportClick
}: IFactsTableComp) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <div>
          <FormControlLabel
            label="Only selected"
            labelPlacement="top"
            control={<Switch onClick={selectedFilter.onClick} checked={selectedFilter.checked} />}
          />
          <MultiSelect {...typeMultiSelect} />
        </div>
        <div>
          <Button variant="outlined" size="small" onClick={onExportClick}>
            Export to CSV
          </Button>
        </div>
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
  selectedFilter: { checked: boolean; onClick: () => void };
  typeMultiSelect: IMultiSelect;
  onSortChange: (n: ColumnKind) => void;
  onRowClick: (f: ActFact) => void;
  onExportClick: () => void;
}

export default observer(FactsTableComp);
