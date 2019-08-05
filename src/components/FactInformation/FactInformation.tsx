import React from 'react';
import { compose, withHandlers } from 'recompose';
import Typography from '@material-ui/core/Typography/index';
import format from 'date-fns/format';
import Table from '@material-ui/core/Table/index';
import TableBody from '@material-ui/core/TableBody/index';
import Grid from '@material-ui/core/Grid/index';
import Button from '@material-ui/core/Button/index';
import { withStyles, WithStyles, createStyles, Theme } from '@material-ui/core';

import actWretch from '../../util/actWretch';
import CenteredCircularProgress from '../CenteredCircularProgress';
import { FactRow } from './FactsRow';
import memoizeDataLoader from '../../util/memoizeDataLoader';
import { ObjectRow } from './ObjectRow';
import { relativeStringToDate } from '../RelativeDateSelector';
import RetractFactDialog, { retractFact } from '../RetractFact/Dialog';
import withDataLoader, { combineDataLoaders } from '../../util/withDataLoader';
import { factColor } from '../../util/utils';
import { ActFact, ActObject } from '../../pages/types';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing.unit * 2,
      paddingBottom: 0,
      height: `calc(100% - ${theme.spacing.unit * 3}px)`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flex: 1
    },
    info: {
      overflow: 'auto',
      flex: 1
    },
    actions: {
      paddingTop: theme.spacing.unit,
      paddingBottom: theme.spacing.unit
    },

    objectsTable: {
      marginLeft: -theme.spacing.unit * 2
    },

    row: {
      display: 'flex'
    },
    left: {
      flex: '0 0 100px',
      // Ensure left has the same line-height as right to make them align correctly
      lineHeight: theme.typography.body1.lineHeight
    },
    right: {
      flex: '1 1 auto'
    },
    factType: {
      color: factColor
    }
  });

type Comment = {
  id: string;
  replyTo: string;
  comment: string;
  timestamp: any;
};

const FactInformationComp = ({
  classes,
  id,
  fact,
  onObjectRowClick,
  onFactRowClick,
  comments,
  access,
  retractions,
  onRetractFactClick
}: IFactInformationCompInternal) => (
  <div className={classes.root}>
    <Typography variant="h5">
      <span className={classes.factType}>{fact.type.name}</span>
      {retractions.length > 0 && <span style={{ color: '#FF4F4F' }}> RETRACTED</span>}
    </Typography>
    <Typography variant="subtitle1" gutterBottom>
      {fact.value.startsWith('-') ? '' : fact.value}
    </Typography>
    <div className={classes.info}>
      <Grid container spacing={0}>
        <Grid item xs={12} classes={{ item: classes.row }}>
          <Typography className={classes.left}>organization</Typography>
          <Typography className={classes.right}>{fact.organization.name}</Typography>
        </Grid>
        <Grid item xs={12} classes={{ item: classes.row }}>
          <Typography className={classes.left}>access mode</Typography>
          <Typography className={classes.right}>{fact.accessMode}</Typography>
        </Grid>
        <Grid item xs={12} classes={{ item: classes.row }}>
          <Typography className={classes.left}>date</Typography>
          <Typography className={classes.right}>{format(new Date(fact.timestamp), 'DD.MM.YYYY HH:mm')}</Typography>
        </Grid>
        <Grid item xs={12} classes={{ item: classes.row }}>
          <Typography gutterBottom className={classes.left}>
            last seen
          </Typography>
          <Typography className={classes.right}>
            {format(new Date(fact.lastSeenTimestamp), 'DD.MM.YYYY HH:mm')}
          </Typography>
        </Grid>
      </Grid>

      <Typography variant="body1" gutterBottom>
        {fact.sourceObject && fact.destinationObject ? 2 : 1} objects
      </Typography>
      <Table classes={{ root: classes.objectsTable }}>
        <TableBody>
          {fact.sourceObject && (
            <ObjectRow
              key={fact.sourceObject.id}
              object={fact.sourceObject}
              onRowClick={object => onObjectRowClick(object)}
            />
          )}
          {fact.destinationObject && (
            <ObjectRow
              key={fact.destinationObject.id}
              object={fact.destinationObject}
              onRowClick={object => onObjectRowClick(object)}
            />
          )}
        </TableBody>
      </Table>

      {comments.length > 0 && <br />}
      {comments.map(({ id, replyTo, comment, timestamp }: Comment) => (
        <div key={id}>
          <Typography>{replyTo}</Typography>
          <Typography>{comment}</Typography>
          <Typography variant="caption">{format(new Date(timestamp), 'DD.MM.YYYY HH:mm')}</Typography>
        </div>
      ))}

      {retractions.length > 0 && (
        <React.Fragment>
          <br />
          <Table classes={{ root: classes.objectsTable }}>
            <TableBody>
              {retractions.map((retraction: any) => (
                <FactRow key={retraction.id} fact={retraction} onRowClick={fact => onFactRowClick(fact)} />
              ))}
            </TableBody>
          </Table>
        </React.Fragment>
      )}
    </div>
    <div className={classes.actions}>
      <Button onClick={onRetractFactClick}>Retract fact</Button>
      <RetractFactDialog />
    </div>
  </div>
);

const factDataLoader = ({ id }: { id: string }) =>
  actWretch
    .url(`/v1/fact/uuid/${id}`)
    .get()
    .json(({ data }) => ({
      fact: data
    }));

const commentsDataLoader = ({ id }: { id: string }) =>
  actWretch
    .url(`/v1/fact/uuid/${id}/comments`)
    .get()
    .json(({ data }) => ({ comments: data }));

const accessDataLoader = ({ id }: { id: string }) =>
  actWretch
    .url(`/v1/fact/uuid/${id}/access`)
    .get()
    .json(({ data }) => ({ access: data }));

const retractionsDataLoader = ({ id, endTimestamp }: { id: string; endTimestamp: any }) =>
  actWretch
    .url(`/v1/fact/search`)
    .json({
      before: endTimestamp === 'Any time' ? null : relativeStringToDate(endTimestamp),
      factType: ['Retraction'],
      factValue: [`Retracted Fact with id = ${id}.`],
      limit: 0
    })
    .post()
    .json(({ data }) => ({ retractions: data }));

const memoizedFactDataLoader = memoizeDataLoader(factDataLoader, ['id']);

interface IFactInformationCompInternal extends WithStyles<typeof styles> {
  id: string;
  fact: any;
  onObjectRowClick: (obj: ActObject) => void;
  onFactRowClick: (fact: ActFact) => void;
  comments: any;
  access: any;
  retractions: any;
  onRetractFactClick: (x: any) => void;
}

export type IFactInformationComp = Omit<
  IFactInformationCompInternal,
  | 'classes'
  | 'alwaysShowLoadingComponent'
  | 'LoadingComponent'
  | 'fact'
  | 'retractions'
  | 'comments'
  | 'access'
  | 'onRetractFactClick'
>;

export default compose<IFactInformationCompInternal, IFactInformationComp>(
  withDataLoader(
    combineDataLoaders(memoizedFactDataLoader, commentsDataLoader, accessDataLoader, retractionsDataLoader),
    {
      alwaysShowLoadingComponent: true,
      LoadingComponent: CenteredCircularProgress
    }
  ),
  withHandlers({
    onRetractFactClick: ({ fact, forceFetch }: any) => () => {
      retractFact(
        fact,
        // Wait 1 second before updating the data, allowing the api to reindex
        () => setTimeout(forceFetch, 1000)
      );
    }
  }),
  withStyles(styles)
)(FactInformationComp);
