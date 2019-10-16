import React from 'react';
import { observer } from 'mobx-react';
import {
  Button,
  FormControlLabel,
  makeStyles,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Theme,
  Tooltip
} from '@material-ui/core';

import { ActFact } from '../types';
import { factColor } from '../../util/util';
import config from '../../config';
import MultiSelect, { IMultiSelect } from '../../components/MultiSelect';

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
    padding: '16px 10px 18px 55px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tableContainer: {
    overflowY: 'auto'
  },
  headerCell: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(0.5)
  },
  cell: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(0.5)
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
