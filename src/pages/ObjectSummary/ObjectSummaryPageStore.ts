import { action, computed, observable } from 'mobx';
import * as _ from 'lodash/fp';

import { ActObjectSearch } from '../../backend/ActObjectBackendStore';
import { IObjectTitleComp } from '../../components/ObjectTitle';
import { ActFact, ActObject, IObjectTypeToSections, isDone, isPending, isRejected } from '../../core/types';
import { linkOnClickFn, notUndefined, objectTypeToColor } from '../../util/util';
import { getObjectLabelFromFact, isOneLegged, objectTitle, toContextAction } from '../../core/domain';
import { parseObjectSummary, TSectionConfig } from '../../configUtil';
import { CellKind, TActionCell, TCell, TSectionComp, TTagsCell, TTextCell } from './Section';
import { urlToObjectFactQueryPage, urlToObjectSummaryPage } from '../../Routing';
import AppStore from '../../AppStore';
import GraphQueryStore from '../../backend/GraphQueryStore';

const cellsAsText = (cells: Array<TCell>) => {
  return cells
    .filter((x): x is TTextCell => x.kind === CellKind.text)
    .map((x: TTextCell) => x.text)
    .join('');
};

export const byColumns = (a: { cells: Array<TCell> }, b: { cells: Array<TCell> }) => {
  const aTextCells = cellsAsText(a.cells);
  const bTextCells = cellsAsText(b.cells);

  return aTextCells > bTextCells ? 1 : -1;
};

export const countByObjectTypeString = (objects: Array<ActObject>) => {
  return _.pipe(
    _.groupBy((x: ActObject) => x.type.name),
    _.mapValues((x: Array<ActObject>) => x.length),
    _.entries,
    _.map(([objectType, count]) => objectType + ' (' + count + ')')
  )(objects).join(', ');
};

export const prepareSections = (
  currentObject: { value: string; typeName: string },
  objectTypeToSections: IObjectTypeToSections,
  graphQueryStore: GraphQueryStore,
  objectLabelFromFactType: string,
  postAndForgetFn: (url: string, jsonBody: any, successString: string) => void,
  navigateFn: (url: string) => void
): Array<TSectionComp> => {
  const sections =
    objectTypeToSections[currentObject.typeName] && objectTypeToSections[currentObject.typeName].sections;
  if (!sections) return [];

  return sections.map(({ title, query, actions }: TSectionConfig) => {
    const q = graphQueryStore.getGraphQuery(currentObject.value, currentObject.typeName, query);

    if (isPending(q)) {
      return { kind: 'loading', title: title };
    }

    if (isRejected(q)) {
      return {
        kind: 'error',
        title: title,
        errorTitle: 'Query failed',
        errorMessage: q.error || '',
        color: 'error'
      };
    }

    const { objects, facts } = q.result;
    if (objects.length > 200) {
      return {
        kind: 'error',
        title: title,
        errorTitle: 'Large result (' + objects.length + ')',
        errorMessage: countByObjectTypeString(objects),
        color: 'warning'
      };
    }

    if (objects.length === 0) {
      return { kind: 'empty', title: title };
    }

    const oneLeggedFacts: Array<ActFact> = facts.filter(isOneLegged) || [];

    return {
      kind: 'table',
      title: title,
      titleRight: objects.length + '',
      table: {
        rows: objects
          .slice()
          .map((o: ActObject): { cells: Array<TCell> } => {
            const href = urlToObjectSummaryPage(o);
            return {
              cells: [
                { kind: CellKind.text, text: o.type.name, color: objectTypeToColor(o.type.name) } as TTextCell,
                {
                  kind: CellKind.text,
                  text: getObjectLabelFromFact(o, objectLabelFromFactType, oneLeggedFacts) || o.value,
                  canShrink: true,
                  link: { href: href, onClick: linkOnClickFn({ href: href, navigateFn: navigateFn }) }
                } as TTextCell,
                {
                  kind: CellKind.tags,
                  tags: oneLeggedFacts
                    .filter(
                      f => f.type.name === 'category' && f.sourceObject !== undefined && f.sourceObject.id === o.id
                    )
                    .map(f => ({ text: f.value || '', tooltip: 'category' }))
                } as TTagsCell,
                actions &&
                  ({
                    kind: CellKind.action,
                    actions: actions.map(a => {
                      const x = toContextAction(a.action, o, postAndForgetFn);
                      return { tooltip: x.description, icon: a.icon, href: x.href || '' };
                    })
                  } as TActionCell)
              ].filter(notUndefined)
            };
          })
          .sort(byColumns)
      }
    };
  });
};

