import React from 'react';
import { observer } from 'mobx-react';
import { compose  } from 'recompose';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import {WithStyles, withStyles} from '@material-ui/core/styles';
import {ActFact} from "../../pages/types";
import {Theme} from "@material-ui/core";

const styles = (theme : Theme) => ({
  cell: {
    paddingLeft: theme.spacing.unit * 2
  },
  row: {
    cursor: 'pointer',
    height: theme.spacing.unit * 4
  }
});

const FactRowComp = ({ onRowClick, classes, fact } : IFactRowComp) => (
  <TableRow
    key={fact.id}
    hover
    classes={{ root: classes.row }}
    onClick={() => onRowClick(fact)}>
    <TableCell classes={{ root: classes.cell }} padding='dense'>
      {fact.type.name}
    </TableCell>
    <TableCell classes={{ root: classes.cell }} padding='dense'>
      {fact.value && fact.value.startsWith('-') ? '' : fact.value}
    </TableCell>
  </TableRow>
);

interface IFactRowComp extends WithStyles<typeof styles> {
    fact: ActFact,
    onRowClick: (f: ActFact) => void
}

export const FactRow = compose<IFactRowComp, Pick<IFactRowComp, Exclude<keyof IFactRowComp, "classes">>>(
  withStyles(styles),
  observer
)(FactRowComp);
