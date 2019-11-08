import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import * as _ from 'lodash/fp';

import ObjectTable, { ColumnKind, IObjectRow, IObjectTableComp } from '../components/ObjectTable';
import { actTheme } from '../App';
import { sortRowsBy } from '../pages/Main/Table/PrunedObjectsTableStore';
import { ActObject } from '../core/types';

storiesOf('ObjectTable', module)
  .add('empty', () => {
    const initialState: IObjectTableComp = {
      rows: [],
      sortOrder: { order: 'asc', orderBy: 'objectValue' },
      onRowClick: () => {},
      onSortChange: (ck: ColumnKind) => {},
      onSelectAllClick: () => {}
    };

    return (
      <MuiThemeProvider theme={actTheme}>
        <ObjectTable {...initialState} />
      </MuiThemeProvider>
    );
  })
  .add('basic', () => {
    let initialState: IObjectTableComp = {
      rows: [
        {
          actObject: { id: '1', value: 'Axiom', type: { id: 'x', name: 'threatActor' } },
          isSelected: true
        },
        {
          actObject: { id: '2', value: 'Sofacy', type: { id: 'x', name: 'threatActor' } }
        },
        {
          actObject: { id: '3', value: 'Some report', type: { id: 'y', name: 'report' } }
        }
      ],
      sortOrder: { order: 'asc', orderBy: 'objectValue' },
      onRowClick: (obj: ActObject) => {},
      onSortChange: (ck: ColumnKind) => {},
      onSelectAllClick: () => {}
    };

    const [s, setS] = useState(initialState);

    const onSortChange = (ck: ColumnKind) => {
      setS({
        ...s,
        sortOrder: {
          orderBy: ck,
          order: s.sortOrder.orderBy === ck && s.sortOrder.order === 'asc' ? 'desc' : 'asc'
        }
      });
    };

    const sortedRows = sortRowsBy(s.sortOrder, s.rows);

    const onRowClick = (obj: ActObject) => {
      const updatedRows = s.rows.map(row => {
        if (obj.id === row.actObject.id) {
          return { ...row, isSelected: !Boolean(row.isSelected) };
        }
        return row;
      });

      setS({ ...s, rows: updatedRows });
    };

    const onSelectAllClick = () => {
      const isAllSelected = _.every((x: IObjectRow) => Boolean(x.isSelected))(s.rows);

      setS({ ...s, rows: s.rows.map(row => ({ ...row, isSelected: !isAllSelected })) });
    };

    return (
      <MuiThemeProvider theme={actTheme}>
        <ObjectTable
          {...s}
          rows={sortedRows}
          onSortChange={onSortChange}
          onRowClick={onRowClick}
          onCheckboxClick={onRowClick}
          onSelectAllClick={onSelectAllClick}
        />
      </MuiThemeProvider>
    );
  });
