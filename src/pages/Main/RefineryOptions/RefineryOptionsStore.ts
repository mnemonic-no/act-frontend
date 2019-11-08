import { computed } from 'mobx';
import MainPageStore from '../MainPageStore';

class RefineryOptionsStore {
  root: MainPageStore;

  constructor(root: MainPageStore) {
    this.root = root;
  }

  @computed get filterOptions() {
    return {
      includeRetractions: this.root.refineryStore.includeRetractions,
      objectTypeFilters: this.root.refineryStore.objectTypeFilters,
      endTimestamp: this.root.refineryStore.endTimestamp,
      includeOrphans: this.root.refineryStore.includeOrphans,

      setEndTimestamp: (newEnd: Date) => this.root.refineryStore.setEndTimestamp(newEnd),
      toggleObjectTypeFilter: this.root.refineryStore.toggleObjectTypeFilter,
      toggleIncludeOrphans: this.root.refineryStore.toggleIncludeOrphans,
      toggleIncludeRetractions: this.root.refineryStore.toggleIncludeRetractions
    };
  }
}

export default RefineryOptionsStore;
