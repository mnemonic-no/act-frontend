import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles } from '@material-ui/core/styles';

import DetailsStore from './DetailsStore';
import FactInformation, { IFactInformationProps } from './FactInformation';
import ObjectInformation, { IObjectInformationProps } from './ObjectInformation';
import MultipleObjectsInformation, { IMultiSelectInformationComp } from './MultiSelectInformation';

const useStyles = makeStyles(() => ({
  root: {
    position: 'relative',
    overflowY: 'auto',
    height: '100%'
  }
}));

const content = (store: DetailsStore) => {
  switch (store.contentsKind) {
    case 'object':
      return <ObjectInformation {...(store.selectedObjectDetails as IObjectInformationProps)} />;
    case 'fact':
      return <FactInformation {...(store.selectedFactDetails as IFactInformationProps)} />;
    case 'multi':
      return <MultipleObjectsInformation {...(store.multiSelectInfo as IMultiSelectInformationComp)} />;
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
