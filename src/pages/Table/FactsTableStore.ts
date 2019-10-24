import { action, computed, observable } from 'mobx';
import * as _ from 'lodash/fp';

import { ActFact, ActSelection } from '../types';
import MainPageStore from '../MainPageStore';
import { ColumnKind, FactRow, SortOrder } from './FactsTable';
import { isOneLegged } from '../../core/transformers';
import { exportToCsv, fileTimeString } from '../../util/util';
import { renderObjectValue } from '../../util/util';
import { isRetracted } from '../../core/domain';
import { format } from 'date-fns';

const sortBy = (sortOrder: SortOrder, columns: Array<{ label: string; kind: ColumnKind }>, objects: Array<FactRow>) => {
  const cellIdx = columns.findIndex(({ kind }) => kind === sortOrder.orderBy);

  return objects.slice().sort((a: FactRow, b: FactRow) => {
    const aa = a.cells[cellIdx].text;
    const bb = b.cells[cellIdx].text;

    if (sortOrder.order === 'asc') {
      return aa < bb ? -1 : 1;
    } else {
      return aa < bb ? 1 : -1;
    }
  });
};

const cellText = (kind: ColumnKind, fact: ActFact, isExport: boolean) => {
  switch (kind) {
    case 'timestamp':
      return isExport ? fact.timestamp : format(new Date(fact.timestamp), 'yyyy.MM.dd HH:mm');
    case 'lastSeenTimestamp':
      return isExport ? fact.lastSeenTimestamp : format(new Date(fact.lastSeenTimestamp), 'yyyy.MM.dd HH:mm');
    case 'sourceType':
      return fact.sourceObject ? fact.sourceObject.type.name : '';
    case 'sourceValue':
      return fact.sourceObject ? (isExport ? fact.sourceObject.value : renderObjectValue(fact.sourceObject, 100)) : '';
    case 'factType':
      return fact.type.name;
    case 'factValue':
      return fact.value ? fact.value : '';
    case 'destinationType':
      return fact.destinationObject ? fact.destinationObject.type.name : '';
    case 'destinationValue':
      return fact.destinationObject
        ? isExport
          ? fact.destinationObject.value
          : renderObjectValue(fact.destinationObject, 100)
        : '';
    case 'isRetracted':
      return isRetracted(fact) ? (isExport ? '1' : '✗') : '';
    case 'isBidirectional':
      return fact.bidirectionalBinding ? (isExport ? '1' : '✔') : '';
    case 'isOneLegged':
      return isOneLegged(fact) ? (isExport ? '1' : '✔') : '';
    default:
      // eslint-disable-next-line
      const _exhaustiveCheck: never = kind;
  }
};

const isFaded = (kind: ColumnKind, fact: ActFact) =>
  Boolean(kind === 'lastSeenTimestamp' && fact.timestamp === fact.lastSeenTimestamp);

const toFactRow = (
  fact: ActFact,
  columns: Array<{ label: string; kind: ColumnKind }>,
  currentlySelected: { [id: string]: ActSelection },
  isExport: boolean
): FactRow => {
  return {
    id: fact.id,
    fact: fact,
    isSelected: Boolean(currentlySelected[fact.id]),
    cells: columns.map(({ kind }) => ({
      kind: kind,
      text: cellText(kind, fact, isExport) || '',
      isFaded: isFaded(kind, fact)
    }))
  };
};

export const factRows = (input: {
  facts: Array<ActFact>;
  currentlySelected: { [id: string]: ActSelection };
  columns: Array<{ label: string; kind: ColumnKind }>;
  factTypeFilter: Set<string>;
  filterSelected: boolean;
  sortOrder: SortOrder;
  isExport: boolean;
}) => {
  return _.pipe(
    _.filter((f: ActFact) => input.factTypeFilter.size === 0 || input.factTypeFilter.has(f.type.name)),
    fs => (input.filterSelected ? fs.filter(f => input.currentlySelected[f.id]) : fs),
    _.map((f: ActFact) => toFactRow(f, input.columns, input.currentlySelected, input.isExport)),
    factRows => sortBy(input.sortOrder, input.columns, factRows)
  )(input.facts);
};

const emptyFilterValue = 'Show all';

