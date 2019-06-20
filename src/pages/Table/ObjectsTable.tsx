import React from 'react';
import {observer} from 'mobx-react';
import {compose} from 'recompose';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import {createStyles, Theme, WithStyles, withStyles} from "@material-ui/core"

import {objectTypeToColor, renderObjectValue} from '../../util/utils';
import {ActObject} from "../types";
import {Node} from "../GraphView/GraphViewStore"
import Button from "@material-ui/core/Button";
import {SortOrder} from "./ObjectsTableStore";


const styles = (theme: Theme) => createStyles({
    root: {
        display: 'flex',
        flexDirection: "column",
        height: "100%"
    },
    cell: {
        paddingLeft: theme.spacing.unit * 2
    },
    row: {
        cursor: 'pointer',
        height: theme.spacing.unit * 4
    },
    footer: {
        padding: "0 10px 4px 0",
        display: "flex",
        flexDirection: "row-reverse"
    }
});

const ObjectRowComp = ({actObject, selectedNode, onRowClick, classes}: IObjectRowComp) => (
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
            <TableCell classes={{root: classes.cell}} padding='dense'>
                {renderObjectValue(actObject, 256)}
            </TableCell>
        </TableRow>
    );

interface IObjectRowComp extends WithStyles<typeof styles> {
    actObject: ActObject,
    selectedNode: Node,
    onRowClick: (o: ActObject) => void,
}

export const ActObjectRow = compose<IObjectRowComp, Pick<IObjectRowComp, Exclude<keyof IObjectRowComp, 'classes'>>>(
    withStyles(styles),
    observer
)(ObjectRowComp);

const ObjectsTableComp = ({objects, selectedNode, classes, sortOrder, onSortChange, onRowClick}: IObjectsTableComp) => (
    <div className={classes.root}>

        <div className={classes.footer}>
            <Button variant='outlined' size='small'>Export to CSV</Button>
        </div>

        <div style={{overflowY: "scroll"}}>
            <Table>
                <TableHead>
                    <TableRow classes={{root: classes.row}} >
                        <TableCell classes={{root: classes.cell}} padding='dense' >
                            <TableSortLabel
                                onClick={() => onSortChange('objectType')}
                                direction={sortOrder.order}
                                active={sortOrder.orderBy === 'objectType'}>
                                Type
                            </TableSortLabel>
                        </TableCell>
                        <TableCell classes={{root: classes.cell}} padding='dense'>
                            <TableSortLabel
                                onClick={() => onSortChange('objectValue')}
                                direction={sortOrder.order}
                                active={sortOrder.orderBy === 'objectValue'}>
                                Value
                            </TableSortLabel>
                        </TableCell>
                        <TableCell classes={{root: classes.cell}} padding='dense'>
                            <TableSortLabel
                                onClick={() => onSortChange('properties')}
                                direction={sortOrder.order}
                                active={sortOrder.orderBy === 'properties'}>
                                Properties
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
        </div>
    </div>
);

interface IObjectsTableComp extends WithStyles<typeof styles> {
    objects: Array<ActObject>,
    selectedNode: Node,
    sortOrder: SortOrder,
    onSortChange: Function,
    onRowClick: Function
}

export default compose<IObjectsTableComp, Pick<IObjectsTableComp, Exclude<keyof IObjectsTableComp, 'classes'>>>(
    withStyles(styles),
    observer
)(ObjectsTableComp);
