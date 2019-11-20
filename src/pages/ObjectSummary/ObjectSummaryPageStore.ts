import { action, computed } from 'mobx';

import AppStore from '../../AppStore';
import { objectTypeToColor } from '../../util/util';
import { IObjectTitleComp } from '../../components/ObjectTitle';

class ObjectSummaryPageStore {
  root: AppStore;
  error: Error | null = null;

  currentObject: { typeName: string; value: string } | undefined;

  constructor(root: AppStore) {
    this.root = root;
  }

  prepare(objectType: string, objectValue: string) {
    this.currentObject = { typeName: objectType, value: objectValue };
  }

  @action.bound
  openInGraphView() {
    if (!this.currentObject) return;
    this.root.navigateTo('mainPage');
    this.root.mainPageStore.backendStore.executeSearch({
      objectType: this.currentObject.typeName,
      objectValue: this.currentObject.value
    });
  }

  @computed
  get prepared() {
    return {
      pageMenu: this.root.pageMenu,
      error: {
        error: this.error,
        onClose: () => (this.error = null)
      },
      content: this.currentObject && {
        title: {
          title: this.currentObject.value,
          subTitle: this.currentObject.typeName,
          color: objectTypeToColor(this.currentObject.typeName)
        } as IObjectTitleComp,
        addToGraphButton: { text: 'Add to graph', tooltip: 'Add to graph view', onClick: this.openInGraphView }
      }
    };
  }
}

export default ObjectSummaryPageStore;
