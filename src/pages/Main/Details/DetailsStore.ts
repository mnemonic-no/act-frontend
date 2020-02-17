import { action, computed, observable } from 'mobx';
import * as _ from 'lodash/fp';

import {
  ActFact,
  ActObject,
  ActSelection,
  isDone,
  isPending,
  NamedId,
  ObjectStats,
  PredefinedObjectQuery,
  SearchResult,
  SingleFactSearch
} from '../../../core/types';
import { link, pluralize } from '../../../util/util';
import { ContextActionTemplate, resolveActions } from '../../../configUtil';
import { urlToObjectSummaryPage } from '../../../Routing';
import {
  accordionGroups,
  contextActionsFor,
  countByFactType,
  factCount,
  graphQueryDialog,
  idsToFacts,
  idsToObjects,
  objectTitle,
  predefinedObjectQueriesFor
} from '../../../core/domain';
import AppStore from '../../../AppStore';
import CreateFactForDialog from '../../../components/CreateFactFor/DialogStore';
import MainPageStore from '../MainPageStore';
import { IGroup } from '../../../components/GroupByAccordion';
import EventBus from '../../../util/eventbus';
import config from '../../../config';
import { retractFact } from '../../../components/RetractFact/Dialog';
import { FactStatsCellType, IFactStatRow } from '../../../components/FactStats';

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

export const selectionToContentsKind = (currentlySelected: {
  [id: string]: ActSelection;
}): 'empty' | 'multi' | 'fact' | 'object' => {
  const selectionCount = Object.keys(currentlySelected).length;

  if (selectionCount === 0) {
    return 'empty';
  } else if (selectionCount > 1) {
    return 'multi';
  } else {
    return Object.values(currentlySelected)[0].kind;
  }
};

export const toFactStatRows = (props: {
  actObject: ActObject;
  oneLeggedFacts: Array<ActFact>;
  onFactTypeClick: (factType: NamedId) => void;
  factTypeTooltip: string;
  onFactClick: (fact: ActFact) => void;
  factTooltip: string;
}): Array<IFactStatRow> => {
  return _.pipe(
    _.sortBy((objectStats: ObjectStats) => objectStats.type.name),
    _.map(
      (objectStats: ObjectStats): IFactStatRow => {
        const matchingOneLeggedFacts = props.oneLeggedFacts.filter(
          oneFact => oneFact.type.name === objectStats.type.name
        );

        if (matchingOneLeggedFacts.length > 0) {
          return {
            cells: [
              { kind: FactStatsCellType.text, text: objectStats.type.name },
              {
                kind: FactStatsCellType.links,
                links: matchingOneLeggedFacts
                  .map(x => ({
                    text: x.value + '',
                    tag: objectStats.type.name === 'category',
                    tooltip: props.factTooltip,
                    onClick: () => props.onFactClick(x)
                  }))
                  .sort((a, b) => (a.text > b.text ? 1 : -1))
              }
            ]
          };
        }

        return {
          onClick: () => props.onFactTypeClick(objectStats.type),
          tooltip: props.factTypeTooltip,
          cells: [
            { kind: FactStatsCellType.text, text: objectStats.type.name },
            { kind: FactStatsCellType.text, text: objectStats.count + '', align: 'right' as 'right' }
          ]
        };
      }
    )
  )(props.actObject.statistics);
};

class DetailsStore {
  eventBus: EventBus;
  root: MainPageStore;

  contextActionTemplates: Array<ContextActionTemplate>;
  predefinedObjectQueries: Array<PredefinedObjectQuery>;

  @observable createFactDialog: CreateFactForDialog | null = null;
  @observable _isOpen = false;
  @observable fadeUnselected = false;
  @observable contentsKind: 'empty' | 'multi' | 'fact' | 'object' = 'empty';

  @observable multiSelectionAccordion: { [objectType: string]: boolean } = {};
  @observable multiSelectQueryDialog: { isOpen: boolean; actObjects: Array<ActObject>; query: string } = {
    isOpen: false,
    actObjects: [],
    query: ''
  };

  constructor(appStore: AppStore, root: MainPageStore, config: any) {
    this.root = root;
    this.eventBus = appStore.eventBus;
    this.contextActionTemplates =
      resolveActions({ contextActions: config.contextActions, actions: config.actions }) || [];
    this.predefinedObjectQueries = config.predefinedObjectQueries || [];
  }

