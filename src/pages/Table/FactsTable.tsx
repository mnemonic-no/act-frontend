import React from 'react';
import {observer} from 'mobx-react';
import {compose, mapProps, withStateHandlers} from 'recompose';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import {createStyles, Theme, withStyles} from "@material-ui/core"

import {Node} from "../GraphView/GraphViewStore"
import {ActFact} from "../types";

const styles = (theme: Theme) => createStyles({
    root: {
        overflowY: 'scroll',
        height: "100%"
    },
    cell: {
        paddingLeft: theme.spacing.unit * 2
    },
    row: {
        cursor: 'pointer',
        height: theme.spacing.unit * 4
    }
});

const FactRowComp = ({fact, selectedNode, onRowClick, classes}: {
    fact: ActFact,
    selectedNode: Node,
    onRowClick: Function,
    classes: any
}) => (
    <TableRow
        key={fact.id}
        hover
        selected={fact.id === selectedNode.id}
        classes={{root: classes.row}}
        onClick={() => onRowClick(fact)}>
        <TableCell classes={{root: classes.cell}} padding='dense'>
            {fact.type.name}
        </TableCell>
        <TableCell classes={{root: classes.cell}} padding='dense'>
            {
                // @ts-ignore
                fact.value.startsWith('-') ? '' : fact.value}
        </TableCell>
    </TableRow>
);

export const ActFactRow = compose(
    withStyles(styles),
    observer
    // @ts-ignore
)(FactRowComp);

const FactsTableComp = ({facts, selectedNode, orderBy, order, onSortChange, onRowClick, classes}: {
    facts: Array<ActFact>,
    selectedNode: Node,
    orderBy: string,
    order: any,
    onSortChange: Function,
    onRowClick: Function,
    classes: any
}) => (
    <div className={classes.root}>
        <Table>
            <TableHead>
                <TableRow classes={{root: classes.row}}>
                    <TableCell classes={{root: classes.cell}} padding='dense'>
                        <TableSortLabel
                            onClick={() => onSortChange('factType')}
                            direction={order}
                            active={orderBy === 'factType'}>
                            Type
                        </TableSortLabel>
                    </TableCell>
                    <TableCell classes={{root: classes.cell}} padding='dense'>
                        <TableSortLabel
                            onClick={() => onSortChange('factValue')}
                            direction={order}
                            active={orderBy === 'factValue'}>
                            Value
                        </TableSortLabel>
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {facts.map((fact: ActFact) => <ActFactRow key={fact.id}
                                                          {...{
                                                              fact: fact,
                                                              selectedNode: selectedNode,
                                                              onRowClick: (fact: ActFact) => onRowClick(fact)
                                                          }} />)}
            </TableBody>
        </Table>
    </div>
);

export default compose(
    withStyles(styles),
    withStateHandlers({
        order: 'asc', orderBy: 'factType'
    }, {
        onSortChange: ({order, orderBy}) => newOrderBy => ({
            orderBy: newOrderBy,
            order: orderBy === newOrderBy && order === 'asc' ? 'desc' : 'asc'
        })
    }),

    mapProps((props: any) => {
        return {
            ...props,
            facts: props.facts.slice().sort((a: any, b: any) => {
                let aa;
                let bb;
                if (props.orderBy === 'factType') {
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
)(FactsTableComp);
