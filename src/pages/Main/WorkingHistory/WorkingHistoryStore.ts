import { action, computed } from 'mobx';
import * as _ from 'lodash/fp';

import {
  isObjectFactsSearch,
  WorkingHistoryItem,
  PredefinedObjectQuery,
  isFactSearch,
  Search,
  isObjectTraverseSearch,
  SearchResult,
  TLoadable,
  isPending,
  isMultiObjectSearch,
  isDone,
  ActSelection,
  ActObject,
  StateExportv2,
  StateExport,
  isRejected
} from '../../../core/types';
import {
  exportToJson,
  fileTimeString,
  copyToClipBoard,
  objectTypeToColor,
  factColor,
  assertNever
} from '../../../util/util';
import MainPageStore from '../MainPageStore';
import { addMessage } from '../../../util/SnackbarProvider';
import { TDetails, TIcon } from './WorkingHistory';
import { searchId } from '../../../core/domain';
import EventBus from '../../../util/eventbus';

const copy = (si: WorkingHistoryItem) => {
  if (isObjectTraverseSearch(si.search) || isMultiObjectSearch(si.search)) {
    try {
      copyToClipBoard(si.search.query);
      addMessage('Query copied to clipboard');
    } catch (err) {
      console.log('Failed to copy to clipboard');
    }
  }
};

export const itemTitle = (s: Search) => {
  if (isObjectFactsSearch(s)) {
    return [{ text: s.objectType + ' ', color: objectTypeToColor(s.objectType) }, { text: s.objectValue }];
  } else if (isObjectTraverseSearch(s)) {
    return [{ text: s.objectType + ' ', color: objectTypeToColor(s.objectType) }, { text: s.objectValue }];
  } else if (isFactSearch(s)) {
    return [{ text: 'Fact ', color: factColor }, { text: s.factTypeName }];
  } else if (isMultiObjectSearch(s)) {
    return [
      { text: s.objectType + ' ', color: objectTypeToColor(s.objectType) },
      { text: s.objectIds.length + ' objects' }
    ];
  }
  assertNever(s);
  return [{ text: 'n/a', color: 'red' }];
};

export const itemDetails = (
  si: WorkingHistoryItem,
  predefinedQueryToName: { [query: string]: string }
): TDetails | undefined => {
  if (isObjectFactsSearch(si.search)) {
    if (si.search.factTypes) {
      return {
        kind: 'label-text',
        label: 'Fact types:',
        text: si.search.factTypes.join(',')
      };
    }
    return undefined;
  }

  if (isFactSearch(si.search)) {
    return {
      kind: 'label-text',
      label: 'Id:',
      text: si.id
    };
  }

  if (isObjectTraverseSearch(si.search) || isMultiObjectSearch(si.search)) {
    const predefinedQueryName = predefinedQueryToName[si.search.query];
    if (predefinedQueryName) {
      return {
        kind: 'tag',
        label: 'Query:',
        text: predefinedQueryName
      };
    }
    return {
      kind: 'label-text',
      label: 'Query:',
      text: si.search.query
    };
  }
};

export const itemActions = (si: WorkingHistoryItem, onRemoveClick: () => void, onCopyClick: () => void) => {
  const actions = [{ icon: 'remove' as TIcon, tooltip: 'Remove', onClick: onRemoveClick }];

  if (isObjectTraverseSearch(si.search) || isMultiObjectSearch(si.search)) {
    return [
      {
        icon: 'copy' as TIcon,
        onClick: onCopyClick,
        tooltip: 'Copy query to clipboard'
      },
      ...actions
    ];
  }

  return actions;
};

export const stateExport = (items: Array<WorkingHistoryItem>, prunedObjectIds: Set<string>): StateExportv2 => {
  const searches = items.map((q: any) => ({ ...q.search })).filter(x => !isFactSearch(x));
  return { version: '2.0.0', searches: searches, prunedObjectIds: [...prunedObjectIds] };
};

export const toV2 = (contentJson: StateExport) => ({
  version: '2.0.0',
  searches: contentJson?.queries.map((x: any) => {
    if (x.query && x.query.length > 0) {
      return {
        ...x,
        kind: 'objectTraverse'
      };
    } else {
      return {
        ...x,
        kind: 'objectFacts'
      };
    }
  }),
  prunedObjectIds: contentJson.prunedObjectIds
});