  @action.bound
  selectionChanged() {
    if (Object.keys(this.root.selectionStore.currentlySelected).length > 0) {
      this.open();
    }

    this.contentsKind = selectionToContentsKind(this.root.selectionStore.currentlySelected);

    if (this.contentsKind === 'fact') {
      const factId = Object.values(this.root.selectionStore.currentlySelected)[0].id;
      if (factId && !this.root.backendStore.factBackendStore.includes(factId)) {
        // Most facts are already in the working history, but this fetches comments and metafacts too.
        this.eventBus.publish([{ kind: 'fetchFact', factId: factId }]);
      }
    } else if (this.contentsKind === 'object') {
      const actObject = this.root.workingHistory.getObjectById(
        Object.values(this.root.selectionStore.currentlySelected)[0].id
      );
      if (actObject && !this.root.backendStore.actObjectBackendStore.includesActObject(actObject)) {
        this.eventBus.publish([
          { kind: 'fetchActObjectStats', objectValue: actObject.value, objectTypeName: actObject.type.name },
          { kind: 'fetchOneLeggedFacts', objectId: actObject.id }
        ]);
      }
    }
  }

  @action.bound
  onMultiObjectTraverseSubmit(actObjects: Array<ActObject>, query: string) {
    if (actObjects.length === 1) {
      this.root.backendStore.executeSearch({
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
  onPredefinedObjectQueryClick(obj: ActObject, q: PredefinedObjectQuery): void {
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

    const actObjectSearch = this.root.backendStore.actObjectBackendStore.getActObjectSearch(
      selected.value,
      selected.type.name
    );

    const oneLeggedFactsSearch = this.root.backendStore.oneLeggedFactsStore.getOneLeggedFacts(selected.id);
    const oneLeggedFacts: Array<ActFact> = isDone(oneLeggedFactsSearch) ? oneLeggedFactsSearch.result.facts : [];

    return {
      id: selected.id,
      objectTitle: {
        ...objectTitle(selected, oneLeggedFacts, config.objectLabelFromFactType),
        onTitleClick: () =>
          this.root.backendStore.executeSearch({
            kind: 'objectFacts',
            objectType: selected.type.name,
            objectValue: selected.value
          })
      },
      isLoadingData: isPending(actObjectSearch),

      actions: [
        {
          title: 'Actions',
          buttons: contextActionsFor(
            selected.value,
            selected.type.name,
            this.contextActionTemplates,
            this.root.backendStore.postAndForget.bind(this.root.backendStore)
          ).map(contextAction => ({
            text: contextAction.name,
            onClick: contextAction.onClick,
            href: contextAction.href,
            tooltip: contextAction.description
          }))
        },
        {
          title: 'Predefined queries',
          buttons: predefinedObjectQueriesFor(selected, this.predefinedObjectQueries).map(p => ({
            text: p.name,
            tooltip: p.description,
            onClick: () => this.onPredefinedObjectQueryClick(selected, p)
          }))
        }
      ],
      details: {
        contextActions: contextActionsFor(
          selected.value,
          selected.type.name,
          this.contextActionTemplates,
          this.root.backendStore.postAndForget.bind(this.root.backendStore)
        ),
        predefinedObjectQueries: predefinedObjectQueriesFor(selected, this.predefinedObjectQueries).map(p => ({
          text: p.name,
          tooltip: p.description,
          onClick: () => this.onPredefinedObjectQueryClick(selected, p)
        }))
      },
      linkToSummaryPage: link({
        text: 'Open summary',
        tooltip: 'Go to object summary page',
        href: urlToObjectSummaryPage(selected),
        navigateFn: (url: string) => this.eventBus.publish([{ kind: 'navigate', url: url }])
      }),
      factTitle: isDone(actObjectSearch) ? pluralize(factCount(actObjectSearch.result.actObject), 'fact') : '',
      factStats: isDone(actObjectSearch)
        ? {
            rows: toFactStatRows({
              actObject: actObjectSearch.result.actObject,
              oneLeggedFacts: oneLeggedFacts,
              onFactTypeClick: (factType: NamedId) => {
                this.root.backendStore.executeSearch({
                  kind: 'objectFacts',
                  objectType: selected.type.name,
                  objectValue: selected.value,
                  factTypes: [factType.name]
                });
              },
              onFactClick: this.setSelectedFact,
              factTooltip: 'Show fact',
              factTypeTooltip: 'Execute search'
            })
          }
        : { rows: [] },
      createFactDialog: this.createFactDialog,
      graphQueryDialog: graphQueryDialog({
        isOpen: this.multiSelectQueryDialog.isOpen,
        query: this.multiSelectQueryDialog.query,
        actObjects: [selected],
        predefinedObjectQueries: this.predefinedObjectQueries,
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
      footerButtons: [
        {
          text: 'Prune',
          onClick: () => {
            this.root.refineryStore.addToPrunedObjectIds([selected.id]);
            this.eventBus.publish([{ kind: 'selectionClear' }]);
          }
        },
        {
          text: 'Graph Query',
          onClick: () => {
            this.multiSelectQueryDialog.isOpen = true;
          }
        },
        { text: 'Create Fact', onClick: this.onCreateFactClick }
      ]
    };
  }

  @computed
  get selectedFactDetails() {
    const selected = Object.values(this.root.selectionStore.currentlySelected)[0];

    if (!selected || selected.kind !== 'fact') return null;

    // Most facts are already in the working history, but some must be fetched (like metafacts).
    const factSearch = this.root.backendStore.factBackendStore.getFact(selected.id);
    const fact = isDone(factSearch) ? factSearch.result.fact : this.root.workingHistory.getFactById(selected.id);

    return {
      id: selected.id,
      fact: fact,
      isLoadingData: isPending(factSearch),
      metaFacts: isDone(factSearch) ? factSearch.result.metaFacts : [],
      comments: isDone(factSearch) ? factSearch.result.comments : [],
      endTimestamp: this.endTimestamp,
      onObjectRowClick: this.setSelectedObject,
      onFactRowClick: this.setSelectedFact,
      onReferenceClick: (fact: ActFact) => {
        if (fact.inReferenceTo) {
          this.eventBus.publish([
            {
              kind: 'selectionReset',
              selection: { [fact.inReferenceTo.id]: { kind: 'fact', id: fact.inReferenceTo.id } }
            }
          ]);
        }
      },
      footerButtons: [
        {
          text: 'Retract fact',
          onClick: () => {
            if (!fact) return;
            retractFact(fact, () => {
              // Wait 1 second before updating the data, allowing the api to reindex
              setTimeout(() => {
                this.eventBus.publish([{ kind: 'fetchFact', factId: fact.id, refetch: true }]);
              }, 1000);
            });
          }
        }
      ]
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
      actObjects: objects,
      query: ''
    };
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
        query: this.multiSelectQueryDialog.query,
        actObjects: actObjects,
        predefinedObjectQueries: this.predefinedObjectQueries,
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
      fadeUnselected: this.fadeUnselected,
      onToggleFadeUnselected: this.toggleFadeUnselected,
      factTitle: {
        text: pluralize(selectedFacts.length, 'fact'),
        onClick: () => this.showSelectedFactsTable(),
        onClearClick: () =>
          this.eventBus.publish([
            { kind: 'selectionRemove', removeAll: selectedFacts.map(x => ({ id: x.id, kind: 'fact' })) }
          ])
      },
      factTypeLinks: factTypeLinks(selectedFacts, this.showSelectedFactsTable),
      objectTitle: {
        text: pluralize(selectedObjects.length, 'object'),
        onClick: this.showSelectedObjectsTable,
        onClearClick: () =>
          this.eventBus.publish([{ kind: 'selectionRemove', removeAll: selectedObjects.map(actObjectToSelection) }])
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
                this.eventBus.publish([
                  { kind: 'selectionRemove', removeAll: objectsOfType.map(actObjectToSelection) }
                ]);
              }
            }
          ],
          itemAction: {
            icon: 'close',
            tooltip: 'Unselect this object',
            onClick: (actObject: ActObject) => {
              this.eventBus.publish([{ kind: 'selectionRemove', removeAll: [actObjectToSelection(actObject)] }]);
            }
          }
        })
      },
      onClearSelectionClick: () => {
        this.eventBus.publish([{ kind: 'selectionClear' }]);
      },
      actions: [
        {
          text: 'Prune objects',
          tooltip: 'Prune the selected objects from the view',
          onClick: () => {
            this.root.refineryStore.addToPrunedObjectIds(this.root.selectionStore.currentlySelectedObjectIds);
            this.eventBus.publish([{ kind: 'selectionClear' }]);
          }
        }
      ]
    };
  }

  @action.bound
  setSelectedObject(actObject: ActObject) {
    this.eventBus.publish([
      { kind: 'selectionReset', selection: { [actObject.id]: { kind: 'object', id: actObject.id } } }
    ]);
  }

  @action.bound
  setSelectedFact(fact: ActFact) {
    this.eventBus.publish([{ kind: 'selectionReset', selection: { [fact.id]: { kind: 'fact', id: fact.id } } }]);
  }

  @action.bound
  onCreateFactClick() {
    if (this.selectedObject && this.root.backendStore.factTypes && isDone(this.root.backendStore.factTypes)) {
      const factTypes = this.root.backendStore.factTypes.result.factTypes;
      this.createFactDialog = new CreateFactForDialog(
        { value: this.selectedObject.value, typeName: this.selectedObject.type.name },
        factTypes,
        (props: { search: SingleFactSearch; result: SearchResult }) => {
          this.eventBus.publish([
            { kind: 'notification', text: 'Fact created' },
            { kind: 'workingHistoryAddCreatedFactItem', search: props.search, result: props.result }
          ]);
        }
      );
    }
  }
}

export default DetailsStore;
