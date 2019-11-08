import config from './config';
import MainPageStore from './pages/MainPageStore';

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

class AppStore {
  mainPageStore: MainPageStore;
  currentPage: 'mainPage' | 'searchPage' = 'mainPage';

  constructor() {
    this.mainPageStore = new MainPageStore(config);
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
}

export default AppStore;
