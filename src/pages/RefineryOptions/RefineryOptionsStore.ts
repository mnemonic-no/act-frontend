import { computed } from 'mobx';
import MainPageStore from '../MainPageStore';
import { ObjectTypeFilter } from '../types';

class RefineryOptionsStore {
  root: MainPageStore;

  constructor(root: MainPageStore) {
    this.root = root;
  }

  @computed get graphOptions() {
    return {
      showOrphans: this.root.refineryStore.showOrphans,
      showFactEdgeLabels: this.root.ui.cytoscapeLayoutStore.graphOptions.showFactEdgeLabels,
      showRetractions: this.root.ui.cytoscapeLayoutStore.graphOptions.showRetractions,
      toggleShowFactEdgeLabels: () => this.root.ui.cytoscapeLayoutStore.toggleShowFactEdgeLabels(),
      toggleShowRetractions: () => this.root.ui.cytoscapeLayoutStore.toggleShowRetractions(),
      toggleShowOrphans: this.root.refineryStore.toggleShowOrphans
    };
  }

  @computed get filterOptions() {
    return {
      objectTypeFilters: this.root.refineryStore.objectTypeFilters,
      endTimestamp: this.root.refineryStore.endTimestamp,
      setEndTimestamp: (newEnd: Date) => this.root.refineryStore.setEndTimestamp(newEnd),
      toggleObjectTypeFilter: (objectTypeFilter: ObjectTypeFilter) =>
        this.root.refineryStore.toggleObjectTypeFilter(objectTypeFilter)
    };
  }
}

export default RefineryOptionsStore;
