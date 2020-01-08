import React from 'react';
import { observer } from 'mobx-react';
import { compose } from 'recompose';
import * as _ from 'lodash/fp';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import { ActFact, ActObject, FactType, NamedId, ObjectStats, PredefinedObjectQuery } from '../../core/types';
import { factDataLoader, factTypesDataLoader, objectByUuidDataLoader } from '../../core/dataLoaders';
import { objectTitle, isOneLeggedFactType, factCount } from '../../core/domain';
import { ObjectDetails } from '../../pages/Main/Details/DetailsStore';
import { pluralize } from '../../util/util';
import CenteredCircularProgress from '../CenteredCircularProgress';
import config from '../../config';
import ContextActions from './ContextActions';
import CreateFactForObjectDialog from '../CreateFactFor/Dialog';
import CreateFactForDialog from '../CreateFactFor/DialogStore';
import FactStats, { FactStatsCellType, IFactStatRow } from '../FactStats';
import GraphQueryDialogComp, { IGraphQueryDialogComp } from '../GraphQueryDialog';
import memoizeDataLoader from '../../util/memoizeDataLoader';
import ObjectTitle from '../../components/ObjectTitle';
import PredefinedObjectQueries from './PredefinedObjectQueries';
import withDataLoader from '../../util/withDataLoader';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(1),
    paddingBottom: 0,
    height: `calc(100% - ${theme.spacing(3)}px)`
  },
  info: {
    overflowY: 'auto',
    flex: '0 1 auto',
    minHeight: '200px'
  },
  contextActions: {
    paddingTop: theme.spacing(2)
  },
  predefinedQueries: {
    flex: '1 1 auto',
    paddingTop: theme.spacing(2)
  },
  footer: {
    justifySelf: 'end',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(),
    display: 'flex',
    justifyContent: 'space-between'
  },
  linkToSummary: {
    paddingBottom: theme.spacing(2)
  }
}));

export const toFactStatRows = (props: {
  actObject: ActObject;
  oneLeggedFacts: Array<ActFact>;
  onFactTypeClick: (factType: NamedId) => void;
  onFactTypeClickTooltip: string;
  onFactClick: (fact: ActFact) => void;
  onFactTooltip: string;
}): Array<IFactStatRow> => {
  return _.pipe(
    _.sortBy((objectStats: ObjectStats) => objectStats.type.name),
    _.map(
      (objectStats: ObjectStats): IFactStatRow => {
        const matchingOneLeggedFacts = props.oneLeggedFacts.filter(
          oneFact => oneFact.type.name === objectStats.type.name
        );

        if (matchingOneLeggedFacts.length > 0) {
          return {
            cells: [
              { kind: FactStatsCellType.text, text: objectStats.type.name },
              {
                kind: FactStatsCellType.links,
                links: matchingOneLeggedFacts
                  .map(x => ({
                    text: x.value + '',
                    tag: objectStats.type.name === 'category',
                    tooltip: props.onFactTooltip,
                    onClick: () => props.onFactClick(x)
                  }))
                  .sort((a, b) => (a.text > b.text ? 1 : -1))
              }
            ]
          };
        }

        return {
          onClick: () => props.onFactTypeClick(objectStats.type),
          tooltip: props.onFactTypeClickTooltip,
          cells: [
            { kind: FactStatsCellType.text, text: objectStats.type.name },
            { kind: FactStatsCellType.text, text: objectStats.count + '', align: 'right' as 'right' }
          ]
        };
      }
    )
  )(props.actObject.statistics);
};

const ObjectInformationComp = (props: IObjectInformationCompInternal) => {
  const classes = useStyles();

  if (!props.selectedObject) {
    return null;
  }

  const factStats = {
    rows: toFactStatRows({
      actObject: props.selectedObject,
      oneLeggedFacts: props.oneLeggedFacts,
      onFactTypeClick: props.onFactTypeClick,
      onFactTypeClickTooltip: 'Execute search',
      onFactClick: props.onFactClick,
      onFactTooltip: 'Show fact'
    })
  };

  return (
    <div className={classes.root}>
      <ObjectTitle
        {...objectTitle(props.selectedObject, props.oneLeggedFacts, config.objectLabelFromFactType)}
        onTitleClick={props.onTitleClick}
      />

      <div className={classes.info}>
        <Tooltip title={props.linkToSummaryPage.tooltip}>
          <div className={classes.linkToSummary}>
            <Link
              href={props.linkToSummaryPage.href}
              color="primary"
              underline={'always'}
              onClick={props.linkToSummaryPage.onClick}>
              {props.linkToSummaryPage.text}
            </Link>
          </div>
        </Tooltip>
        <Typography variant="body1" gutterBottom>
          {pluralize(factCount(props.selectedObject), 'fact')}
        </Typography>

        <FactStats {...factStats} />
      </div>

      <div className={classes.contextActions}>
        <ContextActions actions={props.details.contextActions} />
      </div>

      <div className={classes.predefinedQueries}>
        <PredefinedObjectQueries
          predefinedObjectQueries={props.details.predefinedObjectQueries}
          onClick={props.onPredefinedObjectQueryClick}
        />
      </div>
      <div className={classes.footer}>
        <Button onClick={() => props.onPruneObjectClick(props.selectedObject)}>Prune</Button>
        <Button onClick={() => props.onGraphQueryClick()}>Graph Query</Button>
        <Button onClick={e => props.onCreateFactClick(e)}>Create fact</Button>
        {props.createFactDialog && <CreateFactForObjectDialog store={props.createFactDialog} />}
        <GraphQueryDialogComp {...props.graphQueryDialog} />
      </div>
    </div>
  );
};

interface IObjectInformationCompInternal {
  id: string;
  selectedObject: ActObject;
  oneLeggedFacts: Array<ActFact>;
  details: ObjectDetails;
  linkToSummaryPage: { text: string; href: string; tooltip: string; onClick: (e: any) => void };
  createFactDialog: CreateFactForDialog;
  graphQueryDialog: IGraphQueryDialogComp;
  onFactTypeClick: (factType: NamedId) => void;
  onFactClick: (f: ActFact) => void;
  onCreateFactClick: (e: any) => void;
  onPruneObjectClick: (o: ActObject) => void;
  onGraphQueryClick: () => void;
  onTitleClick: () => void;
  onPredefinedObjectQueryClick: (q: PredefinedObjectQuery) => void;
}

const dataLoader = async ({ id }: { id: string }) => {
  const selectedObject = await objectByUuidDataLoader(id);

  const factTypes: Array<FactType> = await factTypesDataLoader();
  const oneLeggedFactTypeNames = factTypes.filter(ft => isOneLeggedFactType(ft)).map(ft => ft.name);

  const oneLeggedFacts = await factDataLoader(id, oneLeggedFactTypeNames);

  return {
    selectedObject: selectedObject,
    oneLeggedFacts: oneLeggedFacts
  };
};

const memoizedDataLoader = memoizeDataLoader(dataLoader, ['id']);

export type IObjectInformationComp = Omit<
  IObjectInformationCompInternal,
  'alwaysShowLoadingComponent' | 'LoadingComponent' | 'selectedObject' | 'oneLeggedFacts'
>;

export default compose<IObjectInformationCompInternal, IObjectInformationComp>(
  withDataLoader(memoizedDataLoader, {
    alwaysShowLoadingComponent: true,
    LoadingComponent: CenteredCircularProgress
  }),
  observer
)(ObjectInformationComp);
