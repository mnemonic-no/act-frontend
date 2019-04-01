import React from 'react';
import { compose, withHandlers } from 'recompose';
import Typography from '@material-ui/core/Typography';
import format from 'date-fns/format';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import filteringOptions from '../state/filteringOptions';
import { relativeStringToDate } from '../components/RelativeDateSelector';
import withDataLoader, { combineDataLoaders } from '../util/withDataLoader';
import memoizeDataLoader from '../util/memoizeDataLoader';
import actWretch from '../util/actWretch';
import CenteredCircularProgress from './CenteredCircularProgress';
import { ObjectRow } from './ObjectsTable';
import RetractFactDialog, { retractFact } from './RetractFact/Dialog';
import { FactRow } from './FactsTable';

const styles = theme => ({
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
  }
});

const FactInformationComp = ({
  classes,
  id,
  fact,
  comments,
  access,
  retractions,
  onRetractFactClick
}) => (
  <div className={classes.root}>
    <Typography variant='headline'>
      <span style={{ color: '#F84' }}>{fact.type.name}</span>
      {retractions.length > 0 && (
        <span style={{ color: '#FF4F4F' }}> RETRACTED</span>
      )}
    </Typography>
    <Typography variant='subheading' gutterBottom>
      {fact.value.startsWith('-') ? '' : fact.value}
    </Typography>
    <div className={classes.info}>
      <Grid container spacing={0}>
        <Grid item xs={12} classes={{ item: classes.row }}>
          <Typography className={classes.left}>organization</Typography>
          <Typography className={classes.right}>
            {fact.organization.name}
          </Typography>
        </Grid>
        <Grid item xs={12} classes={{ item: classes.row }}>
          <Typography className={classes.left}>access mode</Typography>
          <Typography className={classes.right}>{fact.accessMode}</Typography>
        </Grid>
        <Grid item xs={12} classes={{ item: classes.row }}>
          <Typography className={classes.left}>date</Typography>
          <Typography className={classes.right}>
            {format(new Date(fact.timestamp), 'DD.MM.YYYY HH:mm')}
          </Typography>
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

      <Typography variant='body2' gutterBottom>
        {fact.sourceObject && fact.destinationObject ? 2 : 1} objects
      </Typography>
      <Table classes={{ root: classes.objectsTable }}>
        <TableBody>
          {fact.sourceObject && (
            <ObjectRow key={fact.sourceObject.id} object={fact.sourceObject} />
          )}
          {fact.destinationObject && (
            <ObjectRow
              key={fact.destinationObject.id}
              object={fact.destinationObject}
            />
          )}
        </TableBody>
      </Table>

      {comments.length > 0 && <br />}
      {comments.map(({ id, replyTo, comment, timestamp }) => (
        <div key={id}>
          <Typography>{replyTo}</Typography>
          <Typography>{comment}</Typography>
          <Typography variant='caption'>
            {format(new Date(timestamp), 'DD.MM.YYYY HH:mm')}
          </Typography>
        </div>
      ))}

      {retractions.length > 0 && (
        <React.Fragment>
          <br />
          <Table classes={{ root: classes.objectsTable }}>
            <TableBody>
              {retractions.map(retraction => (
                <FactRow key={retraction.id} fact={retraction} />
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

const factDataLoader = ({ id }) =>
  actWretch
    .url(`/v1/fact/uuid/${id}`)
    .get()
    .json(({ data }) => ({
      fact: data
    }));

const commentsDataLoader = ({ id }) =>
  actWretch
    .url(`/v1/fact/uuid/${id}/comments`)
    .get()
    .json(({ data }) => ({ comments: data }));

const accessDataLoader = ({ id }) =>
  actWretch
    .url(`/v1/fact/uuid/${id}/access`)
    .get()
    .json(({ data }) => ({ access: data }));

const retractionsDataLoader = ({ id }) =>
  actWretch
    .url(`/v1/fact/search`)
    .json({
      before:
        filteringOptions.endTimestamp === 'Any time'
          ? null
          : relativeStringToDate(filteringOptions.endTimestamp),
      factType: ['Retraction'],
      factValue: [`Retracted Fact with id = ${id}.`],
      limit: 0
    })
    .post()
    .json(({ data }) => ({ retractions: data }));

const memoizedFactDataLoader = memoizeDataLoader(factDataLoader, ['id']);

export default compose(
  withDataLoader(
    combineDataLoaders(
      memoizedFactDataLoader,
      commentsDataLoader,
      accessDataLoader,
      retractionsDataLoader
    ),
    {
      alwaysShowLoadingComponent: true,
      LoadingComponent: CenteredCircularProgress
    }
  ),
  withHandlers({
    onRetractFactClick: ({ fact, forceFetch }) => () => {
      retractFact(
        fact,
        // Wait 1 second before updating the data, allowing the api to reindex
        () => setTimeout(forceFetch, 1000)
      );
    }
  }),
  withStyles(styles)
)(FactInformationComp);
