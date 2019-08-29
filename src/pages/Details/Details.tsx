import React from 'react';
import { observer } from 'mobx-react';
import { createStyles, Theme, IconButton, makeStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

import DetailsStore from './DetailsStore';
import FactInformation, { IFactInformationComp } from '../../components/FactInformation/FactInformation';
import ObjectInformation, { IObjectInformationComp } from '../../components/ObjectInformation/ObjectInformation';
import MultipleObjectsInformation, { IMultipleObjectsInformationComp } from './MultipleObjectsInformation';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
      overflowY: 'auto',
      height: '100%'
    },
    closeButton: {
      position: 'absolute',
      right: 0,
      top: 0
    }
  })
);

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

  return (
    <div className={classes.root}>
      <div className={classes.closeButton}>
        <IconButton onClick={store.close}>
          <CloseIcon />
        </IconButton>
      </div>
      {detailsComp}
    </div>
  );
};

interface IDetails {
  store: DetailsStore;
}

export default observer(Details);
