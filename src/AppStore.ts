import { action, computed, observable } from 'mobx';

import config from './config';
import MainPageStore from './pages/Main/MainPageStore';
import ObjectSummaryPageStore from './pages/ObjectSummary/ObjectSummaryPageStore';
import SearchPageStore from './pages/Search/SearchPageStore';

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

export type TPage = 'mainPage' | 'searchPage' | 'summaryPage';

class AppStore {
  mainPageStore: MainPageStore;
  searchPageStore: SearchPageStore;
  summaryPageStore: ObjectSummaryPageStore;
  @observable currentPage: TPage = 'mainPage';

  constructor() {
    this.mainPageStore = new MainPageStore(this, config);
    this.searchPageStore = new SearchPageStore(
      this,
      config,
      this.mainPageStore.backendStore.simpleSearchBackendStore,
      this.mainPageStore.backendStore.autoCompleteSimpleSearchBackendStore
    );
    this.summaryPageStore = new ObjectSummaryPageStore(this);
  }

  initByUrl(location: Location): void {
    const locationMatcher = locationDefinitions({
      '/search(/)?$': () => {
        this.currentPage = 'searchPage';
      },
      '/object-summary/(.+)/(.+?)(/)?$': (objectType: string, objectValue: string) => {
        this.currentPage = 'summaryPage';
        this.summaryPageStore.prepare(objectType, objectValue);
      },
      '/object-fact-query/(.+)/(.+?)(/)?$': (objectType: string, objectValue: string) => {
        this.currentPage = 'mainPage';
        this.mainPageStore.backendStore.executeSearch({ objectType: objectType, objectValue: objectValue });
      },
      '/gremlin/(.+)/(.+)/(.+?)(/)?$': (objectType: string, objectValue: string, query: string) => {
        this.currentPage = 'mainPage';
        this.mainPageStore.backendStore.executeSearch({
          objectType: objectType,
          objectValue: objectValue,
          query: query
        });
      },
      '/graph-query/(.+)/(.+)/(.+?)(/)?$': (objectType: string, objectValue: string, query: string) => {
        this.currentPage = 'mainPage';
        this.mainPageStore.backendStore.executeSearch({
          objectType: objectType,
          objectValue: objectValue,
          query: query
        });
      }
    });

    locationMatcher(location);
  }

  @action.bound
  navigateTo(page: TPage) {
    this.currentPage = page;
  }

  @computed
  get pageMenu() {
    return [
      {
        icon: 'search',
        onClick: () => this.navigateTo('searchPage'),
        tooltip: 'Search page',
        isActive: this.currentPage === 'searchPage'
      },
      {
        icon: 'graph',
        onClick: () => this.navigateTo('mainPage'),
        tooltip: 'Graph page',
        isActive: this.currentPage === 'mainPage'
      }
    ];
  }
}

export default AppStore;
