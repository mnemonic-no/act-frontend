import * as _ from 'lodash/fp';
import React from 'react';
import { compose, withHandlers } from 'recompose';
import format from 'date-fns/format';
import Button from '@material-ui/core/Button/index';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid/index';
import Table from '@material-ui/core/Table/index';
import TableBody from '@material-ui/core/TableBody/index';
import Typography from '@material-ui/core/Typography/index';
import { Theme, makeStyles } from '@material-ui/core';

import actWretch from '../../util/actWretch';
import { isMetaFact, isRetracted } from '../../core/domain';
import CenteredCircularProgress from '../CenteredCircularProgress';
import memoizeDataLoader from '../../util/memoizeDataLoader';
import { ObjectRow } from './ObjectRow';
import RetractFactDialog, { retractFact } from '../RetractFact/Dialog';
import withDataLoader, { combineDataLoaders } from '../../util/withDataLoader';
import { factColor } from '../../util/utils';
import { ActFact, ActObject, FactComment } from '../../pages/types';
import { FactRow } from './FactsRow';
import { pluralize } from '../../util/util';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
    paddingBottom: 0,
    height: `calc(100% - ${theme.spacing(3)}px)`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: 1
  },
  info: {
    flex: 1
  },
  actions: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  },
  tables: {
    marginLeft: -theme.spacing(2)
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
  },
  objects: {
    paddingTop: '1rem'
  },
  metaFacts: {
    paddingTop: '1rem'
  },
  comments: {
    paddingTop: '2rem'
  }
}));

const FactInformationComp = ({
  id,
  fact,
  metaFacts,
  comments,
  access,
  onFactRowClick,
  onObjectRowClick,
  onReferenceClick,
  onRetractFactClick
}: IFactInformationCompInternal) => {
  const classes = useStyles();

  if (!fact) {
    return null;
  }

  return (
    <div className={classes.root}>
      <Typography variant="h5">
        <span className={classes.factType}>{fact.type.name}</span>
        {isRetracted(fact) && <span style={{ color: '#FF4F4F' }}> RETRACTED</span>}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        {fact.value && fact.value.startsWith('-') ? '' : fact.value}
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
            <Typography className={classes.right}>{format(new Date(fact.timestamp), 'yyyy.MM.dd HH:mm')}</Typography>
          </Grid>
          <Grid item xs={12} classes={{ item: classes.row }}>
            <Typography gutterBottom className={classes.left}>
              last seen
            </Typography>
            <Typography className={classes.right}>
              {format(new Date(fact.lastSeenTimestamp), 'yyyy.MM.dd HH:mm')}
            </Typography>
          </Grid>
        </Grid>

        {isMetaFact(fact) && fact.inReferenceTo && (
          <div className={classes.metaFacts}>
            <Link component="button" color="primary" variant="body1" onClick={() => onReferenceClick(fact)}>
              In reference to <span className={classes.factType}>{fact.inReferenceTo.type.name}</span>
            </Link>
          </div>
        )}

        {!isMetaFact(fact) && (
          <div className={classes.objects}>
            <Typography variant="body1">
              {pluralize(fact.sourceObject && fact.destinationObject ? 2 : 1, 'object')}
            </Typography>
            <Table classes={{ root: classes.tables }}>
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
          </div>
        )}

        {!_.isEmpty(metaFacts) && (
          <div className={classes.metaFacts}>
            <Typography variant="body1">{pluralize(metaFacts.length, 'fact')}</Typography>
            <Table classes={{ root: classes.tables }}>
              <TableBody>
                {metaFacts.map((metaFact: ActFact) => (
                  <FactRow key={metaFact.id} fact={metaFact} onRowClick={fact => onFactRowClick(fact)} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {comments &&
          comments.map(({ id, replyTo, comment, timestamp }: FactComment) => (
            <div key={id} className={classes.comments}>
              <Typography>{replyTo}</Typography>
              <Typography>{comment}</Typography>
              <Typography variant="caption">{format(new Date(timestamp), 'yyyy.MM.dd HH:mm')}</Typography>
            </div>
          ))}
      </div>
      <div className={classes.actions}>
        <Button onClick={onRetractFactClick}>Retract fact</Button>
        <RetractFactDialog />
      </div>
    </div>
  );
};

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

const metaFactsDataLoader = ({ id }: { id: string }) =>
  actWretch
    .url(`/v1/fact/uuid/${id}/meta`)
    .query({ includeRetracted: true })
    .get()
    .json(({ data }) => ({ metaFacts: data }));

const memoizedFactDataLoader = memoizeDataLoader(factDataLoader, ['id']);

interface IFactInformationCompInternal {
  id: string;
  fact: ActFact;
  onObjectRowClick: (obj: ActObject) => void;
  onFactRowClick: (fact: ActFact) => void;
  onReferenceClick: (fact: ActFact) => void;
  comments: Array<FactComment>;
  access: any;
  metaFacts: Array<ActFact>;
  onRetractFactClick: (x: any) => void;
}

export type IFactInformationComp = Omit<
  IFactInformationCompInternal,
  | 'alwaysShowLoadingComponent'
  | 'LoadingComponent'
  | 'fact'
  | 'metaFacts'
  | 'comments'
  | 'access'
  | 'onRetractFactClick'
>;

export default compose<IFactInformationCompInternal, IFactInformationComp>(
  withDataLoader(
    combineDataLoaders(memoizedFactDataLoader, commentsDataLoader, accessDataLoader, metaFactsDataLoader),
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
  })
)(FactInformationComp);
