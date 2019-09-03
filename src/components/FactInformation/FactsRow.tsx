import React from 'react';
import { observer } from 'mobx-react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core';
import format from 'date-fns/format';

import { ActFact } from '../../pages/types';
import { isRetraction } from '../../core/domain';

const useStyles = makeStyles((theme: Theme) => ({
  cell: {
    paddingLeft: theme.spacing(2)
  },
  row: {
    cursor: 'pointer',
    height: theme.spacing(4)
  }
}));

const RetractionRowComp = ({ fact, onRowClick }: IFactRowComp) => {
  const classes = useStyles();
  return (
    <TableRow
      key={fact.id}
      hover
      classes={{ root: classes.row }}
      onClick={onRowClick ? () => onRowClick(fact) : undefined}>
      <TableCell classes={{ root: classes.cell }} size="small">
        Retraction
      </TableCell>
      <TableCell classes={{ root: classes.cell }} size="small">
        {format(new Date(fact.timestamp), 'yyyy.MM.dd HH:mm')}
      </TableCell>
    </TableRow>
  );
};

const FactRowComp = ({ fact, onRowClick }: IFactRowComp) => {
  const classes = useStyles();

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

interface IFactRowComp {
  fact: ActFact;
  onRowClick?: (f: ActFact) => void;
}

export const FactRow = observer(FactRowComp);
