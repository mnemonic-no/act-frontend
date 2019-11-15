import config from './config';
import MainPageStore from './pages/Main/MainPageStore';
import SearchPageStore from './pages/Search/SearchPageStore';
import { action, observable } from 'mobx';

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

export type TPage = 'mainPage' | 'searchPage';

class AppStore {
  mainPageStore: MainPageStore;
  searchPageStore: SearchPageStore;
  @observable currentPage: TPage = 'mainPage';

  constructor() {
    this.mainPageStore = new MainPageStore(config);
    this.searchPageStore = new SearchPageStore(
      this,
      config,
      this.mainPageStore.backendStore.simpleSearchBackendStore,
      this.mainPageStore.backendStore.autoCompleteSimpleSearchBackendStore
    );
  }

  initByUrl(location: Location): void {
    const locationMatcher = locationDefinitions({
      '/search(/)?$': () => {
        this.currentPage = 'searchPage';
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
}

export default AppStore;
