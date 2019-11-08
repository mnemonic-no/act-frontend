import { action, computed, observable, reaction } from 'mobx';
import * as _ from 'lodash/fp';

import MainPageStore from '../MainPageStore';
import {
  ActFact,
  ActObject,
  ContextAction,
  ContextActionTemplate,
  PredefinedObjectQuery,
  Search
} from '../../../core/types';
import CreateFactForDialog from '../../../components/CreateFactFor/DialogStore';
import { byTypeThenName, pluralize } from '../../../util/util';
import {
  contextActionsFor,
  countByFactType,
  idsToFacts,
  idsToObjects,
  predefinedObjectQueriesFor
} from '../../../core/domain';

export type ObjectDetails = {
  contextActions: Array<ContextAction>;
  predefinedObjectQueries: Array<PredefinedObjectQuery>;
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

class DetailsStore {
  root: MainPageStore;

  contextActionTemplates: Array<ContextActionTemplate>;
  predefinedObjectQueries: Array<PredefinedObjectQuery>;

  @observable createFactDialog: CreateFactForDialog | null = null;
  @observable _isOpen = false;
  @observable fadeUnselected = false;

  constructor(root: MainPageStore, config: any) {
    this.root = root;
    this.contextActionTemplates = config.contextActions || [];
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
      this.root.backendStore.executeSearch({ objectType: obj.type.name, objectValue: obj.value, query: q.query });
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
      createFactDialog: this.createFactDialog,
      onSearchSubmit: this.onSearchSubmit,
      onFactClick: this.setSelectedFact,
      onTitleClick: () => this.onSearchSubmit({ objectType: selected.type.name, objectValue: selected.value }),
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

    return {
      title: `Selection`,
      fadeUnselected: this.fadeUnselected,
      onToggleFadeUnselected: this.toggleFadeUnselected,
      factTitle: {
        text: pluralize(selectedFacts.length, 'fact'),
        onClick: () => this.showSelectedFactsTable()
      },
      factTypeLinks: factTypeLinks(selectedFacts, this.showSelectedFactsTable),
      objectTitle: {
        text: pluralize(selectedObjects.length, 'object'),
        onClick: this.showSelectedObjectsTable
      },
      objects: selectedObjects.sort(byTypeThenName),
      onObjectClick: (object: ActObject) => {
        this.root.selectionStore.removeFromSelection({ id: object.id, kind: 'object' });
      },
      onPruneObjectsClick: () => {
        this.root.refineryStore.addToPrunedObjectIds(this.root.selectionStore.currentlySelectedObjectIds);
        this.root.selectionStore.clearSelection();
      },
      onClearSelectionClick: () => {
        this.root.selectionStore.clearSelection();
      }
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
