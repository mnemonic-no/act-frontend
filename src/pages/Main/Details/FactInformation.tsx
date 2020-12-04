import React from 'react';
import * as _ from 'lodash/fp';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import { ActFact, ActObject, FactComment } from '../../../core/types';
import { factColor } from '../../../util/util';
import { FactRow } from './FactsRow';
import { isMetaFact, isRetracted } from '../../../core/domain';
import { ObjectRow } from './ObjectRow';
import { pluralize } from '../../../util/util';
import CenteredCircularProgress from '../../../components/CenteredCircularProgress';
import RetractFactDialog from '../../../components/RetractFact/Dialog';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(1),
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
  footer: {
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
    lineHeight: theme.typography.body1.lineHeight,
    paddingRight: theme.spacing(1)
  },
  right: {
    flex: '1 1 auto'
  },
  factType: {
    color: factColor
  },
  section: {
    paddingTop: '1rem'
  },
  comments: {
    paddingTop: '2rem'
  }
}));

const FactInformationComp = ({
  fact,
  isLoadingData,
  metaFacts,
  comments,
  objectColors,
  footerButtons,
  onFactRowClick,
  onObjectRowClick,
  onReferenceClick
}: IFactInformationProps) => {
  const classes = useStyles();

  if (!fact) {
    return <div className={classes.root}>{isLoadingData && <CenteredCircularProgress />}</div>;
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
            <Typography className={classes.left}>origin</Typography>
            <Typography className={classes.right}>{fact.origin.name}</Typography>
          </Grid>
          {fact.addedBy && (
            <Grid item xs={12} classes={{ item: classes.row }}>
              <Typography className={classes.left}>added by</Typography>
              <Typography className={classes.right}>{fact.addedBy.name}</Typography>
            </Grid>
          )}
          <Grid item xs={12} classes={{ item: classes.row }}>
            <Typography className={classes.left}>certainty</Typography>
            <Tooltip title={`Trust: ${fact.trust} Confidence: ${fact.confidence}`}>
              <Typography className={classes.right}>{fact.certainty}</Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={12} classes={{ item: classes.row }}>
            <Typography className={classes.left}>access mode</Typography>
            <Typography className={classes.right}>{fact.accessMode}</Typography>
          </Grid>
          <Grid item xs={12} classes={{ item: classes.row }}>
            <Typography className={classes.left}>time</Typography>
            <Typography className={classes.right}>{fact.timestamp}</Typography>
          </Grid>
          <Grid item xs={12} classes={{ item: classes.row }}>
            <Typography gutterBottom className={classes.left}>
              last seen
            </Typography>
            <Typography className={classes.right}>{fact.lastSeenTimestamp}</Typography>
          </Grid>
        </Grid>

        {isMetaFact(fact) && fact.inReferenceTo && (
          <div className={classes.section}>
            <Link component="button" color="primary" variant="body1" onClick={() => onReferenceClick(fact)}>
              In reference to <span className={classes.factType}>{fact.inReferenceTo.type.name}</span>
            </Link>
          </div>
        )}

        {!isMetaFact(fact) && (
          <div className={classes.section}>
            <Typography variant="body1">
              {pluralize(fact.sourceObject && fact.destinationObject ? 2 : 1, 'object')}
            </Typography>
            <Table classes={{ root: classes.tables }}>
              <TableBody>
                {fact.sourceObject && (
                  <ObjectRow
                    key={fact.sourceObject.id}
                    object={fact.sourceObject}
                    color={objectColors[fact.sourceObject.type.name]}
                    onRowClick={object => onObjectRowClick(object)}
                  />
                )}
                {fact.destinationObject && (
                  <ObjectRow
                    key={fact.destinationObject.id}
                    object={fact.destinationObject}
                    color={objectColors[fact.destinationObject.type.name]}
                    onRowClick={object => onObjectRowClick(object)}
                  />
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {isLoadingData && <CenteredCircularProgress />}

        {!_.isEmpty(metaFacts) && (
          <div className={classes.section}>
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
              <Typography variant="caption">{timestamp}</Typography>
            </div>
          ))}
      </div>
      <div className={classes.footer}>
        {footerButtons.map(b => (
          <Button key={b.text} onClick={b.onClick}>
            {b.text}
          </Button>
        ))}
      </div>
      <RetractFactDialog />
    </div>
  );
};

export interface IFactInformationProps {
  id: string;
  isLoadingData: boolean;
  fact: ActFact | null;
  comments: Array<FactComment>;
  metaFacts: Array<ActFact>;
  objectColors: { [objectType: string]: string };
  footerButtons: Array<{ text: string; onClick: () => void }>;
  onObjectRowClick: (obj: ActObject) => void;
  onFactRowClick: (fact: ActFact) => void;
  onReferenceClick: (fact: ActFact) => void;
}

export default FactInformationComp;
