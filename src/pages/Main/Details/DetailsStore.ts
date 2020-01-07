import { action, computed, observable, reaction } from 'mobx';
import * as _ from 'lodash/fp';

import {
  ActFact,
  ActObject,
  ActSelection,
  ContextAction,
  NamedId,
  PredefinedObjectQuery,
  Search
} from '../../../core/types';
import { link, objectTypeToColor, pluralize } from '../../../util/util';
import { ContextActionTemplate, resolveActions } from '../../../configUtil';
import { urlToObjectSummaryPage } from '../../../Routing';
import {
  contextActionsFor,
  countByFactType,
  idsToFacts,
  idsToObjects,
  predefinedObjectQueriesFor
} from '../../../core/domain';
import AppStore from '../../../AppStore';
import CreateFactForDialog from '../../../components/CreateFactFor/DialogStore';
import MainPageStore from '../MainPageStore';
import { IGroup } from '../../../components/GroupByAccordion';

export type ObjectDetails = {
  contextActions: Array<ContextAction>;
  predefinedObjectQueries: Array<PredefinedObjectQuery>;
};

const actObjectToSelection = (actObject: ActObject): ActSelection => {
  return { id: actObject.id, kind: 'object' };
};

export const factTypeLinks = (
  selectedFacts: Array<ActFact>,
  onClick: (factType: string) => void
): Array<{ text: string; onClick: () => void }> => {
  return _.pipe(
    countByFactType,
    _.entries,
    _.sortBy(([factType, count]) => factType),
    _.map(([factType, count]) => ({
      text: count + ' ' + factType,
      onClick: () => onClick(factType)
    }))
  )(selectedFacts);
};

export const accordionGroups = ({
  actObjects,
  unSelectFn,
  openQueryDialogFn,
  isAccordionExpanded
}: {
  actObjects: Array<ActObject>;
  unSelectFn: (selection: Array<ActSelection>) => void;
  openQueryDialogFn: (objects: Array<ActObject>) => void;
  isAccordionExpanded: { [objectTypeName: string]: boolean };
}) => {
  return _.pipe(
    _.groupBy((o: ActObject) => o.type.name),
    _.entries,
    _.map(([objectTypeName, objectsOfType]: [string, Array<ActObject>]) => {
      return {
        title: { text: objectTypeName, color: objectTypeToColor(objectTypeName) },
        actions: [
          {
            text: 'Query',
            onClick: () => {
              openQueryDialogFn(objectsOfType);
            }
          },
          {
            text: 'Clear',
            onClick: () => {
              unSelectFn(objectsOfType.map(actObjectToSelection));
            }
          }
        ],
        isExpanded: isAccordionExpanded[objectTypeName],
        items: _.pipe(
          _.map((actObject: ActObject) => ({
            text: actObject.value,
            iconAction: {
              icon: 'close',
              tooltip: 'Unselect',
              onClick: () => {
                unSelectFn([actObjectToSelection(actObject)]);
              }
            }
          })),
          _.sortBy(x => x.text)
        )(objectsOfType)
      };
    }),
    _.sortBy(x => x.title.text)
  )(actObjects);
};

const graphQueryDialog = (props: {
  isOpen: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  onSubmit: (actObjects: Array<ActObject>, query: string) => void;
  onClose: () => void;
  actObjects: Array<ActObject>;
  predefinedObjectQueries: Array<PredefinedObjectQuery>;
}) => {
  const objectType = props.actObjects[0]?.type.name;

  return {
    isOpen: props.isOpen,
    graphQuery: {
      value: props.query,
      onChange: props.onQueryChange
    },
    description:
      props.actObjects.length > 1
        ? {
            text: pluralize(props.actObjects.length, props.actObjects[0]?.type.name),
            color: objectTypeToColor(objectType)
          }
        : {
            text: props.actObjects[0]?.type?.name + ' ' + props.actObjects[0]?.value,
            color: objectTypeToColor(objectType)
          },
    predefinedObjectQueries: {
      onClick: (q: PredefinedObjectQuery) => {
        props.onSubmit(props.actObjects, q.query);
      },
      queries: predefinedObjectQueriesFor(props.actObjects[0], props.predefinedObjectQueries)
    },
    onClose: props.onClose,
    onSubmit: () => {
      props.onSubmit(props.actObjects, props.query);
    }
  };
};

class DetailsStore {
  appStore: AppStore;
  root: MainPageStore;

  contextActionTemplates: Array<ContextActionTemplate>;
  predefinedObjectQueries: Array<PredefinedObjectQuery>;

