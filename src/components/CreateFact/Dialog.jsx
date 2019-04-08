import React from 'react';
import { compose, withProps } from 'recompose';
import { observable, action, decorate } from 'mobx';
import { observer } from 'mobx-react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import CreateFactForm from './FormLogic';

const CreateFactDialog = ({ state: { open, close, initialObject } }) => (
  <Dialog
    open={open}
    onClose={close}
    disableBackdropClick
    disableEscapeKeyDown
    maxWidth='sm'
    fullWidth
  >
    {/* <DialogTitle>Create Fact</DialogTitle> */}
    <CreateFactForm
      {...{ close, initialObject }}
      ContentComp={DialogContent}
      ActionsComp={DialogActions}
    />
  </Dialog>
);

// State
class CreateFactStore {
  open = false;
  initialObject = null;

  createFact = initialObject => {
    this.open = true;
    this.initialObject = initialObject;
  };

  close = () => {
    this.open = false;
    this.initialObject = null;
  };
}

decorate(CreateFactStore, {
  open: observable,
  initialObject: observable,
  createFact: action,
  close: action
});

const Singleton = new CreateFactStore();

export const { createFact } = Singleton;
export default compose(withProps({ state: Singleton }), observer)(
  CreateFactDialog
);
