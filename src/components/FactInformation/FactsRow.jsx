import React from 'react';
import { observer } from 'mobx-react/index';
import { compose  } from 'recompose';
import TableCell from '@material-ui/core/TableCell/index';
import TableRow from '@material-ui/core/TableRow/index';
import { withStyles } from '@material-ui/core/styles/index';

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
    classes={{ root: classes.row }}
    onClick={() => onRowClick(fact)}>
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
  observer
)(FactRowComp);
