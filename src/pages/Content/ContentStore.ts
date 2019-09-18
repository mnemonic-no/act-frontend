import MainPageStore from '../MainPageStore';
import { action, computed, observable } from 'mobx';
import config from '../../config';
import { ContentTab } from './Content';

class ContentStore {
  root: MainPageStore;

  @observable isSimpleSearchEnabled: boolean = false;
  @observable selectedTab: ContentTab = 'graph';

  constructor(root: MainPageStore, config: any) {
    this.root = root;
    this.isSimpleSearchEnabled = Boolean(config.isSimpleSearchEnabled) || false;
  }

  @action.bound
  onTabSelected(newTab: ContentTab) {
    this.selectedTab = newTab;
  }

  @computed
  get prepared() {
    return {
      selectedTab: this.selectedTab,
      onTabSelected: this.onTabSelected,
      graphViewStore: this.root.ui.graphViewStore,
      factsTableStore: this.root.ui.factsTableStore,
      objectsTableStore: this.root.ui.objectsTableStore,
      prunedObjectsTableStore: this.root.ui.prunedObjectsTableStore,
      searchesStore: this.root.ui.searchesStore,
      isSimpleSearchEnabled: Boolean(config.isSimpleSearchEnabled) || false
    };
  }
}

export default ContentStore;