export const columns: Array<{ label: string; exportLabel?: string; tooltip?: string; kind: ColumnKind }> = [
  { label: 'TS', exportLabel: 'Timestamp', kind: 'timestamp', tooltip: 'Timestamp' },
  { label: 'TS>', exportLabel: 'Last seen timestamp', kind: 'lastSeenTimestamp', tooltip: 'Last seen Timestamp' },
  { label: 'Source Type', kind: 'sourceType' },
  { label: 'Source Value', kind: 'sourceValue' },
  { label: 'Fact Type', kind: 'factType' },
  { label: 'Fact Value', kind: 'factValue' },
  { label: 'Destination Type', kind: 'destinationType' },
  { label: 'Destination Value', kind: 'destinationValue' },
  { label: 'R', exportLabel: 'Retracted', kind: 'isRetracted', tooltip: 'Is fact retracted?' },
  { label: 'B', exportLabel: 'Bidirectional?', kind: 'isBidirectional', tooltip: 'Is fact bidirectional?' },
  {
    label: 'P',
    exportLabel: 'Object property?',
    kind: 'isOneLegged',
    tooltip: 'Is fact a property of the object?'
  }
];

class FactsTableStore {
  root: MainPageStore;

  @observable filterSelected = false;

  @observable
  sortOrder: SortOrder = { order: 'asc', orderBy: 'factType' };

  @observable factTypeFilter: Set<string> = new Set();

  constructor(root: MainPageStore) {
    this.root = root;
  }

  @computed get facts() {
    return Object.values(this.root.refineryStore.refined.facts);
  }

  @action.bound
  setSelectedFact(actFact: ActFact) {
    this.root.selectionStore.setCurrentSelection({ kind: 'fact', id: actFact.id });
  }

  @action.bound
  onSortChange(newOrderBy: ColumnKind) {
    this.sortOrder = {
      orderBy: newOrderBy,
      order: this.sortOrder.orderBy === newOrderBy && this.sortOrder.order === 'asc' ? 'desc' : 'asc'
    };
  }

  @action.bound
  onFactTypeFilterChange(value: Array<string>) {
    if (_.includes(emptyFilterValue)(value)) {
      this.factTypeFilter = new Set();
    } else {
      this.factTypeFilter = new Set(value);
    }
  }

  @action.bound
  setFilters({ filterSelected, factTypeFilter }: { filterSelected: boolean; factTypeFilter?: Set<string> }) {
    this.filterSelected = filterSelected;
    if (factTypeFilter) {
      this.factTypeFilter = factTypeFilter;
    }
  }

  @action.bound
  onExportClick() {
    const allFacts = Object.values(this.root.refineryStore.refined.facts);

    const rows = factRows({
      isExport: true,
      facts: allFacts,
      factTypeFilter: this.factTypeFilter,
      currentlySelected: this.root.selectionStore.currentlySelected,
      filterSelected: this.filterSelected,
      sortOrder: this.sortOrder,
      columns: columns
    }).map(row => row.cells.map(({ text }) => text));

    const headerRow = [columns.map(c => c.exportLabel || c.label)];

    exportToCsv(fileTimeString(new Date()) + '-act-facts.csv', headerRow.concat(rows));
  }

  @computed
  get prepared() {
    const allFacts = Object.values(this.root.refineryStore.refined.facts);

    const rows = factRows({
      isExport: false,
      facts: allFacts,
      factTypeFilter: this.factTypeFilter,
      currentlySelected: this.root.selectionStore.currentlySelected,
      filterSelected: this.filterSelected,
      sortOrder: this.sortOrder,
      columns: columns
    });

    return {
      rows: rows,
      columns: columns,
      sortOrder: this.sortOrder,
      typeMultiSelect: {
        id: 'typeMultiSelect',
        label: 'Fact Type',
        values: _.uniq(allFacts.map(f => f.type.name)).sort(),
        selectedValues: [...this.factTypeFilter],
        emptyValue: emptyFilterValue,
        onChange: this.onFactTypeFilterChange
      },
      selectedFilter: {
        checked: this.filterSelected,
        onClick: () => {
          this.filterSelected = !this.filterSelected;
        }
      },
      onSortChange: this.onSortChange,
      onRowClick: this.setSelectedFact,
      onExportClick: this.onExportClick
    };
  }
}

export default FactsTableStore;
