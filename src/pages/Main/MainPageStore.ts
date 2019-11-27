import { action, computed, observable, reaction } from 'mobx';

import BackendStore from '../../backend/BackendStore';
import CytoscapeLayoutStore from './CytoscapeLayout/CytoscapeLayoutStore';
import DetailsStore from './Details/DetailsStore';
import FactsTableStore from './Table/FactsTableStore';
import GraphViewStore from './GraphView/GraphViewStore';
import ObjectsTableStore from './Table/ObjectsTableStore';
import WorkingHistory from './WorkingHistory';
import WorkingHistoryStore from './WorkingHistory/WorkingHistoryStore';
import RefineryOptionsStore from './RefineryOptions/RefineryOptionsStore';
import RefineryStore from './RefineryStore';
import { StateExport } from '../../core/types';
import SelectionStore from './SelectionStore';
import PrunedObjectsTableStore from './Table/PrunedObjectsTableStore';
import ContentStore from './Content/ContentStore';
import AppStore from '../../AppStore';
import SearchByObjectTypeStore from './Search/SearchByObjectTypeStore';

class MainPageStore {
  ui: {
    contentStore: ContentStore;
    cytoscapeLayoutStore: CytoscapeLayoutStore;
    graphViewStore: GraphViewStore;
    detailsStore: DetailsStore;
    refineryOptionsStore: RefineryOptionsStore;
    searchStore: SearchByObjectTypeStore;
    workingHistoryStore: WorkingHistoryStore;
    factsTableStore: FactsTableStore;
    objectsTableStore: ObjectsTableStore;
    prunedObjectsTableStore: PrunedObjectsTableStore;
  };

  @observable isSearchDrawerOpen = true;
  @observable error: Error | null = null;

  appStore: AppStore;
  backendStore: BackendStore;
  workingHistory: WorkingHistory;
  refineryStore: RefineryStore;
  selectionStore: SelectionStore;

  constructor(appStore: AppStore, config: any) {
    this.appStore = appStore;
    this.backendStore = appStore.backendStore;
    this.workingHistory = new WorkingHistory(this);
    this.refineryStore = new RefineryStore(this, window.localStorage);
    this.selectionStore = new SelectionStore();
    this.ui = {
      contentStore: new ContentStore(this),
      cytoscapeLayoutStore: new CytoscapeLayoutStore(window.localStorage),
      graphViewStore: new GraphViewStore(this),

      detailsStore: new DetailsStore(appStore, this, config),
      prunedObjectsTableStore: new PrunedObjectsTableStore(this),
      refineryOptionsStore: new RefineryOptionsStore(this),
      searchStore: new SearchByObjectTypeStore(this, config),
      workingHistoryStore: new WorkingHistoryStore(this, config),
      factsTableStore: new FactsTableStore(this),
      objectsTableStore: new ObjectsTableStore(this)
    };

    // Make the URL reflect the last item in the working history
    reaction(
      () => this.workingHistory.result,
      q => {
        if (this.workingHistory.isEmpty) {
          window.history.pushState(null, '', '/');
        } else {
          window.history.pushState(null, '', this.workingHistory.asPathname());
        }
      }
    );
  }

  @action.bound
  toggleSearchDrawer() {
    this.isSearchDrawerOpen = !this.isSearchDrawerOpen;
  }

  @action.bound
  initByImport(stateExport: StateExport): void {
    this.backendStore.executeSearches({ searches: stateExport.queries, replace: true });
    this.refineryStore.setPrunedObjectIds(stateExport.prunedObjectIds || []);
  }

  @action.bound
  handleError({ error, title }: { error: Error; title?: string }) {
    if (title) {
      // @ts-ignore
      error.title = title;
    }
    this.error = error;
  }

  @computed
  get hasContent() {
    return !this.workingHistory.isEmpty;
  }

  @computed
  get errorSnackbar() {
    return {
      error: this.error,
      onClose: () => (this.error = null)
    };
  }

  @computed
  get pageMenu() {
    return this.appStore.pageMenu;
  }
}

export default MainPageStore;
