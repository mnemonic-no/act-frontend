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

import { renderObjectValue, factColor } from '../../../util/util';
import { ActObject } from '../../../core/types';
import MultiSelect, { IMultiSelect } from '../../../components/MultiSelect';

export type ColumnKind = 'objectType' | 'objectValue' | 'properties';

export type ObjectRow = {
  id: string;
  title: string;
  color: string;
  isSelected: boolean;
  actObject: ActObject;
  properties: Array<{ k: string; v: string }>;
};

export type SortOrder = {
  order: 'asc' | 'desc';
  orderBy: ColumnKind;
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
  cell: {
    paddingLeft: theme.spacing(2)
  },
  row: {
    cursor: 'pointer',
    height: theme.spacing(4)
  },
  factType: {
    color: factColor
  }
}));

const ObjectRowComp = ({ actObject, title, color, properties, isSelected, onRowClick }: IObjectRowComp) => {
  const classes = useStyles();

  return (
    <TableRow hover selected={isSelected} classes={{ root: classes.row }} onClick={() => onRowClick(actObject)}>
      <TableCell classes={{ root: classes.cell }} size="small">
        <span style={{ color: color }}>{title}</span>
      </TableCell>
      <TableCell classes={{ root: classes.cell }} size="small">
        {renderObjectValue(actObject, 256)}
      </TableCell>
      <TableCell classes={{ root: classes.cell }} size="small">
        {properties.map(({ k, v }: { k: string; v: string }, idx: number) => (
          <div key={idx}>
            <span className={classes.factType}>{`${k}: `}</span>
            <span>{v}</span>
          </div>
        ))}
      </TableCell>
    </TableRow>
  );
};

interface IObjectRowComp extends ObjectRow {
  onRowClick: (o: ActObject) => void;
}

export const ActObjectRow = observer(ObjectRowComp);

const ObjectsTableComp = ({
  rows,
  columns,
  sortOrder,
  selectedFilter,
  typeMultiSelect,
  onSortChange,
  onRowClick,
  onExportClick
}: IObjectsTableComp) => {
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

        <Button variant="outlined" size="small" onClick={onExportClick}>
          Export to CSV
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
            {rows.map(row => (
              <ActObjectRow key={row.id} {...row} onRowClick={object => onRowClick(object)} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

interface IObjectsTableComp {
  rows: Array<ObjectRow>;
  columns: Array<{ label: string; kind: ColumnKind }>;
  sortOrder: SortOrder;
  selectedFilter: { checked: boolean; onClick: () => void };
  typeMultiSelect: IMultiSelect;
  onSortChange: (ck: ColumnKind) => void;
  onRowClick: (obj: ActObject) => void;
  onExportClick: () => void;
}

export default observer(ObjectsTableComp);
