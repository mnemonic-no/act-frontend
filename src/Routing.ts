import AppStore from './AppStore';
import UniversalRouter from 'universal-router';
import { action } from 'mobx';

class Routing {
  appStore: AppStore;

  router: UniversalRouter;

  constructor(appStore: AppStore) {
    this.appStore = appStore;

    window.onpopstate = (ev: any) => {
      this.router.resolve(window.location.pathname).then(handler => handler());
    };

    this.router = new UniversalRouter([
      {
        path: '/object-summary/:objectType/:objectValue',
        action: context => {
          return () => {
            const { objectType, objectValue } = context.params as { [key: string]: string };
            this.appStore.currentPage = 'summaryPage';
            this.appStore.summaryPageStore.prepare(objectType, objectValue);
          };
        }
      },
      {
        path: '/object-fact-query/:objectType/:objectValue',
        action: context => {
          return () => {
            const { objectType, objectValue } = context.params as { [key: string]: string };
            this.appStore.currentPage = 'mainPage';
            this.appStore.mainPageStore.backendStore.executeSearch({
              objectType: objectType,
              objectValue: objectValue
            });
          };
        }
      },
      {
        path: '/gremlin/:objectType/:objectValue/:query',
        action: context => {
          this.appStore.currentPage = 'mainPage';

          const { objectType, objectValue, query } = context.params as { [key: string]: string };

          this.appStore.mainPageStore.backendStore.executeSearch({
            objectType: objectType,
            objectValue: objectValue,
            query: query
          });
        }
      },
      {
        path: '/graph-query/:objectType/:objectValue/:query',
        action: context => {
          this.appStore.currentPage = 'mainPage';

          const { objectType, objectValue, query } = context.params as { [key: string]: string };

          this.appStore.mainPageStore.backendStore.executeSearch({
            objectType: objectType,
            objectValue: objectValue,
            query: query
          });
        }
      },
      {
        path: '/chart',
        action: () => {
          return () => {
            this.appStore.currentPage = 'mainPage';
          };
        }
      },
      {
        path: '/search',
        action: () => {
          return () => {
            this.appStore.currentPage = 'searchPage';
          };
        }
      },
      {
        path: '(.*)',
        action: () => {
          return () => {
            this.appStore.currentPage = 'searchPage';
          };
        }
      }
    ]);
  }

  @action.bound
  goToUrl(url: string) {
    this.router.resolve(url).then(handler => handler());
    window.history.pushState({ url: url }, '', url);
  }
}

export default Routing;
