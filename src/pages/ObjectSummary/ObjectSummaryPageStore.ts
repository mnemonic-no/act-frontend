import { action, computed, observable } from 'mobx';
import * as _ from 'lodash/fp';

import { ActObjectSearch } from '../../backend/ActObjectBackendStore';
import { FactStatsCellType, IFactStatRow, IFactStatsComp } from '../../components/FactStats';
import { IObjectTitleComp } from '../../components/ObjectTitle';
import { ActFact, ActObject, IObjectTypeToSections, LoadingStatus, ObjectStats, TLoadable } from '../../core/types';
import { linkOnClickFn, notUndefined, objectTypeToColor } from '../../util/util';
import { getObjectLabelFromFact, isOneLegged, objectTitle, toContextAction } from '../../core/domain';
import { parseObjectSummary, TSectionConfig } from '../../configUtil';
import { TCell, TSectionComp, TTextCell } from './Section';
import { urlToObjectSummaryPage } from '../../Routing';
import AppStore from '../../AppStore';
import GraphQueryStore from '../../backend/GraphQueryStore';

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

    if (q.objects && q.objects.length > 200) {
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
                const href = urlToObjectSummaryPage(o);
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

export const getObjectTitle = (actObjectSearch: ActObjectSearch, objectLabelFromFactType: string): IObjectTitleComp => {
  if (actObjectSearch.status === LoadingStatus.DONE && actObjectSearch.result) {
    return objectTitle(actObjectSearch.result.actObject, actObjectSearch.result.facts, objectLabelFromFactType);
  }
  return {
    title: actObjectSearch.args.objectValue,
    subTitle: actObjectSearch.args.objectTypeName,
    color: objectTypeToColor(actObjectSearch.args.objectTypeName)
  } as IObjectTitleComp;
};

export const toFactStatRows = ({
  actObject,
  facts
}: {
  actObject: ActObject;
  facts: Array<ActFact>;
}): Array<IFactStatRow> => {
  const oneLeggedFacts = facts.filter(isOneLegged);

  return _.pipe(
    _.sortBy((objectStats: ObjectStats) => objectStats.type.name),
    _.map(
      (objectStats: ObjectStats): IFactStatRow => {
        const matchingOneLeggedFacts = oneLeggedFacts.filter(oneFact => oneFact.type.name === objectStats.type.name);

        if (matchingOneLeggedFacts.length > 0) {
          return {
            cells: [
              { kind: FactStatsCellType.text, text: objectStats.type.name },
              {
                kind: FactStatsCellType.links,
                links: matchingOneLeggedFacts
                  .map(fact => ({ text: fact.value + '', tag: objectStats.type.name === 'category' }))
                  .sort((a, b) => (a.text > b.text ? 1 : -1))
              }
            ]
          };
        }

        return {
          cells: [
            { kind: FactStatsCellType.text, text: objectStats.type.name },
            { kind: FactStatsCellType.text, text: objectStats.count + '', align: 'right' as 'right' }
          ]
        };
      }
    )
  )(actObject.statistics);
};

export const getFactStats = (actObjectSearch: ActObjectSearch): TLoadable<IFactStatsComp> => {
  switch (actObjectSearch.status) {
    case LoadingStatus.PENDING:
      return { status: LoadingStatus.PENDING };
    case LoadingStatus.REJECTED:
      return { status: LoadingStatus.REJECTED, error: actObjectSearch.error };
    case LoadingStatus.DONE:
      return {
        status: LoadingStatus.DONE,
        result: { rows: toFactStatRows(actObjectSearch.result) }
      };
    default:
      // eslint-disable-next-line
      const _exhaustiveCheck: never = actObjectSearch;
  }
  return { status: LoadingStatus.REJECTED, error: 'Should never happen' };
};

export const categories = (actObjectSearch: ActObjectSearch): Array<string> => {
  if (actObjectSearch.status !== LoadingStatus.DONE) return [];

  return actObjectSearch.result.facts
    .filter(f => f.type.name === 'category')
    .map(f => f.value)
    .filter(notUndefined)
    .sort();
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
    this.appStore.backendStore.actObjectBackendStore.execute(objectValue, objectTypeName);

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
    const actObjectSearch =
      this.currentObject &&
      this.appStore.backendStore.actObjectBackendStore.getActObjectSearch(
        this.currentObject.value,
        this.currentObject.typeName
      );

    if (!this.currentObject || !actObjectSearch) {
      this.error = new Error('No object selected');
      return {
        pageMenu: this.appStore.pageMenu,
        error: {
          error: this.error,
          onClose: () => (this.error = null)
        }
      };
    }

    return {
      pageMenu: this.appStore.pageMenu,
      error: {
        error: this.error,
        onClose: () => (this.error = null)
      },
      content: {
        titleSection: {
          isLoading: actObjectSearch.status === LoadingStatus.PENDING,
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
