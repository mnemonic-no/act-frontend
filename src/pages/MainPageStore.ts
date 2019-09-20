import { action, computed, observable, reaction } from 'mobx';

import BackendStore from './BackendStore';
import config from '../config';
import CytoscapeLayoutStore from './CytoscapeLayout/CytoscapeLayoutStore';
import DetailsStore from './Details/DetailsStore';
import FactsTableStore from './Table/FactsTableStore';
import GraphViewStore from './GraphView/GraphViewStore';
import ObjectsTableStore from './Table/ObjectsTableStore';
import WorkingHistory from './WorkingHistory';
import WorkingHistoryStore from './WorkingHistory/WorkingHistoryStore';
import RefineryOptionsStore from './RefineryOptions/RefineryOptionsStore';
import RefineryStore from './RefineryStore';
import SearchStore from './Search/SearchStore';
import { StateExport } from './types';
import SelectionStore from './SelectionStore';
import PrunedObjectsTableStore from './Table/PrunedObjectsTableStore';
import SearchesStore from './Search/SearchesStore';
import ContentStore from './Content/ContentStore';

const locationDefinitions = (routeDefinitions: any) => {
  return (location: Location) => {
    Object.entries(routeDefinitions).forEach(([k, v]) => {
      const re = RegExp(k);

      const match = re.exec(location.pathname);

      if (match && match.length > 1) {
        const pathValues = match.slice(1).map(x => decodeURIComponent(x));
        // @ts-ignore
        v(...pathValues);
        return;
      }
    });
  };
};

class MainPageStore {
  ui: {
    contentStore: ContentStore;
    cytoscapeLayoutStore: CytoscapeLayoutStore;
    graphViewStore: GraphViewStore;
    detailsStore: DetailsStore;
    refineryOptionsStore: RefineryOptionsStore;
    searchStore: SearchStore;
    workingHistoryStore: WorkingHistoryStore;
    factsTableStore: FactsTableStore;
    objectsTableStore: ObjectsTableStore;
    prunedObjectsTableStore: PrunedObjectsTableStore;
    searchesStore: SearchesStore;
  };

  @observable isSearchDrawerOpen = true;
  @observable error: Error | null = null;

  backendStore: BackendStore;
  workingHistory: WorkingHistory;
  refineryStore: RefineryStore;
  selectionStore: SelectionStore;

  constructor() {
    this.backendStore = new BackendStore(this, config);
    this.workingHistory = new WorkingHistory(this);
    this.refineryStore = new RefineryStore(this);
    this.selectionStore = new SelectionStore();
    this.ui = {
      contentStore: new ContentStore(this),
      cytoscapeLayoutStore: new CytoscapeLayoutStore(window.localStorage),
      graphViewStore: new GraphViewStore(this),

      detailsStore: new DetailsStore(this, config),
      prunedObjectsTableStore: new PrunedObjectsTableStore(this),
      refineryOptionsStore: new RefineryOptionsStore(this),
      searchStore: new SearchStore(this, config),
      workingHistoryStore: new WorkingHistoryStore(this),
      factsTableStore: new FactsTableStore(this),
      objectsTableStore: new ObjectsTableStore(this),
      searchesStore: new SearchesStore(this)
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

  initByUrl(location: Location): void {
    const locationMatcher = locationDefinitions({
      '/object-fact-query/(.+)/(.+?)(/)?$': (objectType: string, objectValue: string) => {
        this.backendStore.executeSearch({ objectType: objectType, objectValue: objectValue });
      },
      '/gremlin/(.+)/(.+)/(.+?)(/)?$': (objectType: string, objectValue: string, query: string) => {
        this.backendStore.executeSearch({ objectType: objectType, objectValue: objectValue, query: query });
      },
      '/graph-query/(.+)/(.+)/(.+?)(/)?$': (objectType: string, objectValue: string, query: string) => {
        this.backendStore.executeSearch({ objectType: objectType, objectValue: objectValue, query: query });
      }
    });

    locationMatcher(location);
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
    return !this.workingHistory.isEmpty || this.ui.contentStore.selectedTab === 'searches';
  }

  @computed
  get errorSnackbar() {
    return {
      error: this.error,
      onClose: () => (this.error = null)
    };
  }
}

export default MainPageStore;
