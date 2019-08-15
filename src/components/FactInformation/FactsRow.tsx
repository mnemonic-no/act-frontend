import React from 'react';
import { observer } from 'mobx-react';
import { compose } from 'recompose';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { WithStyles, withStyles } from '@material-ui/core/styles';
import { ActFact } from '../../pages/types';
import { Theme } from '@material-ui/core';
import format from 'date-fns/format';
import { isRetraction } from '../../core/domain';

const styles = (theme: Theme) => ({
  cell: {
    paddingLeft: theme.spacing(2)
  },
  row: {
    cursor: 'pointer',
    height: theme.spacing(4)
  }
});

const RetractionRowComp = ({ classes, fact, onRowClick }: IFactRowComp) => (
  <TableRow
    key={fact.id}
    hover
    classes={{ root: classes.row }}
    onClick={onRowClick ? () => onRowClick(fact) : undefined}>
    <TableCell classes={{ root: classes.cell }} size="small">
      Retraction
    </TableCell>
    <TableCell classes={{ root: classes.cell }} size="small">
      {format(new Date(fact.timestamp), 'DD.MM.YYYY HH:mm')}
    </TableCell>
  </TableRow>
);

const FactRowComp = ({ classes, fact, onRowClick }: IFactRowComp) => {
  if (isRetraction(fact)) {
    return <RetractionRowComp {...{ classes, fact, onRowClick }} />;
  } else {
    return (
      <TableRow
        key={fact.id}
        hover
        classes={{ root: classes.row }}
        onClick={onRowClick ? () => onRowClick(fact) : undefined}>
        <TableCell classes={{ root: classes.cell }} size="small">
          {fact.type.name}
        </TableCell>
        <TableCell classes={{ root: classes.cell }} size="small">
          {fact.value && fact.value.startsWith('-') ? '' : fact.value}
        </TableCell>
      </TableRow>
    );
  }
};

interface IFactRowComp extends WithStyles<typeof styles> {
  fact: ActFact;
  onRowClick?: (f: ActFact) => void;
}

export const FactRow = compose<IFactRowComp, Omit<IFactRowComp, 'classes'>>(
  withStyles(styles),
  observer
)(FactRowComp);
