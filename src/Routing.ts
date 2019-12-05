import AppStore from './AppStore';
import UniversalRouter from 'universal-router';
import { action } from 'mobx';
import { ActObject } from './core/types';

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
            this.appStore.summaryPageStore.prepare(objectType, objectValue);
            this.appStore.currentPage = 'summaryPage';
          };
        }
      },
      {
        path: '/object-fact-query/:objectType/:objectValue',
        action: context => {
          return () => {
            const { objectType, objectValue } = context.params as { [key: string]: string };
            this.appStore.mainPageStore.backendStore.executeSearch({
              objectType: objectType,
              objectValue: objectValue
            });
            this.appStore.currentPage = 'mainPage';
          };
        }
      },
      {
        path: '/gremlin/:objectType/:objectValue/:query',
        action: context => {
          const { objectType, objectValue, query } = context.params as { [key: string]: string };
          this.appStore.mainPageStore.backendStore.executeSearch({
            objectType: objectType,
            objectValue: objectValue,
            query: query
          });

          this.appStore.currentPage = 'mainPage';
        }
      },
      {
        path: '/graph-query/:objectType/:objectValue/:query',
        action: context => {
          const { objectType, objectValue, query } = context.params as { [key: string]: string };

          this.appStore.mainPageStore.backendStore.executeSearch({
            objectType: objectType,
            objectValue: objectValue,
            query: query
          });

          this.appStore.currentPage = 'mainPage';
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

export const urlToObjectSummaryPage = (actObject: ActObject) => {
  return '/object-summary/' + encodeURIComponent(actObject.type.name) + '/' + encodeURIComponent(actObject.value);
};

export const urlToObjectFactQueryPage = (args: { objectTypeName: string; objectValue: string }) => {
  return '/object-fact-query/' + encodeURIComponent(args.objectTypeName) + '/' + encodeURIComponent(args.objectValue);
};

export const urlToGraphQueryPage = (args: { objectTypeName: string; objectValue: string; query: string }) => {
  return (
    '/graph-query/' +
    encodeURIComponent(args.objectTypeName) +
    '/' +
    encodeURIComponent(args.objectValue) +
    '/' +
    encodeURIComponent(args.query)
  );
};

export default Routing;
