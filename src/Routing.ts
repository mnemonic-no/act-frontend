import AppStore from './AppStore';
import UniversalRouter from 'universal-router';
import { action } from 'mobx';
import { ActObject, MultiObjectTraverseSearch, ObjectFactsSearch, ObjectTraverseSearch } from './core/types';

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
              kind: 'objectFacts',
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
          return () => {
            const { objectType, objectValue, query } = context.params as { [key: string]: string };
            this.appStore.mainPageStore.backendStore.executeSearch({
              kind: 'objectTraverse',
              objectType: objectType,
              objectValue: objectValue,
              query: query
            });

            this.appStore.currentPage = 'mainPage';
          };
        }
      },
      {
        path: '/graph-query/:objectType/:objectValue/:query',
        action: context => {
          return () => {
            const { objectType, objectValue, query } = context.params as { [key: string]: string };

            this.appStore.mainPageStore.backendStore.executeSearch({
              kind: 'objectTraverse',
              objectType: objectType,
              objectValue: objectValue,
              query: query
            });

            this.appStore.currentPage = 'mainPage';
          };
        }
      },
      {
        path: '/multi-object-traverse/:objectType/:query/:objectIds+',
        action: context => {
          return () => {
            const { objectType, query } = context.params as { [key: string]: string };

            this.appStore.mainPageStore.backendStore.executeSearch({
              kind: 'multiObjectTraverse',
              objectType: objectType,
              objectIds: context.params.objectIds as Array<string>,
              query: query
            });

            this.appStore.currentPage = 'mainPage';
          };
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

export const urlToObjectFactQueryPage = (s: ObjectFactsSearch) => {
  return '/object-fact-query/' + encodeURIComponent(s.objectType) + '/' + encodeURIComponent(s.objectValue);
};

export const urlToMultiObjectQueryPage = (s: MultiObjectTraverseSearch) => {
  return (
    '/multi-object-traverse/' +
    encodeURIComponent(s.objectType) +
    '/' +
    encodeURIComponent(s.query) +
    '/' +
    s.objectIds.map(x => encodeURIComponent(x)).join('/')
  );
};

export const urlToChartPage = () => {
  return '/chart';
};

export const urlToGraphQueryPage = (s: ObjectTraverseSearch) => {
  return (
    '/graph-query/' +
    encodeURIComponent(s.objectType) +
    '/' +
    encodeURIComponent(s.objectValue) +
    '/' +
    encodeURIComponent(s.query)
  );
};

export default Routing;