export const parseStateExport = (contentJson: any): StateExportv2 => {
  if (typeof contentJson !== 'string') {
    throw new Error('File content is not text');
  }

  const rawParsed = JSON.parse(contentJson);
  const parsed = rawParsed.version !== '2.0.0' ? toV2(rawParsed) : rawParsed;

  if (!parsed.searches || parsed.searches.length < 1) {
    throw new Error("Validation failed: history export has no 'searches' property");
  }

  parsed.searches.forEach((s: any) => {
    if (!isObjectFactsSearch(s) && !isObjectTraverseSearch(s) && !isMultiObjectSearch(s)) {
      throw new Error('Unsupport search found: ' + JSON.stringify(s));
    }
  });

  if (parsed.prunedObjectIds) {
    parsed.prunedObjectIds.forEach((objectId: any) => {
      if (typeof objectId !== 'string') {
        throw new Error('prunedObjectIds must be strings: ' + JSON.stringify(objectId));
      }
    });
  }

  return parsed;
};

export const searchToSelection = (search: Search, result: SearchResult): { [id: string]: ActSelection } => {
  if (isFactSearch(search)) {
    return { [search.id]: { id: search.id, kind: 'fact' } };
  } else if (isObjectTraverseSearch(search) || isObjectFactsSearch(search)) {
    const match = _.find((x: ActObject) => x.type.name === search.objectType && x.value === search.objectValue)(
      result.objects
    );
    return match ? { [match.id]: { kind: 'object', id: match.id } } : {};
  } else if (isMultiObjectSearch(search)) {
    return search.objectIds.reduce((acc, id) => {
      return { ...acc, [id]: { kind: 'object', id: id } };
    }, {});
  } else {
    assertNever(search);
    return {};
  }
};

class WorkingHistoryStore {
  root: MainPageStore;
  eventBus: EventBus;

  predefinedQueryToName: { [queryString: string]: string };

  constructor(root: MainPageStore, config: any, eventBus: EventBus) {
    this.root = root;
    this.eventBus = eventBus;

    this.predefinedQueryToName = (config.predefinedObjectQueries || []).reduce((acc: any, q: PredefinedObjectQuery) => {
      acc[q.query] = q.name;
      return acc;
    }, {});
  }

  @computed get mergePrevious(): boolean {
    return this.root.workingHistory.mergePrevious;
  }

  @computed get selectedItemId(): string {
    return this.root.workingHistory.selectedItemId;
  }

  @action.bound
  setSelectedSearchItem(props: { item: WorkingHistoryItem; loadable: TLoadable<SearchResult> }) {
    if (props.item) {
      this.root.workingHistory.selectedItemId = props.item.id;

      if (isDone(props.loadable)) {
        const selection = searchToSelection(props.item.search, this.root.workingHistory.result);
        this.eventBus.publish([{ kind: 'selectionReset', selection: selection }]);
      }
    }
  }

  @action.bound
  removeItem(item: WorkingHistoryItem) {
    this.root.workingHistory.removeItem(item);
  }

  @action.bound
  flipMergePrevious() {
    this.root.workingHistory.mergePrevious = !this.root.workingHistory.mergePrevious;
  }

  @action.bound
  onExport() {
    const data = stateExport(this.root.workingHistory.historyItems, this.root.refineryStore.prunedObjectIds);
    exportToJson(fileTimeString(new Date()) + '-act-search-history.json', data);
  }

  @action.bound
  onImport(fileEvent: any) {
    const fileReader = new FileReader();
    fileReader.onloadend = e => {
      const content = fileReader.result;

      try {
        const parsed = parseStateExport(content);
        this.root.initByImport(parsed);
      } catch (err) {
        this.root.handleError({ error: err, title: 'Import failed' });
      }
    };

    if (fileEvent.target && fileEvent.target.files[0]) {
      fileReader.readAsText(fileEvent.target.files[0]);
      // Clear the input field so that another file with the same name may be imported
      fileEvent.target.value = null;
    }
  }

  @action.bound
  onClear() {
    this.root.workingHistory.removeAllItems();
  }

  @computed
  get prepared() {
    const historyItems = this.root.workingHistory.withLoadable.map(
      (props: { item: WorkingHistoryItem; loadable: TLoadable<SearchResult> }) => {
        return {
          id: searchId(props.item.search),
          title: itemTitle(props.item.search),
          isSelected: props.item.id === this.selectedItemId,
          isLoading: isPending(props.loadable),
          error: isRejected(props.loadable) ? props.loadable.error : undefined,
          details: itemDetails(props.item, this.predefinedQueryToName),
          actions: itemActions(
            props.item,
            () => this.removeItem(props.item),
            () => copy(props.item)
          ),
          onClick: () => this.setSelectedSearchItem(props)
        };
      }
    );

    return {
      isEmpty: this.root.workingHistory.isEmpty,
      historyItems: historyItems,
      mergePrevious: { checked: this.mergePrevious, onClick: this.flipMergePrevious },
      onImport: this.onImport,
      onExport: this.onExport,
      onClear: this.onClear
    };
  }
}

export default WorkingHistoryStore;
