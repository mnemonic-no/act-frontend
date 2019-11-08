import { action, computed, observable } from 'mobx';
import * as _ from 'lodash/fp';

import { ActFact, ActObject, ActSelection } from '../../core/types';
import { ColumnKind, ObjectRow, SortOrder } from './ObjectsTable';
import MainPageStore from '../MainPageStore';
import { oneLeggedFactsFor } from '../../core/domain';
import { exportToCsv, fileTimeString } from '../../util/util';

const sortBy = (sortOrder: SortOrder, objects: Array<ObjectRow>) => {
  return objects.slice().sort((a: any, b: any) => {
    let aa;
    let bb;
    if (sortOrder.orderBy === 'objectType') {
      aa = a.actObject.type.name;
      bb = b.actObject.type.name;
    } else if (sortOrder.orderBy === 'properties') {
      aa = JSON.stringify(a.properties);
      bb = JSON.stringify(b.properties);
    } else {
      aa = a.actObject.value;
      bb = b.actObject.value;
    }

    aa = aa.toLowerCase();
    bb = bb.toLowerCase();

    if (sortOrder.order === 'asc') {
      return aa < bb ? -1 : 1;
    } else {
      return aa < bb ? 1 : -1;
    }
  });
};

const toObjectRow = (
  object: ActObject,
  currentlySelected: { [id: string]: ActSelection },
  facts: Array<ActFact>
): ObjectRow => {
  return {
    id: object.id,
    title: object.type.name,
    isSelected: Boolean(currentlySelected[object.id]),
    actObject: object,
    properties: oneLeggedFactsFor(object, facts).map(f => {
      return { k: f.type.name, v: f.value || '' };
    })
  };
};

export const objectRows = (input: {
  objects: Array<ActObject>;
  objectTypeFilter: Set<string>;
  currentlySelected: { [id: string]: ActSelection };
  filterSelected: boolean;
  facts: Array<ActFact>;
  sortOrder: SortOrder;
}) => {
  return _.pipe(
    _.filter((o: ActObject) => input.objectTypeFilter.size === 0 || input.objectTypeFilter.has(o.type.name)),
    objects => (input.filterSelected ? objects.filter(o => Boolean(input.currentlySelected[o.id])) : objects),
    _.map((o: ActObject) => toObjectRow(o, input.currentlySelected, input.facts)),
    objectRows => sortBy(input.sortOrder, objectRows)
  )(input.objects);
};

const emptyFilterValue = 'Show all';

class ObjectsTableStore {
  root: MainPageStore;

  columns: Array<{ label: string; kind: ColumnKind }> = [
    { label: 'Type', kind: 'objectType' },
    { label: 'Value', kind: 'objectValue' },
    { label: 'Properties', kind: 'properties' }
  ];

  @observable filterSelected = false;
  @observable objectTypeFilter: Set<string> = new Set();

  @observable
  sortOrder: SortOrder = { order: 'asc', orderBy: 'objectType' };

  constructor(root: MainPageStore) {
    this.root = root;
  }

  @computed get objects() {
    return Object.values(this.root.refineryStore.refined.objects);
  }

  @action.bound
  onToggleSelection(actObject: ActObject) {
    this.root.selectionStore.toggleSelection({ kind: 'object', id: actObject.id });
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
      this.objectTypeFilter = new Set();
    } else {
      this.objectTypeFilter = new Set(value);
    }
  }

  @action.bound
  setFilters({ filterSelected, objectTypeFilter }: { filterSelected: boolean; objectTypeFilter?: Set<string> }) {
    this.filterSelected = filterSelected;
    if (objectTypeFilter) {
      this.objectTypeFilter = objectTypeFilter;
    }
  }

  @action.bound
  exportToCsv() {
    const rows = objectRows({
      objects: Object.values(this.root.refineryStore.refined.objects),
      facts: Object.values(this.root.refineryStore.refined.facts),
      currentlySelected: this.root.selectionStore.currentlySelected,
      objectTypeFilter: this.objectTypeFilter,
      filterSelected: this.filterSelected,
      sortOrder: this.sortOrder
    }).map(row => {
      return [row.title, row.actObject.value, row.properties.map(({ k, v }) => `${k}: ${v}`).join(',')];
    });

    const headerRow = [this.columns.map(c => c.label)];

    exportToCsv(fileTimeString(new Date()) + '-act-objects.csv', headerRow.concat(rows));
  }

  @computed
  get prepared() {
    const allObjects = Object.values(this.root.refineryStore.refined.objects);

    const rows = objectRows({
      objects: allObjects,
      facts: Object.values(this.root.refineryStore.refined.facts),
      currentlySelected: this.root.selectionStore.currentlySelected,
      objectTypeFilter: this.objectTypeFilter,
      filterSelected: this.filterSelected,
      sortOrder: this.sortOrder
    });

    return {
      sortOrder: this.sortOrder,
      onSortChange: this.onSortChange,
      columns: this.columns,
      rows: rows,
      selectedFilter: {
        checked: this.filterSelected,
        onClick: () => {
          this.filterSelected = !this.filterSelected;
        }
      },
      typeMultiSelect: {
        id: 'typeMultiSelect',
        label: 'Object Type',
        values: _.uniq(allObjects.map(o => o.type.name)).sort(),
        selectedValues: [...this.objectTypeFilter],
        emptyValue: emptyFilterValue,
        onChange: this.onFactTypeFilterChange
      },
      onRowClick: this.onToggleSelection,
      onExportClick: this.exportToCsv
    };
  }
}

export default ObjectsTableStore;
