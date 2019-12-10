import { action, computed, observable } from 'mobx';

import BackendStore from './backend/BackendStore';
import config from './config';
import MainPageStore from './pages/Main/MainPageStore';
import ObjectSummaryPageStore from './pages/ObjectSummary/ObjectSummaryPageStore';
import SearchPageStore from './pages/Search/SearchPageStore';
import Routing from './Routing';

export type TPage = 'mainPage' | 'searchPage' | 'summaryPage';

class AppStore {
  mainPageStore: MainPageStore;
  searchPageStore: SearchPageStore;
  summaryPageStore: ObjectSummaryPageStore;
  routing: Routing;
  @observable currentPage: TPage = 'mainPage';

  backendStore: BackendStore;

  constructor() {
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
}

export default AppStore;
