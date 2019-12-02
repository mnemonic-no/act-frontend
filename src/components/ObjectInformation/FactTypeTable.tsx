import React from 'react';
import { lighten } from '@material-ui/core/styles/colorManipulator';
import { makeStyles, Theme } from '@material-ui/core/styles';
import cc from 'clsx';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';

import { ActFact, ActObject, NamedId, ObjectStats } from '../../core/types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginLeft: -theme.spacing(2)
  },
  rowLink: {
    cursor: 'pointer',
    height: theme.spacing(4)
  },
  row: {
    height: theme.spacing(4)
  },
  cell: {
    paddingLeft: theme.spacing(2)
  },
  cellValue: {
    wordBreak: 'break-word'
  },
  factLink: {
    paddingBottom: '4px',
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
}));

const FactTableRowComp = ({
  objStats,
  oneLeggedFacts,
  onFactTypeClick,
  onFactClick,
  factTooltip,
  factTypeTooltip
}: IFactTableRowComp) => {
  const classes = useStyles();
  let facts = oneLeggedFacts.filter(oneFact => oneFact.type.name === objStats.type.name);

  if (facts.length === 0) {
    return (
      <Tooltip key={objStats.type.id} title={factTypeTooltip ? factTypeTooltip : ''}>
        <TableRow
          classes={{ root: cc(onFactTypeClick && classes.rowLink) }}
          hover={Boolean(onFactTypeClick)}
          onClick={onFactTypeClick && (() => onFactTypeClick(objStats.type))}>
          <TableCell classes={{ root: classes.cell }} size="small">
            {objStats.type.name}
          </TableCell>
          <TableCell classes={{ root: classes.cell }} size="small" align="right">
            {objStats.count}
          </TableCell>
        </TableRow>
      </Tooltip>
    );
  }
  return (
    <TableRow key={objStats.type.id} classes={{ root: classes.row }}>
      <TableCell classes={{ root: classes.cell }} style={{ verticalAlign: 'top' }}>
        {objStats.type.name}
      </TableCell>
      <TableCell classes={{ root: `${classes.cell} ${classes.cellValue}` }} align="right">
        {facts
          .slice()
          .sort((a, b) => (a.value && b.value && a.value > b.value ? 1 : -1))
          .map(fact => {
            return (
              <Tooltip key={fact.id} title={factTooltip ? factTooltip : ''}>
                <div className={classes.factLink} onClick={onFactClick && (() => onFactClick(fact))}>
                  {fact.value}
                </div>
              </Tooltip>
            );
          })}
      </TableCell>
    </TableRow>
  );
};

interface IFactTableRowComp {
  objStats: ObjectStats;
  oneLeggedFacts: Array<ActFact>;
  onFactClick?: (fact: ActFact) => void;
  onFactTypeClick?: (factType: NamedId) => void;
  factTooltip?: string;
  factTypeTooltip?: string;
}

const FactTypeTable = (props: IFactTypeTable) => {
  const classes = useStyles();
  return (
    <Table size="small" className={classes.root}>
      <TableBody>
        {props.selectedObject.statistics &&
          props.selectedObject.statistics
            .slice()
            .sort((a, b) => (a.type.name > b.type.name ? 1 : -1))
            .map(objStats => {
              return (
                <FactTableRowComp
                  key={objStats.type.id}
                  objStats={objStats}
                  oneLeggedFacts={props.oneLeggedFacts}
                  onFactClick={props.onFactClick}
                  onFactTypeClick={props.onFactTypeClick}
                  factTooltip={props.factTooltip}
                  factTypeTooltip={props.factTypeTooltip}
                />
              );
            })}
      </TableBody>
    </Table>
  );
};

interface IFactTypeTable {
  selectedObject: ActObject;
  oneLeggedFacts: Array<ActFact>;
  onFactClick?: (f: ActFact) => void;
  onFactTypeClick?: (factType: NamedId) => void;
  factTooltip?: string;
  factTypeTooltip?: string;
}

export default FactTypeTable;
