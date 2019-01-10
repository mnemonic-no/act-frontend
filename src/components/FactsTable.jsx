import React from 'react';
import { observer } from 'mobx-react';
import { compose, withProps, withHandlers, withStateHandlers } from 'recompose';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { withStyles } from '@material-ui/core/styles';

import graphInformation from '../state/graphInformation';
// import { factTypeToColor } from '../util/utils';

const styles = theme => ({
  cell: {
    paddingLeft: theme.spacing.unit * 2
  },
  row: {
    cursor: 'pointer',
    height: theme.spacing.unit * 4
  }
});

const FactRowComp = ({ onRowClick, classes, fact }) => (
  <TableRow
    key={fact.id}
    hover
    selected={fact.id === graphInformation.selectedNode.id}
    classes={{ root: classes.row }}
    onClick={() => onRowClick(fact)}
  >
    <TableCell classes={{ root: classes.cell }} padding='dense'>
      {fact.type.name}
    </TableCell>
    <TableCell classes={{ root: classes.cell }} padding='dense'>
      {fact.value.startsWith('-') ? '' : fact.value}
    </TableCell>
  </TableRow>
);

export const FactRow = compose(
  withStyles(styles),
  withProps({ graphInformation }),
  withHandlers({
    onRowClick: ({ graphInformation }) => fact => {
      graphInformation.setSelectedNode({ type: 'fact', id: fact.id });
    }
  }),
  observer
)(FactRowComp);

const FactsTableComp = ({
  classes,
  factsData,
  orderBy,
  order,
  onSortChange,
  onRowClick,
  graphInformation
}) => (
  <Table>
    <TableHead>
      <TableRow classes={{ root: classes.row }}>
        <TableCell classes={{ root: classes.cell }} padding='dense'>
          <TableSortLabel
            onClick={() => onSortChange('factType')}
            direction={order}
            active={orderBy === 'factType'}
          >
            Type
          </TableSortLabel>
        </TableCell>
        <TableCell classes={{ root: classes.cell }} padding='dense'>
          <TableSortLabel
            onClick={() => onSortChange('factValue')}
            direction={order}
            active={orderBy === 'factValue'}
          >
            Value
          </TableSortLabel>
        </TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {factsData.map(fact => <FactRow key={fact.id} {...{ fact }} />)}
    </TableBody>
  </Table>
);

export default compose(
  withStyles(styles),
  withStateHandlers(
    {
      order: 'asc',
      orderBy: 'factType'
    },
    {
      onSortChange: ({ order, orderBy }) => newOrderBy => ({
        orderBy: newOrderBy,
        order: orderBy === newOrderBy && order === 'asc' ? 'desc' : 'asc'
      })
    }
  ),
  withProps({ graphInformation }),
  observer,
  withProps(({ order, orderBy, graphInformation }) => ({
    factsData: graphInformation.factsData.slice().sort((a, b) => {
      let aa;
      let bb;
      if (orderBy === 'factType') {
        aa = a.type.name;
        bb = b.type.name;
      } else {
        aa = a.value;
        bb = b.value;
      }

      if (order === 'asc') {
        return aa < bb ? -1 : 1;
      } else {
        return aa < bb ? 1 : -1;
      }
    })
  })),
  observer
)(FactsTableComp);
