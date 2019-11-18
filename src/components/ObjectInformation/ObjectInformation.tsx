import React from 'react';
import { observer } from 'mobx-react';
import { compose } from 'recompose';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import config from '../../config';
import withDataLoader from '../../util/withDataLoader';
import memoizeDataLoader from '../../util/memoizeDataLoader';
import CenteredCircularProgress from '../CenteredCircularProgress';
import { objectTypeToColor } from '../../util/util';
import { ObjectDetails } from '../../pages/Main/Details/DetailsStore';
import PredefinedObjectQueries from './PredefinedObjectQueries';
import ContextActions from './ContextActions';
import { factDataLoader, factTypesDataLoader, objectStatsDataLoader } from '../../core/dataLoaders';
import { getObjectLabelFromFact, isOneLeggedFactType } from '../../core/domain';
import { ActFact, ActObject, FactType, PredefinedObjectQuery, Search } from '../../core/types';
import FactTypeTable from './FactTypeTable';
import CreateFactForObjectDialog from '../CreateFactFor/Dialog';
import CreateFactForDialog from '../CreateFactFor/DialogStore';
import ObjectTitle from '../../components/ObjectTitle';

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
  }
}));

const objectTitle = (actObject: ActObject, oneLeggedFacts: Array<ActFact>) => {
  const labelFromFact = getObjectLabelFromFact(actObject, config.objectLabelFromFactType, oneLeggedFacts);

  return {
    title: labelFromFact || actObject.value,
    metaTitle: labelFromFact && actObject.value,
    subTitle: actObject.type.name,
    color: objectTypeToColor(actObject.type.name)
  };
};

const ObjectInformationComp = ({
  selectedObject,
  id,
  oneLeggedFacts,
  details,
  createFactDialog,
  onSearchSubmit,
  onCreateFactClick,
  onPruneObject,
  onTitleClick,
  onFactClick,
  onPredefinedObjectQueryClick
}: IObjectInformationCompInternal) => {
  const classes = useStyles();

  if (!selectedObject) {
    return null;
  }

  const totalFacts = selectedObject.statistics
    ? selectedObject.statistics.reduce((acc: any, x: any) => x.count + acc, 0)
    : 0;

  // @ts-ignore

  return (
    <div className={classes.root}>
      <ObjectTitle {...objectTitle(selectedObject, oneLeggedFacts)} onTitleClick={onTitleClick} />

      <div className={classes.info}>
        <Typography variant="body1" gutterBottom>
          {totalFacts} facts
        </Typography>

        <FactTypeTable
          selectedObject={selectedObject}
          oneLeggedFacts={oneLeggedFacts}
          onSearchSubmit={onSearchSubmit}
          onFactClick={onFactClick}
        />
      </div>

      <div className={classes.contextActions}>
        <ContextActions actions={details.contextActions} />
      </div>

      <div className={classes.predefinedQueries}>
        <PredefinedObjectQueries
          predefinedObjectQueries={details.predefinedObjectQueries}
          onClick={onPredefinedObjectQueryClick}
        />
      </div>
      <div className={classes.footer}>
        <Button onClick={() => onPruneObject(selectedObject)}>Prune</Button>
        <Button onClick={e => onCreateFactClick(e)}>Create fact</Button>
        {createFactDialog && <CreateFactForObjectDialog store={createFactDialog} />}
      </div>
    </div>
  );
};

interface IObjectInformationCompInternal {
  id: string;
  selectedObject: ActObject;
  oneLeggedFacts: Array<ActFact>;
  details: ObjectDetails;
  createFactDialog: CreateFactForDialog;
  onSearchSubmit: (search: Search) => void;
  onFactClick: (f: ActFact) => void;
  onCreateFactClick: (e: any) => void;
  onPruneObject: (o: ActObject) => void;
  onTitleClick: () => void;
  onPredefinedObjectQueryClick: (q: PredefinedObjectQuery) => void;
}

const dataLoader = async ({ id }: { id: string }) => {
  const selectedObject = await objectStatsDataLoader(id);

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
