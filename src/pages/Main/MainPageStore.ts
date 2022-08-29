import { action, computed, observable, reaction } from 'mobx';

import type { StateExportv2, TConfig } from '../../core/types';
import AppStore from '../../AppStore';
import BackendStore from '../../backend/BackendStore';
import ContentStore from './Content/ContentStore';
import CytoscapeLayoutStore from './CytoscapeLayout/CytoscapeLayoutStore';
import DetailsStore from './Details/DetailsStore';
import FactsTableStore from './Table/FactsTableStore';
import GraphViewStore from './GraphView/GraphViewStore';
import ObjectsTableStore from './Table/ObjectsTableStore';
import PrunedObjectsTableStore from './Table/PrunedObjectsTableStore';
import RefineryOptionsStore from './RefineryOptions/RefineryOptionsStore';
import RefineryStore from './RefineryStore';
import SearchByObjectTypeStore from './Search/SearchByObjectTypeStore';
import SelectionStore from './SelectionStore';
import WorkingHistory from './WorkingHistory';
import WorkingHistoryStore from './WorkingHistory/WorkingHistoryStore';
import { ActApi } from '../../backend/ActApi';
import { examples } from '../../configUtil';

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

  config: TConfig;
  appStore: AppStore;
  backendStore: BackendStore;
  workingHistory: WorkingHistory;
  refineryStore: RefineryStore;
  selectionStore: SelectionStore;

  constructor(appStore: AppStore, config: TConfig, actApi: ActApi) {
    this.appStore = appStore;
    this.config = config;
    this.backendStore = appStore.backendStore;
    this.workingHistory = new WorkingHistory(this, appStore.eventBus);
    this.refineryStore = new RefineryStore(this, window.localStorage);
    this.selectionStore = new SelectionStore();
    this.ui = {
      contentStore: new ContentStore(this),
      cytoscapeLayoutStore: new CytoscapeLayoutStore(window.localStorage),
      graphViewStore: new GraphViewStore(this, appStore.eventBus, config),

      detailsStore: new DetailsStore(appStore, this, config, actApi),
      prunedObjectsTableStore: new PrunedObjectsTableStore(this, config),
      refineryOptionsStore: new RefineryOptionsStore(this, config),
      searchStore: new SearchByObjectTypeStore(this, config),
      workingHistoryStore: new WorkingHistoryStore(this, config, appStore.eventBus),
      factsTableStore: new FactsTableStore(this, config, appStore.eventBus),
      objectsTableStore: new ObjectsTableStore(this, config, appStore.eventBus)
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
  initByImport(stateExport: StateExportv2): void {
    this.backendStore.executeSearches({ searches: stateExport.searches, replace: true });
    this.refineryStore.setPrunedObjectIds(stateExport.prunedObjectIds || []);
  }

  @computed
  get hasContent() {
    return !this.workingHistory.isEmpty;
  }

  @computed
  get graphEmpty() {
    return examples(this.config, (url: string) => this.appStore.goToUrl(url))
  }

  @computed
  get page() {
    return {
      isLoading: this.backendStore.isLoading,
      errorSnackbar: this.appStore.errorSnackbar,
      leftMenuItems: this.appStore.pageMenu,
      banner: this.appStore.banner
    };
  }
}

export default MainPageStore;
