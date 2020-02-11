import { action, computed, observable } from 'mobx';
import * as _ from 'lodash/fp';

import { ActObjectSearch } from '../../backend/ActObjectBackendStore';
import { IObjectTitleProps } from '../../components/ObjectTitle';
import { ActFact, ActObject, IObjectTypeToSections, isDone, isPending, isRejected } from '../../core/types';
import { linkOnClickFn, notUndefined, objectTypeToColor } from '../../util/util';
import {
  contextActionsFor,
  getObjectLabelFromFact,
  isOneLegged,
  objectTitle,
  toContextAction
} from '../../core/domain';
import { ContextActionTemplate, parseObjectSummary, resolveActions, TSectionConfig } from '../../configUtil';
import { CellKind, TActionCell, TCell, TSectionComp, TTagsCell, TTextCell } from './Section';
import { urlToObjectFactQueryPage, urlToObjectSummaryPage } from '../../Routing';
import AppStore from '../../AppStore';
import ObjectTraverseBackendStore from '../../backend/ObjectTraverseBackendStore';

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
  graphQueryStore: ObjectTraverseBackendStore,
  objectLabelFromFactType: string,
  postAndForgetFn: (url: string, jsonBody: any, successString: string) => void,
  navigateFn: (url: string) => void
): Array<TSectionComp> => {
  const sections =
    objectTypeToSections[currentObject.typeName] && objectTypeToSections[currentObject.typeName].sections;
  if (!sections) return [];

  return sections.map(({ title, query, actions }: TSectionConfig) => {
    const q = graphQueryStore.getItemBy({
      kind: 'objectTraverse',
      objectValue: currentObject.value,
      objectType: currentObject.typeName,
      query: query
    });

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

    const objects = Object.values(q.result.objects);
    const facts = Object.values(q.result.facts);
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
                      const x = toContextAction(o.value, o.type.name, a.action, postAndForgetFn);
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

export const getObjectTitle = (
  actObjectSearch: ActObjectSearch,
  objectLabelFromFactType: string
): IObjectTitleProps => {
  if (isDone(actObjectSearch)) {
    return objectTitle(actObjectSearch.result.actObject, actObjectSearch.result.facts, objectLabelFromFactType);
  }
  return {
    title: actObjectSearch.args.objectValue,
    subTitle: actObjectSearch.args.objectTypeName,
    color: objectTypeToColor(actObjectSearch.args.objectTypeName)
  } as IObjectTitleProps;
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
  config: { [id: string]: any };

  @observable currentObject: { typeName: string; value: string } | undefined;
  contextActionTemplates: Array<ContextActionTemplate>;

  objectTypeToSections: IObjectTypeToSections = {};

  constructor(root: AppStore, config: any) {
    this.appStore = root;
    this.config = config;
    this.objectTypeToSections =
      parseObjectSummary({ objectSummary: config.objectSummary, actions: config.actions }) || {};

    this.contextActionTemplates =
      resolveActions({ contextActions: config.contextActions, actions: config.actions }) || [];
  }

  @action.bound
  prepare(objectTypeName: string, objectValue: string) {
    this.currentObject = { typeName: objectTypeName, value: objectValue };

    const sections = this.objectTypeToSections[objectTypeName] && this.objectTypeToSections[objectTypeName].sections;
    this.appStore.backendStore.actObjectBackendStore.execute(objectValue, objectTypeName, (error: Error) => {
      this.appStore.eventBus.publish([{ kind: 'errorEvent', title: 'Failed', error: error }]);
    });

    if (sections) {
      sections.forEach(section => {
        this.appStore.backendStore.objectTraverseBackendStore
          .execute({
            kind: 'objectTraverse',
            objectValue: objectValue,
            objectType: objectTypeName,
            query: section.query
          })
          .catch(err => {}); // No need to do any additional error handling here
      });
    }
  }

  @action.bound
  openInGraphView() {
    if (!this.currentObject) return;
    this.appStore.goToUrl(
      urlToObjectFactQueryPage({
        kind: 'objectFacts',
        objectType: this.currentObject.typeName,
        objectValue: this.currentObject.value
      })
    );
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
      this.appStore.eventBus.publish([{ kind: 'errorEvent', error: new Error('No object selected') }]);

      return {
        pageMenu: this.appStore.pageMenu,
        error: this.appStore.errorSnackbar
      };
    }

    return {
      pageMenu: this.appStore.pageMenu,
      error: this.appStore.errorSnackbar,
      content: {
        titleSection: {
          isLoading: isPending(actObjectSearch),
          warning: Boolean(!this.objectTypeToSections[this.currentObject.typeName])
            ? 'Object summary is not supported for objects of this type'
            : '',
          title: getObjectTitle(actObjectSearch, this.config.objectLabelFromFactType),
          categories: categories(actObjectSearch),
          objectActions: {
            title: 'Actions',
            buttons: contextActionsFor(
              this.currentObject.value,
              this.currentObject.typeName,
              this.contextActionTemplates,
              this.appStore.backendStore.postAndForget
            ).map(contextAction => ({
              text: contextAction.name,
              onClick: contextAction.onClick,
              href: contextAction.href,
              tooltip: contextAction.description
            }))
          },
          commonActions: [{ text: 'Add to graph', tooltip: 'Add to graph view', onClick: this.openInGraphView }]
        },
        sections: prepareSections(
          this.currentObject,
          this.objectTypeToSections,
          this.appStore.backendStore.objectTraverseBackendStore,
          this.config.objectLabelFromFactType,
          this.appStore.backendStore.postAndForget,
          (url: string) => this.appStore.goToUrl(url)
        )
      }
    };
  }
}

export default ObjectSummaryPageStore;
