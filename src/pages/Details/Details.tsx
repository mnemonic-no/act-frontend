import React from 'react';
import { observer } from 'mobx-react';
import { withStyles, WithStyles, createStyles, Theme } from '@material-ui/core';
import { compose } from 'recompose';

import ObjectInformation, { IObjectInformationComp } from '../../components/ObjectInformation/ObjectInformation';
import FactInformation, { IFactInformationComp } from '../../components/FactInformation/FactInformation';
import DetailsStore from './DetailsStore';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
      overflowY: 'scroll',
      height: '100%'
    }
  });

const Details = ({ store, classes }: IDetails) => {
  if (!store.hasSelection) {
    return null;
  }

  const detailsComp = store.selectedObject ? (
    <ObjectInformation {...(store.selectedObjectDetails as IObjectInformationComp)} />
  ) : (
    <FactInformation {...(store.selectedFactDetails as IFactInformationComp)} />
  );

  return <div className={classes.root}>{detailsComp}</div>;
};

interface IDetails extends WithStyles<typeof styles> {
  store: DetailsStore;
}

export default compose<IDetails, Omit<IDetails, 'classes'>>(
  withStyles(styles),
  observer
)(Details);
