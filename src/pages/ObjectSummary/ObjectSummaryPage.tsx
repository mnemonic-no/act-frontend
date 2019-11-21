import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import ObjectSummaryPageStore from './ObjectSummaryPageStore';
import ObjectTitle from '../../components/ObjectTitle';
import Page from '../Page';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flex: '1 0 auto',
    padding: theme.spacing(1),
    backgroundColor: theme.palette.grey['100']
  },
  header: {
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  sections: {
    display: 'grid',
    gridGap: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))'
    },
    [theme.breakpoints.up('md')]: {
      gridTemplateColumns: 'repeat(auto-fill, minmax(600px, 1fr))'
    }
  }
}));

const useSectionStyles = makeStyles((theme: Theme) => ({
  root: {
    height: '400px',
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
    flex: '1 0 auto',
    alignItems: 'center',
    justifyContent: 'center'
  }
}));

interface ISectionComp {
  title: string;
  titleRight: string;
  isLoading: boolean;
  table: { rows: Array<{ cells: Array<string> }> };
}

const SectionComp = (props: ISectionComp) => {
  const classes = useSectionStyles();

  return (
    <Paper className={classes.root}>
      <div className={classes.title}>
        <Typography variant="subtitle1">{props.title}</Typography>
        {props.titleRight && <Typography variant="subtitle1">{props.titleRight}</Typography>}
      </div>
      <Divider />
      <div className={classes.content}>
        {props.isLoading && (
          <div className={classes.centered}>
            <CircularProgress />
          </div>
        )}
        {!props.isLoading && (
          <Table>
            <TableBody>
              {props.table.rows.map((row, idx) => {
                return (
                  <TableRow key={idx}>
                    {row.cells.map((x, idx) => {
                      return (
                        <TableCell key={idx} size="small">
                          {x}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </Paper>
  );
};

const SummaryPageComp = ({ store }: ISummaryPageComp) => {
  const classes = useStyles();

  const content = store.prepared.content;

  return (
    <Page errorSnackbar={store.prepared.error} isLoading={false} leftMenuItems={store.prepared.pageMenu}>
      {!content && <h1>Empty page</h1>}
      {content && (
        <div className={classes.root}>
          <Paper className={classes.header}>
            <ObjectTitle {...content.title} />
            <Tooltip title={content.addToGraphButton.tooltip}>
              <Button variant="outlined" onClick={content.addToGraphButton.onClick}>
                {content.addToGraphButton.text}
              </Button>
            </Tooltip>
          </Paper>
          <div className={classes.sections}>
            {content.sections.map(section => {
              return <SectionComp key={section.title} {...section} />;
            })}
          </div>
        </div>
      )}
    </Page>
  );
};

export interface ISummaryPageComp {
  store: ObjectSummaryPageStore;
}

export default observer(SummaryPageComp);
