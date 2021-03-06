import ResultsStore from '../Results/ResultsStore';
import { action, computed, observable } from 'mobx';

import { IDetailsComp } from './Details';
import { accordionGroups, getObjectLabelFromFact, graphQueryDialog } from '../../../core/domain';
import { ActFact, ActObject, isDone, PredefinedObjectQuery, Search, TConfig } from '../../../core/types';
import { link, objectTypeToColor } from '../../../util/util';
import { IGroup } from '../../../components/GroupByAccordion';
import { IObjectTitleProps } from '../../../components/ObjectTitle';
import { urlToChartPage, urlToObjectSummaryPage } from '../../../Routing';
import AppStore from '../../../AppStore';
import EventBus from '../../../util/eventbus';

export const objectTitle = (
  actObject: ActObject,
  objectLabelFromFactType: string,
  oneLeggedFacts: Array<ActFact>,
  objectColors: { [objectType: string]: string }
): IObjectTitleProps => {
  const labelFromFact = getObjectLabelFromFact(actObject, objectLabelFromFactType, oneLeggedFacts);

  return {
    title: labelFromFact || actObject.value,
    metaTitle: labelFromFact && actObject.value,
    subTitle: actObject.type.name,
    color: objectTypeToColor(objectColors, actObject.type.name)
  };
};

class DetailsStore {
  eventBus: EventBus;
  resultsStore: ResultsStore;
  objectLabelFromFactType: string;
  appStore: AppStore;
  @observable multiSelectionAccordion: { [objectType: string]: boolean } = {};
  @observable multiSelectQueryDialog: { isOpen: boolean; actObjects: Array<ActObject>; query: string } = {
    isOpen: false,
    actObjects: [],
    query: ''
  };

  predefinedObjectQueries: Array<PredefinedObjectQuery>;
  objectColors: { [objectType: string]: string };

  constructor(appStore: AppStore, resultsStore: ResultsStore, objectLabelFromFactType: string, config: TConfig) {
    this.appStore = appStore;
    this.eventBus = appStore.eventBus;
    this.resultsStore = resultsStore;
    this.objectLabelFromFactType = objectLabelFromFactType;
    this.predefinedObjectQueries = config.predefinedObjectQueries || [];
    this.objectColors = config.objectColors || {};
  }

  @action.bound
  onAddObjectToGraph(objects: Array<ActObject>) {
    this.appStore.mainPageStore.backendStore.executeSearches({
      searches: objects.map(o => ({ kind: 'objectFacts', objectType: o.type.name, objectValue: o.value })),
      replace: false
    });

    // Clear selection and show graph
    this.resultsStore.clearSelection();
    this.eventBus.publish([{ kind: 'navigate', url: urlToChartPage() }]);
  }

  @action.bound
  openQueryDialog(objects: Array<ActObject>) {
    this.multiSelectQueryDialog = {
      isOpen: true,
      actObjects: objects,
      query: ''
    };
  }

  @action.bound
  onSearchSubmit(search: Search) {
    this.appStore.backendStore.executeSearch(search);
  }

  @action.bound
  onMultiObjectTraverseSubmit(actObjects: Array<ActObject>, query: string) {
    if (actObjects.length === 1) {
      this.onSearchSubmit({
        kind: 'objectTraverse',
        query: query,
        objectType: actObjects[0].type.name,
        objectValue: actObjects[0].value
      });
    } else {
      this.appStore.backendStore.executeSearch({
        kind: 'multiObjectTraverse',
        objectType: actObjects[0]?.type.name,
        objectIds: actObjects.map(x => x.id),
        query: query
      });
    }
    this.appStore.goToUrl(urlToChartPage());
  }

  @computed
  get prepared(): IDetailsComp {
    const activeSimpleSearch = this.resultsStore.activeSimpleSearch;
    const selectedObjects = this.resultsStore.selectedObjects;

    if (selectedObjects.length <= 0) {
      return { kind: 'empty' };
    }

    if (selectedObjects.length === 1) {
      const selectedObject = selectedObjects[0];
      return {
        kind: 'object' as 'object',
        content: {
          title: 'Selection',
          linkToSummaryPage: link({
            text: 'Open summary',
            tooltip: 'Go to object summary page',
            href: urlToObjectSummaryPage(selectedObject),
            navigateFn: (url: string) => this.eventBus.publish([{ kind: 'navigate', url: url }])
          }),
          objectTitle: objectTitle(
            selectedObject,
            this.objectLabelFromFactType,
            isDone(activeSimpleSearch) ? activeSimpleSearch.result.facts : [],
            this.objectColors
          ),
          clearSelectionButton: {
            text: 'Clear',
            tooltip: 'Clear Selection',
            onClick: this.resultsStore.clearSelection
          },
          actions: [
            {
              text: 'Add to graph',
              tooltip: 'Run the default graph query based on this object',
              onClick: () => this.onAddObjectToGraph([selectedObject])
            }
          ]
        }
      };
    }

    return {
      kind: 'objects' as 'objects',
      content: {
        title: 'Selection',
        subTitle: selectedObjects.length + ' objects',
        clearSelectionButton: {
          text: 'Clear',
          tooltip: 'Clear Selection',
          onClick: this.resultsStore.clearSelection
        },
        objectTypeGroupByAccordion: {
          onToggle: (group: IGroup) => {
            this.multiSelectionAccordion = {
              ...this.multiSelectionAccordion,
              [group.title.text]: !Boolean(this.multiSelectionAccordion[group.title.text])
            };
          },
          groups: accordionGroups({
            actObjects: selectedObjects,
            isAccordionExpanded: this.multiSelectionAccordion,
            groupActions: [
              {
                text: 'Query',
                onClick: (objectsOfType: Array<ActObject>) => {
                  this.openQueryDialog(objectsOfType);
                }
              },
              {
                text: 'Clear',
                onClick: (objectsOfType: Array<ActObject>) => {
                  this.resultsStore.removeAllFromSelection(objectsOfType.map(x => x.id));
                }
              }
            ],
            itemAction: {
              tooltip: 'Unselect',
              icon: 'close',
              onClick: (actObject: ActObject) => {
                this.resultsStore.toggleSelection(actObject.id);
              }
            },
            objectColors: this.objectColors
          })
        },
        graphQueryDialog: graphQueryDialog({
          isOpen: this.multiSelectQueryDialog.isOpen,
          query: this.multiSelectQueryDialog.query,
          actObjects: this.multiSelectQueryDialog.actObjects,
          predefinedObjectQueries: this.predefinedObjectQueries,
          objectColors: this.objectColors,
          onQueryChange: (q: string) => {
            this.multiSelectQueryDialog.query = q;
          },
          onSubmit: (actObjects: Array<ActObject>, query: string) => {
            this.multiSelectQueryDialog.isOpen = false;
            this.onMultiObjectTraverseSubmit(actObjects, query);
            this.multiSelectQueryDialog.query = '';
          },
          onClose: () => {
            this.multiSelectQueryDialog.isOpen = false;
            this.multiSelectQueryDialog.query = '';
          }
        }),
        actions: [
          {
            text: 'Add objects to graph',
            tooltip: 'Run graph queries, one per object',
            onClick: () => this.onAddObjectToGraph(selectedObjects)
          }
        ]
      }
    };
  }
}

export default DetailsStore;
