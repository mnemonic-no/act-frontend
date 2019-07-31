import React from 'react';
import { observer } from 'mobx-react';
import { withStyles, createStyles, Theme } from '@material-ui/core';
import { compose } from 'recompose';

import ObjectInformation from '../../components/ObjectInformation/ObjectInformation';
import FactInformation from '../../components/FactInformation/FactInformation';
import DetailsStore from './DetailsStore';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
      overflowY: 'scroll',
      height: '100%'
    }
  });

const Details = ({ store, classes }: { store: DetailsStore; classes: any }) => {
  if (!store.hasSelection) {
    return null;
  }

  const detailsComp = store.selectedObject ? (
    <ObjectInformation {...store.selectedObjectDetails} />
  ) : (
    <FactInformation {...store.selectedFactDetails} />
  );

  return <div className={classes.root}>{detailsComp}</div>;
};

export default compose(
  withStyles(styles),
  observer
  // @ts-ignore
)(Details);
