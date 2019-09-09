import React from 'react';
import { observer } from 'mobx-react';
import { Theme, makeStyles } from '@material-ui/core';

import DetailsStore from './DetailsStore';
import FactInformation, { IFactInformationComp } from '../../components/FactInformation/FactInformation';
import ObjectInformation, { IObjectInformationComp } from '../../components/ObjectInformation/ObjectInformation';
import MultipleObjectsInformation, { IMultipleObjectsInformationComp } from './MultipleObjectsInformation';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    overflowY: 'auto',
    height: '100%'
  }
}));

const content = (store: DetailsStore) => {
  switch (store.contentsKind) {
    case 'object':
      return <ObjectInformation {...(store.selectedObjectDetails as IObjectInformationComp)} />;
    case 'fact':
      return <FactInformation {...(store.selectedFactDetails as IFactInformationComp)} />;
    case 'objects':
      return (
        <MultipleObjectsInformation {...(store.selectedMultipleObjectsDetails as IMultipleObjectsInformationComp)} />
      );
    default:
      return null;
  }
};

const Details = ({ store }: IDetails) => {
  const classes = useStyles();

  if (!store.isOpen) {
    return null;
  }

  const detailsComp = content(store);

  return <div className={classes.root}>{detailsComp}</div>;
};

interface IDetails {
  store: DetailsStore;
}

export default observer(Details);
