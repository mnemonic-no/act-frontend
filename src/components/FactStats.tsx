import React from 'react';
import cc from 'clsx';
import { lighten } from '@material-ui/core/styles/colorManipulator';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';

export enum FactStatsCellType {
  text,
  links
}

const useStyles = makeStyles((theme: Theme) => ({
  rowLink: {
    cursor: 'pointer'
  },
  link: {
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
  },
  textCell: {
    verticalAlign: 'top'
  },
  tag: {
    marginLeft: theme.spacing(0.5)
  },
  row: {
    '& > *': {
      paddingLeft: 0
    }
  }
}));

const FactStatsCell = (props: IFactStatCell) => {
  const classes = useStyles();

  switch (props.kind) {
    case FactStatsCellType.text:
      return (
        <TableCell className={classes.textCell} align={props.align}>
          {props.text}
        </TableCell>
      );
    case FactStatsCellType.links:
      return (
        <TableCell align={'right'}>
          {props.links.map((link, idx) => {
            if (link.tag) {
              return (
                <Chip
                  key={idx}
                  className={classes.tag}
                  label={link.text}
                  onClick={link.onClick}
                  size="small"
                  color="primary"
                />
              );
            }

            return (
              <Tooltip key={idx} title={link.tooltip || ''}>
                <div className={classes.link} onClick={link.onClick}>
                  {link.text}
                </div>
              </Tooltip>
            );
          })}
        </TableCell>
      );

    default:
      // eslint-disable-next-line
      const _exhaustiveCheck: never = props;
      return null;
  }
};

const FactStatsComp = (props: IFactStatsProps) => {
  const classes = useStyles();

  return (
    <Table size="small">
      <TableBody>
        {props.rows.map((row, idx) => {
          const content = (
            <>
              {row.cells.map((cell: IFactStatCell, idx) => {
                return <FactStatsCell key={idx} {...cell} />;
              })}
            </>
          );

          if (row.onClick) {
            return (
              <Tooltip key={idx} title={row.tooltip || ''}>
                <TableRow hover onClick={row.onClick} className={cc(classes.row, classes.rowLink)}>
                  {content}
                </TableRow>
              </Tooltip>
            );
          }

          return (
            <TableRow key={idx} className={classes.row}>
              {content}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export type TextCell = {
  kind: FactStatsCellType.text;
  align?: 'right' | 'center';
  text: string;
};

export type LinksCell = {
  kind: FactStatsCellType.links;
  links: Array<{ text: string; onClick?: () => void; tooltip?: string; tag?: boolean }>;
};

export type IFactStatCell = TextCell | LinksCell;

export type IFactStatRow = { cells: Array<IFactStatCell>; onClick?: () => void; tooltip?: string };

export interface IFactStatsProps {
  rows: Array<IFactStatRow>;
}

export default FactStatsComp;
