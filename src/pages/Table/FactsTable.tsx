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

import {ActFact} from "../types";

export type ColumnKind = 'sourceType' | 'sourceValue' | 'factType' | 'factValue' |
    'destinationType' | 'destinationValue' | 'isBidirectional' | 'isOneLegged'

export type SortOrder = {
    order: 'asc' | 'desc'
    orderBy: ColumnKind
}

export type FactRow = {
    key: string,
    fact: ActFact,
    isSelected: boolean,
    cells: Array<{text: string, wordBreak?: boolean}>
}

const styles = (theme: Theme) => createStyles({
    root: {
        overflowY: 'scroll',
        overflowX: 'scroll',
        height: '100%'
    },
    headerCell: {
        paddingLeft: theme.spacing.unit * 2,
    },
    cell: {
        paddingLeft: theme.spacing.unit * 2,
    },
    row: {
        cursor: 'pointer',
        height: theme.spacing.unit * 4
    }
});

const FactRowComp = ({key, fact, cells, isSelected, onRowClick, classes}: IFactRowComp) => (
    <TableRow
        key={key}
        hover
        selected={isSelected}
        classes={{root: classes.row}}
        onClick={() => onRowClick(fact)}>
        {
            cells.map(({text, wordBreak}, idx )=> {
                return (
                    <TableCell key={idx} classes={{root: classes.cell}} style={ wordBreak? {wordBreak: "break-all"} : {}} padding='dense'>
                        {text}
                    </TableCell>
                );
            })
        }
    </TableRow>
);

interface IFactRowComp extends FactRow, WithStyles<typeof styles> {
    onRowClick: (f: ActFact) => void
}

export const ActFactRow = compose<IFactRowComp, Pick<IFactRowComp, Exclude<keyof IFactRowComp, 'classes'>>>(
    withStyles(styles),
    observer
)(FactRowComp);

const FactsTableComp = ({rows, columns, sortOrder, onSortChange, onRowClick, classes}: IFactsTableComp) => (
    <div className={classes.root}>
        <Table>
            <TableHead>
                <TableRow classes={{root: classes.row}}>
                    {
                        columns.map(({label, kind}) => (
                            <TableCell key={kind} classes={{root: classes.headerCell}} padding='dense'>
                                <TableSortLabel
                                    onClick={() => onSortChange(kind)}
                                    direction={sortOrder.order}
                                    active={sortOrder.orderBy === kind}>
                                    {label}
                                </TableSortLabel>
                            </TableCell>))
                    }
                </TableRow>
            </TableHead>
            <TableBody>
                {
                    rows.map(row => <ActFactRow {...row} onRowClick={(fact: ActFact) => onRowClick(fact)}/>)
                }
            </TableBody>
        </Table>
    </div>
);

interface IFactsTableComp extends WithStyles<typeof styles> {
    rows: Array<FactRow>,
    columns: Array<{ label: string, kind: ColumnKind }>,
    sortOrder: SortOrder,
    onSortChange: (n: ColumnKind) => void,
    onRowClick: (f: ActFact) => void
}


export default compose<IFactsTableComp, Pick<IFactsTableComp, Exclude<keyof IFactsTableComp, "classes">>>(
    withStyles(styles),
    observer
)(FactsTableComp);