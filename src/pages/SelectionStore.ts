import { action, observable } from 'mobx';
import { ActSelection } from './types';

class SelectionStore {
  @observable currentlySelected: { [id: string]: ActSelection } = {};

  @action.bound
  setCurrentSelection(selection: ActSelection) {
    this.setCurrentlySelected({ [selection.id]: selection });
  }

  @action.bound
  setCurrentlySelected(selection: { [id: string]: ActSelection }) {
    this.currentlySelected = selection;
  }

  @action.bound
  removeFromSelection(selection: ActSelection) {
    delete this.currentlySelected[selection.id];
  }

  @action.bound
  removeAllFromSelection(selection: Array<ActSelection>) {
    selection.forEach(x => {
      delete this.currentlySelected[x.id];
    });
  }

  @action.bound
  clearSelection() {
    this.setCurrentlySelected({});
  }

  @action.bound
  toggleSelection(selection: ActSelection) {
    if (this.currentlySelected[selection.id]) {
      this.removeFromSelection(selection);
    } else {
      this.setCurrentlySelected({ ...this.currentlySelected, [selection.id]: selection });
    }
  }
}

export default SelectionStore;
