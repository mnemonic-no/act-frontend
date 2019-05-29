import TableBody from "@material-ui/core/TableBody";
import Table from "@material-ui/core/Table";
import React from "react";
import {createStyles, TableRow, Theme, withStyles} from "@material-ui/core";
import {lighten} from "@material-ui/core/styles/colorManipulator";
import {ActFact, ActObject} from "../../pages/types";
import Tooltip from "@material-ui/core/Tooltip";
import TableCell from "@material-ui/core/TableCell";

const styles = (theme: Theme) => createStyles({
    root: {
        marginLeft: -theme.spacing.unit * 2,
    },
    rowLink: {
        cursor: 'pointer',
        height: theme.spacing.unit * 4
    },
    row: {
        height: theme.spacing.unit * 4,
    },
    cell: {
        paddingLeft: theme.spacing.unit * 2
    },
    factLink: {
        paddingBottom: "4px",
        cursor: 'pointer',
        color: theme.palette.text.primary,
        '&:hover': {
            color: lighten(theme.palette.text.primary, 0.2),
            textDecoration: 'underline'
        },
        transition: theme.transitions.create('color', {
            duration: theme.transitions.duration.shortest
        })
    }
});


const FactTableRowComp = ({objStats, oneLeggedFacts, classes, onFactTypeClick, onFactClick}: {
    objStats: any,
    oneLeggedFacts: Array<ActFact>
    classes: any,
    onFactTypeClick: Function,
    onFactClick: Function,
}) => {
    let facts = oneLeggedFacts.filter(oneFact => oneFact.type.name === objStats.type.name);

    if (facts.length === 0) {
        return (
            <Tooltip key={objStats.type.id}
                     title={"Execute search"}>
                <TableRow classes={{root: classes.rowLink}}
                          hover
                          onClick={() => onFactTypeClick()}>
                    <TableCell classes={{root: classes.cell}} padding='dense'>{objStats.type.name}</TableCell>
                    <TableCell classes={{root: classes.cell}} padding='dense'>{objStats.count}</TableCell>
                </TableRow>
            </Tooltip>
        );
    } else {
        return (
            <TableRow
                key={objStats.type.id}

                classes={{root: classes.row}}>
                <TableCell classes={{root: classes.cell}}
                           style={{verticalAlign: 'top'}}>{objStats.type.name}</TableCell>
                <TableCell classes={{root: classes.cell}}>
                    {
                        facts
                            .sort((a, b) => (a.value && b.value && a.value > b.value ? 1 : -1))
                            .map(fact => {
                            return (
                                <Tooltip key={fact.id}
                                         title={"Show fact details"}>
                                    <div className={classes.factLink}
                                         onClick={() => onFactClick(fact)}>
                                        {fact.value}
                                    </div>
                                </Tooltip>
                            )
                        })
                    }
                </TableCell>
            </TableRow>
        )
    }
};

const FactTypeTable = ({classes, selectedObject, oneLeggedFacts, onFactClick, onSearchSubmit} : {
    classes: any,
    selectedObject: ActObject,
    oneLeggedFacts: Array<ActFact>,
    onFactClick: Function,
    onSearchSubmit: Function
}) => {
    return (
        <Table padding="dense" className={classes.root}>
            <TableBody>
                {
                    selectedObject.statistics && selectedObject.statistics
                        .sort((a, b) => a.type.name > b.type.name ? 1 : -1)
                        .map(objStats => {
                            return <FactTableRowComp key={objStats.type.id}
                                                     classes={classes}
                                                     objStats={objStats}
                                                     oneLeggedFacts={oneLeggedFacts}
                                                     onFactClick={onFactClick}
                                                     onFactTypeClick={() => onSearchSubmit({
                                                         objectType: selectedObject.type.name,
                                                         objectValue: selectedObject.value,
                                                         factTypes: [objStats.type.name]})}/>
                        })
                }
            </TableBody>
        </Table>
    )
};

export default withStyles(styles)(FactTypeTable);