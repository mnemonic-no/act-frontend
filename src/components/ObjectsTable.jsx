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
import { objectTypeToColor, renderObjectValue } from '../util/utils';

const styles = theme => ({
  cell: {
    paddingLeft: theme.spacing.unit * 2
  },
  row: {
    cursor: 'pointer',
    height: theme.spacing.unit * 4
  }
});

const ObjectRowComp = ({ onRowClick, classes, object }) => (
  <TableRow
    key={object.id}
    hover
    selected={object.id === graphInformation.selectedNode.id}
    classes={{ root: classes.row }}
    onClick={() => onRowClick(object)}
  >
    <TableCell classes={{ root: classes.cell }} padding='dense'>
      <span style={{ color: objectTypeToColor(object.type.name) }}>
        {object.type.name}
      </span>
    </TableCell>
    <TableCell classes={{ root: classes.cell }} padding='dense'>
      {renderObjectValue(object, 256)}
    </TableCell>
  </TableRow>
);

export const ObjectRow = compose(
  withStyles(styles),
  withProps({ graphInformation }),
  withHandlers({
    onRowClick: ({ graphInformation }) => object => {
      graphInformation.setSelectedNode({ type: 'object', id: object.id });
    }
  }),
  observer
)(ObjectRowComp);

const ObjectsTableComp = ({
  classes,
  objectsData,
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
            onClick={() => onSortChange('objectType')}
            direction={order}
            active={orderBy === 'objectType'}
          >
            Type
          </TableSortLabel>
        </TableCell>
        <TableCell classes={{ root: classes.cell }} padding='dense'>
          <TableSortLabel
            onClick={() => onSortChange('objectValue')}
            direction={order}
            active={orderBy === 'objectValue'}
          >
            Value
          </TableSortLabel>
        </TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {objectsData.map(object => <ObjectRow key={object.id} {...{ object }} />)}
    </TableBody>
  </Table>
);

export default compose(
  withStyles(styles),
  withStateHandlers(
    {
      order: 'asc',
      orderBy: 'objectType'
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
    objectsData: graphInformation.objectsData.slice().sort((a, b) => {
      let aa;
      let bb;
      if (orderBy === 'objectType') {
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
)(ObjectsTableComp);
