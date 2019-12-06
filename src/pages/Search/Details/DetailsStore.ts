import ResultsStore from '../Results/ResultsStore';
import { action, computed } from 'mobx';

import { IDetailsComp } from './Details';
import { ActFact, ActObject, isDone } from '../../../core/types';
import { getObjectLabelFromFact } from '../../../core/domain';
import { link, objectTypeToColor } from '../../../util/util';
import AppStore from '../../../AppStore';
import { IObjectTitleComp } from '../../../components/ObjectTitle';
import { urlToObjectSummaryPage } from '../../../Routing';

export const objectTitle = (
  actObject: ActObject,
  objectLabelFromFactType: string,
  oneLeggedFacts: Array<ActFact>
): IObjectTitleComp => {
  const labelFromFact = getObjectLabelFromFact(actObject, objectLabelFromFactType, oneLeggedFacts);

  return {
    title: labelFromFact || actObject.value,
    metaTitle: labelFromFact && actObject.value,
    subTitle: actObject.type.name,
    color: objectTypeToColor(actObject.type.name)
  };
};

class DetailsStore {
  resultsStore: ResultsStore;
  objectLabelFromFactType: string;
  appStore: AppStore;

  constructor(appStore: AppStore, resultsStore: ResultsStore, objectLabelFromFactType: string) {
    this.appStore = appStore;
    this.resultsStore = resultsStore;
    this.objectLabelFromFactType = objectLabelFromFactType;
  }

  @action.bound
  onAddObjectToGraph(objects: Array<ActObject>) {
    this.appStore.mainPageStore.backendStore.executeSearches({
      searches: objects.map(o => ({ objectType: o.type.name, objectValue: o.value })),
      replace: false
    });

    // Clear selection and show graph
    this.resultsStore.clearSelection();
    this.appStore.goToUrl('/chart');
  }

  @action.bound
  onOpenObjectSummaryPage(actObject: ActObject) {
    this.appStore.goToUrl(urlToObjectSummaryPage(actObject));
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
            navigateFn: (url: string) => this.appStore.goToUrl(url)
          }),
          objectTitle: objectTitle(
            selectedObject,
            this.objectLabelFromFactType,
            isDone(activeSimpleSearch) ? activeSimpleSearch.result.facts : []
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
