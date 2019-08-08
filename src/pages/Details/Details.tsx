import React from 'react';
import { observer } from 'mobx-react';
import { withStyles, WithStyles, createStyles, Theme, IconButton } from '@material-ui/core';
import { compose } from 'recompose';
import CloseIcon from '@material-ui/icons/Close';

import ObjectInformation, { IObjectInformationComp } from '../../components/ObjectInformation/ObjectInformation';
import FactInformation, { IFactInformationComp } from '../../components/FactInformation/FactInformation';
import DetailsStore from './DetailsStore';

const styles = (theme: Theme) =>
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
  });

const Details = ({ store, classes }: IDetails) => {
  if (!store.isOpen) {
    return null;
  }

  const detailsComp = store.selectedObject ? (
    <ObjectInformation {...(store.selectedObjectDetails as IObjectInformationComp)} />
  ) : (
    <FactInformation {...(store.selectedFactDetails as IFactInformationComp)} />
  );

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

interface IDetails extends WithStyles<typeof styles> {
  store: DetailsStore;
}

export default compose<IDetails, Omit<IDetails, 'classes'>>(
  withStyles(styles),
  observer
)(Details);
