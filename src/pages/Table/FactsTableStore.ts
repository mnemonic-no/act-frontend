import { action, computed, observable } from 'mobx';

import { ActFact, ActSelection } from '../types';
import MainPageStore from '../MainPageStore';
import { ColumnKind, FactRow, SortOrder } from './FactsTable';
import { isOneLegged } from '../../core/transformers';
import { exportToCsv } from '../../util/util';
import { renderObjectValue } from '../../util/util';
import { isRetracted } from '../../core/domain';

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
      text: cellText(kind, fact, isExport) || ''
    }))
  };
};

class FactsTableStore {
  root: MainPageStore;

  @observable
  sortOrder: SortOrder = { order: 'asc', orderBy: 'factType' };

  columns: Array<{ label: string; exportLabel?: string; tooltip?: string; kind: ColumnKind }> = [
    { label: 'Source Type', kind: 'sourceType' },
    { label: 'Source Value', kind: 'sourceValue' },
    { label: 'Fact Type', kind: 'factType' },
    { label: 'Fact Value', kind: 'factValue' },
    { label: 'Destination Type', kind: 'destinationType' },
    { label: 'Destination Value', kind: 'destinationValue' },
    { label: 'Retracted', kind: 'isRetracted', tooltip: 'Is fact retracted?' },
    { label: 'Bi-dir.', exportLabel: 'Bidirectional?', kind: 'isBidirectional', tooltip: 'Is fact bidirectional?' },
    {
      label: 'Object prop.',
      exportLabel: 'Object property?',
      kind: 'isOneLegged',
      tooltip: 'Is fact a property of the object?'
    }
  ];

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
  onExportClick() {
    const factRows = Object.values(this.root.refineryStore.refined.facts).map(fact =>
      toFactRow(fact, this.columns, this.root.selectionStore.currentlySelected, true)
    );

    const rows = sortBy(this.sortOrder, this.columns, factRows).map(row => row.cells.map(({ text }) => text));

    const headerRow = [this.columns.map(c => c.exportLabel || c.label)];

    const nowTimeString = new Date()
      .toISOString()
      .replace(/:/g, '-')
      .substr(0, 19);
    exportToCsv(nowTimeString + '-act-facts.csv', headerRow.concat(rows));
  }

  @computed
  get prepared() {
    const rows = Object.values(this.root.refineryStore.refined.facts).map(f =>
      toFactRow(f, this.columns, this.root.selectionStore.currentlySelected, false)
    );

    return {
      rows: sortBy(this.sortOrder, this.columns, rows),
      columns: this.columns,
      sortOrder: this.sortOrder,
      onSortChange: this.onSortChange,
      onRowClick: this.setSelectedFact,
      onExportClick: this.onExportClick
    };
  }
}

export default FactsTableStore;
