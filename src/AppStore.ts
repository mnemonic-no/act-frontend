import { action, computed, observable } from 'mobx';

import BackendStore from './backend/BackendStore';
import MainPageStore from './pages/Main/MainPageStore';
import ObjectSummaryPageStore from './pages/ObjectSummary/ObjectSummaryPageStore';
import SearchPageStore from './pages/Search/SearchPageStore';
import Routing from './Routing';
import EventBus from './util/eventbus';
import { ActEvent } from './core/events';
import { addMessage } from './util/SnackbarProvider';
import type { TBanner, TConfig } from './core/types';

export type TPage = 'mainPage' | 'searchPage' | 'summaryPage';

class AppStore {
  config: TConfig;
  eventBus: EventBus;
  mainPageStore: MainPageStore;
  searchPageStore: SearchPageStore;
  summaryPageStore: ObjectSummaryPageStore;
  routing: Routing;
  backendStore: BackendStore;

  @observable currentPage: TPage = 'mainPage';
  @observable errorEvent: { title?: string; error: Error } | null = null;

  constructor(config: TConfig) {
    this.config = config;
    this.eventBus = new EventBus();
    this.eventBus.subscribe({ id: 'appStore', handler: this.handleEvent });

    this.backendStore = new BackendStore(this, config);
    this.mainPageStore = new MainPageStore(this, config);
    this.searchPageStore = new SearchPageStore(
      this,
      config,
      this.mainPageStore.backendStore.simpleSearchBackendStore,
      this.mainPageStore.backendStore.autoCompleteSimpleSearchBackendStore
    );
    this.summaryPageStore = new ObjectSummaryPageStore(this, config);
    this.routing = new Routing(this);
  }

  @action.bound
  goToUrl(url: string) {
    this.routing.goToUrl(url);
  }

  initByUrl(location: Location): void {
    this.backendStore.fetchActObjectTypes();
    this.backendStore.fetchFactTypes();
    this.goToUrl(location.pathname);
  }

  @computed
  get pageMenu() {
    return [
      {
        icon: 'search',
        onClick: () => this.goToUrl('/search'),
        tooltip: 'Search page',
        isActive: this.currentPage === 'searchPage'
      },
      {
        icon: 'graph',
        onClick: () => this.goToUrl('/chart'),
        tooltip: 'Graph page',
        isActive: this.currentPage === 'mainPage'
      }
    ];
  }

  @computed
  get errorSnackbar() {
    return { errorEvent: this.errorEvent, onClose: () => (this.errorEvent = null) };
  }

  @computed
  get banner(): TBanner {
    return this.config.banner ? this.config.banner : {};
  }

  @action.bound
  handleEvent(event: ActEvent) {
    switch (event.kind) {
      case 'navigate':
        this.goToUrl(event.url);
        break;
      case 'fetchActObjectStats':
        this.mainPageStore.backendStore.actObjectBackendStore.execute(event.objectValue, event.objectTypeName);
        break;
      case 'fetchFact':
        this.mainPageStore.backendStore.factBackendStore.execute({
          factId: event.factId,
          refetch: Boolean(event.refetch)
        });
        break;
      case 'fetchOneLeggedFacts':
        this.mainPageStore.backendStore.oneLeggedFactsStore.execute(event.objectId);
        break;
      case 'selectionReset':
        this.mainPageStore.selectionStore.setCurrentlySelected(event.selection);
        this.mainPageStore.ui.detailsStore.selectionChanged();
        break;
      case 'selectionToggle':
        this.mainPageStore.selectionStore.toggleSelection(event.item);
        this.mainPageStore.ui.detailsStore.selectionChanged();
        break;
      case 'selectionRemove':
        this.mainPageStore.selectionStore.removeAllFromSelection(event.removeAll);
        this.mainPageStore.ui.detailsStore.selectionChanged();
        break;
      case 'selectionClear':
        this.mainPageStore.selectionStore.clearSelection();
        this.mainPageStore.ui.detailsStore.selectionChanged();
        break;
      case 'workingHistoryAddCreatedFactItem':
        this.mainPageStore.workingHistory.addCreatedFactItem(event.search, event.result);
        break;
      case 'workingHistoryRemoveItem':
        this.mainPageStore.workingHistory.removeItem(event.item);
        break;
      case 'notification':
        addMessage(event.text);
        break;
      case 'errorEvent':
        this.errorEvent = { ...event };
        break;
    }
  }
}

export default AppStore;
