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

import {Node} from "../GraphView/GraphViewStore"
import {ActFact} from "../types";

export type ColumnKind = 'factType' | 'factValue'

export type SortOrder = {
    order: 'asc' | 'desc'
    orderBy: ColumnKind
}

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

const FactsTableComp = ({facts, selectedNode, sortOrder, onSortChange, onRowClick, classes}: IFactsTableComp) => (
    <div className={classes.root}>
        <Table>
            <TableHead>
                <TableRow classes={{root: classes.row}}>
                    <TableCell classes={{root: classes.cell}} padding='dense'>
                        <TableSortLabel
                            onClick={() => onSortChange('factType')}
                            direction={sortOrder.order}
                            active={sortOrder.orderBy === 'factType'}>
                            Type
                        </TableSortLabel>
                    </TableCell>
                    <TableCell classes={{root: classes.cell}} padding='dense'>
                        <TableSortLabel
                            onClick={() => onSortChange('factValue')}
                            direction={sortOrder.order}
                            active={sortOrder.orderBy === 'factValue'}>
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

interface IFactsTableComp extends WithStyles<typeof styles> {
    facts: Array<ActFact>,
    selectedNode: Node,
    sortOrder: SortOrder,
    onSortChange: (n: ColumnKind) => void,
    onRowClick: (f : ActFact) => void
}

export default compose<IFactsTableComp, Pick<IFactsTableComp, Exclude<keyof IFactsTableComp, "classes">>>(
    withStyles(styles),
    observer
)(FactsTableComp);
