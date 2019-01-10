import React from 'react';
import { compose, withProps } from 'recompose';
import { observable, action } from 'mobx';
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
  @observable open = false;
  @observable initialObject = null;

  @action
  createFact = initialObject => {
    this.open = true;
    this.initialObject = initialObject;
  };

  @action
  close = () => {
    this.open = false;
    this.initialObject = null;
  };
}
const Singleton = new CreateFactStore();

export const { createFact } = Singleton;
export default compose(withProps({ state: Singleton }), observer)(
  CreateFactDialog
);
