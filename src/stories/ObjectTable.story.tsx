import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { MuiThemeProvider } from '@material-ui/core/styles';

import ObjectTable, { ColumnKind, IObjectTableComp } from '../components/ObjectTable';
import { actTheme } from '../App';
import { sortRowsBy } from '../pages/Table/PrunedObjectsTableStore';
import { ActObject } from '../pages/types';

storiesOf('ObjectTable', module)
  .add('empty', () => {
    const initialState: IObjectTableComp = {
      rows: [],
      sortOrder: { order: 'asc', orderBy: 'objectValue' },
      onRowClick: () => {},
      onSortChange: (ck: ColumnKind) => {}
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
          actObject: { id: '1', value: 'Axiom', type: { id: 'x', name: 'threatActor' } }
        },
        {
          actObject: { id: '2', value: 'Sofacy', type: { id: 'x', name: 'threatActor' } }
        },
        {
          actObject: { id: '3', value: 'Some report', type: { id: 'y', name: 'report' } }
        }
      ],
      sortOrder: { order: 'asc', orderBy: 'objectValue' },
      onRowClick: (obj: ActObject) => {
        alert('Row clicked: ' + JSON.stringify(obj));
      },
      onSortChange: (ck: ColumnKind) => {}
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

    return (
      <MuiThemeProvider theme={actTheme}>
        <ObjectTable {...s} rows={sortedRows} onSortChange={onSortChange} />
      </MuiThemeProvider>
    );
  });
