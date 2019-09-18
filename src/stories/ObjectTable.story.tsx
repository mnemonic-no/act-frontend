import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { MuiThemeProvider } from '@material-ui/core/styles';

import ObjectTable, { ColumnKind } from '../components/ObjectTable';
import { actTheme } from '../App';
import { sortRowsBy } from '../pages/Table/PrunedObjectsTableStore';
import { ActObject } from '../pages/types';

const StateWrapper = ({ initialState, children }: any) => {
  const [s, setS] = useState(initialState);
  return <div>{children(s, setS)}</div>;
};

storiesOf('ObjectTable', module)
  .add('empty', () => {
    const initialState = {
      rows: [],
      sortOrder: { order: 'asc', orderBy: 'objectValue' }
    };

    return (
      <MuiThemeProvider theme={actTheme}>
        <StateWrapper initialState={initialState}>
          {(s: any, setState: any) => {
            return <ObjectTable {...s} />;
          }}
        </StateWrapper>
      </MuiThemeProvider>
    );
  })
  .add('basic', () => {
    let initialState = {
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
      }
    };

    return (
      <MuiThemeProvider theme={actTheme}>
        <StateWrapper initialState={initialState}>
          {(s: any, setS: any) => {
            const onSortChange = (newOrderBy: ColumnKind) => {
              setS({
                ...s,
                sortOrder: {
                  orderBy: newOrderBy,
                  order: s.sortOrder.orderBy === newOrderBy && s.sortOrder.order === 'asc' ? 'desc' : 'asc'
                }
              });
            };

            const sortedRows = sortRowsBy(s.sortOrder, s.rows);

            return <ObjectTable {...s} rows={sortedRows} onSortChange={onSortChange} />;
          }}
        </StateWrapper>
      </MuiThemeProvider>
    );
  });
