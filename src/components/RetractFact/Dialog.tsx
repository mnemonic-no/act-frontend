import React from 'react';
import { observer } from 'mobx-react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

import RetractFactForm from './FormLogic';
import RetractFactStore from './RetractFactStore';

const RetractFactDialog = ({store: {open, close, fact, retractFact}}: { store: RetractFactStore }) => (
  <Dialog open={open} onClose={close} disableBackdropClick disableEscapeKeyDown maxWidth="sm">
    <RetractFactForm {...{ close, fact, onSubmit: retractFact}}
      // @ts-ignore
      ContentComp={DialogContent}
      ActionsComp={DialogActions}
    />
  </Dialog>
);

export default observer(RetractFactDialog);
