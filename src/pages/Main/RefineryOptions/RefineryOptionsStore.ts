import { computed } from 'mobx';
import MainPageStore from '../MainPageStore';
import { TConfig } from '../../../core/types';

class RefineryOptionsStore {
  root: MainPageStore;
  config: TConfig;

  constructor(root: MainPageStore, config: TConfig) {
    this.root = root;
    this.config = config;
  }

  @computed get filterOptions() {
    return {
      includeRetractions: this.root.refineryStore.includeRetractions,
      objectTypeFilters: this.root.refineryStore.objectTypeFilters,
      endTimestamp: this.root.refineryStore.endTimestamp,
      includeOrphans: this.root.refineryStore.includeOrphans,
      objectColors: this.config.objectColors || {},

      setEndTimestamp: (newEnd: Date) => this.root.refineryStore.setEndTimestamp(newEnd),
      toggleObjectTypeFilter: this.root.refineryStore.toggleObjectTypeFilter,
      toggleIncludeOrphans: this.root.refineryStore.toggleIncludeOrphans,
      toggleIncludeRetractions: this.root.refineryStore.toggleIncludeRetractions
    };
  }
}

export default RefineryOptionsStore;