export const getObjectTitle = (actObjectSearch: ActObjectSearch, objectLabelFromFactType: string): IObjectTitleComp => {
  if (isDone(actObjectSearch)) {
    return objectTitle(actObjectSearch.result.actObject, actObjectSearch.result.facts, objectLabelFromFactType);
  }
  return {
    title: actObjectSearch.args.objectValue,
    subTitle: actObjectSearch.args.objectTypeName,
    color: objectTypeToColor(actObjectSearch.args.objectTypeName)
  } as IObjectTitleComp;
};

export const categories = (actObjectSearch: ActObjectSearch): Array<string> => {
  if (!isDone(actObjectSearch)) return [];

  return actObjectSearch.result.facts
    .filter(f => f.type.name === 'category')
    .map(f => f.value)
    .filter(notUndefined)
    .sort();
};

class ObjectSummaryPageStore {
  appStore: AppStore;
  @observable error: Error | null = null;
  config: { [id: string]: any };

  @observable currentObject: { typeName: string; value: string } | undefined;

  objectTypeToSections: IObjectTypeToSections = {};

  constructor(root: AppStore, config: any) {
    this.appStore = root;
    this.config = config;
    this.objectTypeToSections =
      parseObjectSummary({ objectSummary: config.objectSummary, actions: config.actions }) || {};
  }

  @action.bound
  prepare(objectTypeName: string, objectValue: string) {
    this.currentObject = { typeName: objectTypeName, value: objectValue };

    const sections = this.objectTypeToSections[objectTypeName] && this.objectTypeToSections[objectTypeName].sections;
    this.appStore.backendStore.actObjectBackendStore.execute(objectValue, objectTypeName, (error: Error) => {
      this.handleError({ error: error, title: 'Failed' });
    });

    if (sections) {
      sections.forEach(section => {
        this.appStore.backendStore.graphQueryStore.execute(objectValue, objectTypeName, section.query);
      });
    }
  }

  @action.bound
  openInGraphView() {
    if (!this.currentObject) return;
    this.appStore.goToUrl(
      urlToObjectFactQueryPage({ objectTypeName: this.currentObject.typeName, objectValue: this.currentObject.value })
    );
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
  get errorSnackbar() {
    return {
      error: this.error,
      onClose: () => (this.error = null)
    };
  }

  @computed
  get prepared() {
    const actObjectSearch =
      this.currentObject &&
      this.appStore.backendStore.actObjectBackendStore.getActObjectSearch(
        this.currentObject.value,
        this.currentObject.typeName
      );

    if (!this.currentObject || !actObjectSearch) {
      this.handleError({ error: new Error('No object selected') });

      return {
        pageMenu: this.appStore.pageMenu,
        error: this.errorSnackbar
      };
    }

    return {
      pageMenu: this.appStore.pageMenu,
      error: this.errorSnackbar,
      content: {
        titleSection: {
          isLoading: isPending(actObjectSearch),
          warning: Boolean(!this.objectTypeToSections[this.currentObject.typeName])
            ? 'Object summary is not supported for objects of this type'
            : '',
          title: getObjectTitle(actObjectSearch, this.config.objectLabelFromFactType),
          addToGraphButton: { text: 'Add to graph', tooltip: 'Add to graph view', onClick: this.openInGraphView },
          categories: categories(actObjectSearch)
        },
        sections: prepareSections(
          this.currentObject,
          this.objectTypeToSections,
          this.appStore.backendStore.graphQueryStore,
          this.config.objectLabelFromFactType,
          this.appStore.backendStore.postAndForget,
          (url: string) => this.appStore.goToUrl(url)
        )
      }
    };
  }
}

export default ObjectSummaryPageStore;
