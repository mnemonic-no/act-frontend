import { action, computed, observable } from 'mobx';
import * as _ from 'lodash/fp';

import { IObjectTitleComp } from '../../components/ObjectTitle';
import { ActObject, IObjectTypeToSections } from '../../core/types';
import { linkOnClickFn, notUndefined, objectTypeToColor } from '../../util/util';
import { getObjectLabelFromFact, toContextAction } from '../../core/domain';
import { TCell, TSectionComp, TTextCell } from './Section';
import AppStore from '../../AppStore';
import GraphQueryStore from '../../backend/GraphQueryStore';
import { parseObjectSummary, TSectionConfig } from '../../config';

const cellsAsText = (cells: Array<TCell>) => {
  return cells
    .filter((x): x is TTextCell => x.kind === 'text')
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

    if (q.status === 'pending') {
      return { kind: 'loading', title: title };
    }

    if (q.status === 'rejected') {
      return {
        kind: 'error',
        title: title,
        errorTitle: 'Query failed',
        errorMessage: q.errorDetails || '',
        color: 'error'
      };
    }

    if (q.objects && q.objects.length > 25) {
      return {
        kind: 'error',
        title: title,
        errorTitle: 'Large result (' + q.objects.length + ')',
        errorMessage: countByObjectTypeString(q.objects),
        color: 'warning'
      };
    }

    if (q.objects && q.objects.length === 0) {
      return { kind: 'empty', title: title };
    }

    return {
      kind: 'table',
      title: title,
      titleRight: q.objects ? q.objects.length + '' : '',
      table: {
        rows: q.objects
          ? q.objects
              .slice()
              .map(o => {
                const href = '/object-summary/' + o.type.name + '/' + o.value;
                return {
                  cells: [
                    { kind: 'text' as 'text', text: o.type.name, color: objectTypeToColor(o.type.name) },
                    {
                      kind: 'text' as 'text',
                      text: getObjectLabelFromFact(o, objectLabelFromFactType, q.facts) || o.value,
                      link: { href: href, onClick: linkOnClickFn({ href: href, navigateFn: navigateFn }) }
                    },
                    actions && {
                      kind: 'action' as 'action',
                      actions: actions.map(a => {
                        const x = toContextAction(a.action, o, postAndForgetFn);
                        return { tooltip: x.description, icon: a.icon, href: x.href || '' };
                      })
                    }
                  ].filter(notUndefined)
                };
              })
              .sort(byColumns)
          : []
      }
    };
  });
};

class ObjectSummaryPageStore {
  appStore: AppStore;
  error: Error | null = null;
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

    if (sections) {
      sections.forEach(section => {
        this.appStore.backendStore.graphQueryStore.execute(objectValue, objectTypeName, section.query);
      });
    }
  }

  @action.bound
  openInGraphView() {
    if (!this.currentObject) return;
    this.appStore.goToUrl('/object-fact-query/' + this.currentObject.typeName + '/' + this.currentObject.value);
  }

  @computed
  get prepared() {
    return {
      pageMenu: this.appStore.pageMenu,
      error: {
        error: this.error,
        onClose: () => (this.error = null)
      },
      content: this.currentObject && {
        title: {
          title: this.currentObject.value,
          subTitle: this.currentObject.typeName,
          color: objectTypeToColor(this.currentObject.typeName)
        } as IObjectTitleComp,
        addToGraphButton: { text: 'Add to graph', tooltip: 'Add to graph view', onClick: this.openInGraphView },
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
