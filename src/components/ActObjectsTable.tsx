import {Node} from "../pages/GraphView/GraphViewStore"
import React from 'react';
import {observer} from 'mobx-react';
import {compose, mapProps, withStateHandlers} from 'recompose';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import {withStyles} from '@material-ui/core/styles';

import {objectTypeToColor, renderObjectValue} from '../util/utils';
import {ActObject} from "../pages/QueryHistory";

// @ts-ignore
const styles = theme => ({
    cell: {
        paddingLeft: theme.spacing.unit * 2
    },
    row: {
        cursor: 'pointer',
        height: theme.spacing.unit * 4
    }
});

const ActObjectRowComp = ({actObject, selectedNode, onRowClick, classes}: {
    actObject: ActObject,
    selectedNode: Node,
    onRowClick: Function,
    classes: any
}) => (
    <TableRow
        key={actObject.id}
        hover
        selected={actObject.id === selectedNode.id}
        classes={{root: classes.row}}
        onClick={() => onRowClick(actObject)}>
        <TableCell classes={{root: classes.cell}} padding='dense'>
      <span style={{color: objectTypeToColor(actObject.type.name)}}>
        {actObject.type.name}
      </span>
        </TableCell>
        <TableCell classes={{root: classes.cell}} padding='dense'>
            {renderObjectValue(actObject, 256)}
        </TableCell>
    </TableRow>
);

export const ActObjectRow = compose(
    withStyles(styles),
    observer
    // @ts-ignore
)(ActObjectRowComp);

const ActObjectsTableComp = ({objects, selectedNode, classes, orderBy, order, onSortChange, onRowClick}: {
    objects: Array<ActObject>,
    selectedNode: Node,
    classes: any,
    orderBy: any,
    order: any,
    onSortChange: Function,
    onRowClick: Function
}) => (
    <Table>
        <TableHead>
            <TableRow classes={{root: classes.row}}>
                <TableCell classes={{root: classes.cell}} padding='dense'>
                    <TableSortLabel
                        onClick={() => onSortChange('objectType')}
                        direction={order}
                        active={orderBy === 'objectType'}>
                        Type
                    </TableSortLabel>
                </TableCell>
                <TableCell classes={{root: classes.cell}} padding='dense'>
                    <TableSortLabel
                        onClick={() => onSortChange('objectValue')}
                        direction={order}
                        active={orderBy === 'objectValue'}>
                        Value
                    </TableSortLabel>
                </TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {objects.map((actObject: ActObject) =>
                <ActObjectRow key={actObject.id}
                              {...{
                                  actObject: actObject,
                                  selectedNode: selectedNode,
                                  onRowClick: (object: any) => onRowClick(object)
                              }}/>)}
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
    mapProps((props: any) => {
       return {...props, objects: props.objects.slice().sort((a:any, b:any) => {
               let aa;
               let bb;
               if (props.orderBy === 'objectType') {
                   aa = a.type.name;
                   bb = b.type.name;
               } else {
                   aa = a.value;
                   bb = b.value;
               }

               if (props.order === 'asc') {
                   return aa < bb ? -1 : 1;
               } else {
                   return aa < bb ? 1 : -1;
               }
           })
       }
    }),
    observer
    // @ts-ignore
)(ActObjectsTableComp);
