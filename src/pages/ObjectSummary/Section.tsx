import React from 'react';
import cc from 'clsx';
import { makeStyles, Theme } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import WarnIcon from '@material-ui/icons/Warning';

const useSectionStyles = makeStyles((theme: Theme) => ({
  root: {
    minHeight: '400px',
    display: 'flex',
    flexFlow: 'column nowrap'
  },
  title: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(1)
  },
  content: {
    flex: '1 0 0',
    display: 'flex',
    overflow: 'auto',
    padding: theme.spacing(1)
  },
  centered: {
    display: 'flex',
    flexFlow: 'column',
    flex: '1 0 auto',
    alignItems: 'center',
    justifyContent: 'center'
  },
  faded: {
    opacity: 0.2
  }
}));

interface IEmptySection {
  kind: 'empty';
  title: string;
}

interface IErrorSection {
  kind: 'error';
  title: string;
  errorTitle: string;
  errorMessage: string;
}

interface ILoadingSection {
  kind: 'loading';
  title: string;
}

interface ITableSection {
  kind: 'table';
  title: string;
  titleRight: string;
  table: { rows: Array<{ cells: Array<{ text: string; color?: string }> }> };
}

export type TSectionComp = IEmptySection | IErrorSection | ILoadingSection | ITableSection;

const useErrorStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flexFlow: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorMessage: {
    padding: `${theme.spacing(2)}px ${theme.spacing(4)}px`,
    wordBreak: 'break-all'
  },
  errorIcon: {
    margin: '0 auto'
  }
}));

const ErrorSectionComp = (props: IErrorSection) => {
  const classes = useSectionStyles();
  const errorClasses = useErrorStyles();

  return (
    <Paper className={classes.root}>
      <div className={classes.title}>
        <Typography variant="subtitle1">{props.title}</Typography>
      </div>
      <Divider />
      <div className={cc(classes.content, errorClasses.container)}>
        <div className={errorClasses.errorIcon}>
          <WarnIcon color="error" style={{ fontSize: '90px' }} />
        </div>
        <Typography color="error" variant="h6">
          {props.errorTitle}
        </Typography>
        <Typography color="error" variant="body2" className={errorClasses.errorMessage}>
          {props.errorMessage}
        </Typography>
      </div>
    </Paper>
  );
};

const EmptySectionComp = (props: IEmptySection) => {
  const classes = useSectionStyles();

  return (
    <Paper className={classes.root}>
      <div className={classes.title}>
        <Typography variant="subtitle1">{props.title}</Typography>
      </div>
      <div className={classes.content}>
        <div className={cc(classes.centered, classes.faded)}>
          <Typography variant={'h4'}>No results</Typography>
        </div>
      </div>
    </Paper>
  );
};

const LoadingSectionComp = (props: ILoadingSection) => {
  const classes = useSectionStyles();

  return (
    <Paper className={classes.root}>
      <div className={classes.title}>
        <Typography variant="subtitle1">{props.title}</Typography>
      </div>
      <Divider />
      <div className={classes.content}>
        <div className={classes.centered}>
          <CircularProgress />
        </div>
      </div>
    </Paper>
  );
};

const TableSectionComp = (props: ITableSection) => {
  const classes = useSectionStyles();
  return (
    <Paper className={classes.root}>
      <div className={classes.title}>
        <Typography variant="subtitle1">{props.title}</Typography>
        {props.titleRight && <Typography variant="subtitle1">{props.titleRight}</Typography>}
      </div>
      <Divider />

      <div className={classes.content}>
        <Table>
          <TableBody>
            {props.table.rows.map((row, idx) => {
              return (
                <TableRow key={idx}>
                  {row.cells.map((x, idx) => {
                    return (
                      <TableCell key={idx} size="small" style={{ color: x.color || '' }}>
                        {x.text}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Paper>
  );
};

const SectionComp = (props: TSectionComp) => {
  if (props.kind === 'error') {
    return <ErrorSectionComp {...props} />;
  }
  if (props.kind === 'empty') {
    return <EmptySectionComp {...props} />;
  }
  if (props.kind === 'loading') {
    return <LoadingSectionComp {...props} />;
  }

  return <TableSectionComp {...props} />;
};

export default SectionComp;