  @observable createFactDialog: CreateFactForDialog | null = null;
  @observable _isOpen = false;
  @observable fadeUnselected = false;

  @observable multiSelectionAccordion: { [objectType: string]: boolean } = {};
  @observable multiSelectQueryDialog: { isOpen: boolean; actObjects: Array<ActObject> } = {
    isOpen: false,
    actObjects: []
  };
  @observable multiSelectQueryDialogGraphQuery: string = '';

  constructor(appStore: AppStore, root: MainPageStore, config: any) {
    this.appStore = appStore;
    this.root = root;
    this.contextActionTemplates =
      resolveActions({ contextActions: config.contextActions, actions: config.actions }) || [];
    this.predefinedObjectQueries = config.predefinedObjectQueries || [];

    reaction(
      () => this.root.selectionStore.currentlySelected,
      currentlySelected => {
        if (Object.keys(currentlySelected).length > 0) {
          this.open();
        }
      }
    );
  }

  @action.bound
  onSearchSubmit(search: Search) {
    this.root.backendStore.executeSearch(search);
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
      this.root.backendStore.executeSearch({
        kind: 'multiObjectTraverse',
        objectType: actObjects[0]?.type.name,
        objectIds: actObjects.map(x => x.id),
        query: query
      });
    }
  }

  @computed get endTimestamp() {
    return this.root.refineryStore.endTimestamp;
  }

  @computed get selectedObject(): ActObject | null {
    const selected = Object.values(this.root.selectionStore.currentlySelected)[0];

    if (selected && selected.kind === 'object') {
      return this.root.workingHistory.result.objects[selected.id];
    } else {
      return null;
    }
  }

  @action.bound
  onPredefinedObjectQueryClick(q: PredefinedObjectQuery): void {
    const obj = this.selectedObject;
    if (obj) {
      this.root.backendStore.executeSearch({
        kind: 'objectTraverse',
        objectType: obj.type.name,
        objectValue: obj.value,
        query: q.query
      });
    }
  }

  @action.bound
  close(): void {
    this._isOpen = false;
  }

  @action.bound
  open(): void {
    this._isOpen = true;
  }

  @action.bound
  toggle(): void {
    this._isOpen = !this._isOpen;
  }

  @computed
  get isOpen() {
    return this._isOpen && Boolean(this.selectedObjectDetails || this.selectedFactDetails);
  }

  @action.bound
  toggleFadeUnselected(): void {
    this.fadeUnselected = !this.fadeUnselected;
  }

  @computed
  get selectedObjectDetails() {
    const selected = this.selectedObject;

    if (!selected) return null;

    return {
      id: selected.id,
      details: {
        contextActions: contextActionsFor(
          selected,
          this.contextActionTemplates,
          this.root.backendStore.postAndForget.bind(this.root.backendStore)
        ),
        predefinedObjectQueries: predefinedObjectQueriesFor(selected, this.predefinedObjectQueries)
      },
      linkToSummaryPage: link({
        text: 'Open summary',
        tooltip: 'Go to object summary page',
        href: urlToObjectSummaryPage(selected),
        navigateFn: (url: string) => this.appStore.goToUrl(url)
      }),

      createFactDialog: this.createFactDialog,
      onFactClick: this.setSelectedFact,
      onFactTypeClick: (factType: NamedId) => {
        this.onSearchSubmit({
          kind: 'objectFacts',
          objectType: selected.type.name,
          objectValue: selected.value,
          factTypes: [factType.name]
        });
      },
      onTitleClick: () =>
        this.onSearchSubmit({ kind: 'objectFacts', objectType: selected.type.name, objectValue: selected.value }),
      onPredefinedObjectQueryClick: this.onPredefinedObjectQueryClick,
      onCreateFactClick: this.onCreateFactClick,
      onPruneObject: (o: ActObject) => {
        this.root.refineryStore.addToPrunedObjectIds([o.id]);
        this.root.selectionStore.clearSelection();
      }
    };
  }

  @computed
  get selectedFactDetails() {
    const selected = Object.values(this.root.selectionStore.currentlySelected)[0];

    if (!selected || selected.kind !== 'fact') return null;

    return {
      id: selected.id,
      endTimestamp: this.endTimestamp,
      onObjectRowClick: this.setSelectedObject,
      onFactRowClick: this.setSelectedFact,
      onReferenceClick: (fact: ActFact) => {
        if (fact.inReferenceTo) {
          this.root.selectionStore.setCurrentSelection({ kind: 'fact', id: fact.inReferenceTo.id });
        }
      }
    };
  }

  @action.bound
  showSelectedFactsTable(onlyFactType?: string) {
    this.root.ui.factsTableStore.setFilters({
      filterSelected: true,
      factTypeFilter: onlyFactType ? new Set([onlyFactType]) : new Set()
    });
    this.root.ui.contentStore.onTabSelected('tableOfFacts');
  }

  @action.bound
  showSelectedObjectsTable() {
    this.root.ui.objectsTableStore.setFilters({
      filterSelected: true
    });
    this.root.ui.contentStore.onTabSelected('tableOfObjects');
  }

  @action.bound
  openQueryDialog(objects: Array<ActObject>) {
    this.multiSelectQueryDialog = {
      isOpen: true,
      actObjects: objects
    };
  }

  @action.bound
  setMultiSelectQueryDialogGraphQuery(s: string) {
    this.multiSelectQueryDialogGraphQuery = s;
  }

  @computed
  get multiSelectInfo() {
    const selectedObjects = idsToObjects(
      this.root.selectionStore.currentlySelectedObjectIds,
      this.root.workingHistory.result.objects
    );
    const selectedFacts = idsToFacts(
      this.root.selectionStore.currentlySelectedFactIds,
      this.root.workingHistory.result.facts
    );

    const actObjects = this.multiSelectQueryDialog.actObjects.slice();

    return {
      title: 'Selection',
      graphQueryDialog: graphQueryDialog({
        isOpen: this.multiSelectQueryDialog.isOpen,
        query: this.multiSelectQueryDialogGraphQuery,
        actObjects: actObjects,
        predefinedObjectQueries: this.predefinedObjectQueries,
        onQueryChange: (q: string) => {
          this.multiSelectQueryDialogGraphQuery = q;
        },
        onSubmit: (actObjects: Array<ActObject>, query: string) => {
          this.multiSelectQueryDialog.isOpen = false;
          this.onMultiObjectTraverseSubmit(actObjects, query);
          this.multiSelectQueryDialogGraphQuery = '';
        },
        onClose: () => {
          this.multiSelectQueryDialog.isOpen = false;
          this.multiSelectQueryDialogGraphQuery = '';
        }
      }),
      fadeUnselected: this.fadeUnselected,
      onToggleFadeUnselected: this.toggleFadeUnselected,
      factTitle: {
        text: pluralize(selectedFacts.length, 'fact'),
        onClick: () => this.showSelectedFactsTable(),
        onClearClick: () =>
          this.root.selectionStore.removeAllFromSelection(selectedFacts.map(x => ({ id: x.id, kind: 'fact' })))
      },
      factTypeLinks: factTypeLinks(selectedFacts, this.showSelectedFactsTable),
      objectTitle: {
        text: pluralize(selectedObjects.length, 'object'),
        onClick: this.showSelectedObjectsTable,
        onClearClick: () => this.root.selectionStore.removeAllFromSelection(selectedObjects.map(actObjectToSelection))
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
          openQueryDialogFn: (objects: Array<ActObject>) => {
            this.openQueryDialog(objects);
          },
          unSelectFn: (selection: Array<ActSelection>) => this.root.selectionStore.removeAllFromSelection(selection)
        })
      },
      onClearSelectionClick: () => {
        this.root.selectionStore.clearSelection();
      },
      actions: [
        {
          text: 'Prune objects',
          tooltip: 'Prune the selected objects from the view',
          onClick: () => {
            this.root.refineryStore.addToPrunedObjectIds(this.root.selectionStore.currentlySelectedObjectIds);
            this.root.selectionStore.clearSelection();
          }
        }
      ]
    };
  }

  @action.bound
  setSelectedObject(actObject: ActObject) {
    this.root.selectionStore.setCurrentSelection({ kind: 'object', id: actObject.id });
  }

  @action.bound
  setSelectedFact(fact: ActFact) {
    this.root.selectionStore.setCurrentSelection({ kind: 'fact', id: fact.id });
  }

  @action.bound
  onCreateFactClick() {
    if (this.selectedObject) {
      this.createFactDialog = new CreateFactForDialog(this.selectedObject, this.root.workingHistory, []);
    }
  }

  @computed
  get contentsKind(): 'empty' | 'objects' | 'object' | 'fact' {
    const selectionCount = Object.keys(this.root.selectionStore.currentlySelected).length;

    if (selectionCount === 0) {
      return 'empty';
    } else if (selectionCount > 1) {
      return 'objects';
    }

    return Object.values(this.root.selectionStore.currentlySelected)[0].kind;
  }
}

export default DetailsStore;
