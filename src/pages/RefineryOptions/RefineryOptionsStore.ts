import {computed} from "mobx";
import {ObjectTypeFilter} from "../RefineryStore";
import MainPageStore from "../MainPageStore";


class RefineryOptionsStore {

    root: MainPageStore;

    constructor(root: MainPageStore) {
        this.root = root;
    }

    @computed get graphOptions() {
        return {
            showFactsAsNodes: this.root.ui.cytoscapeLayoutStore.graphOptions.showFactsAsNodes,
            showFactEdgeLabels: this.root.ui.cytoscapeLayoutStore.graphOptions.showFactEdgeLabels,
            showRetractions: this.root.ui.cytoscapeLayoutStore.graphOptions.showRetractions,
            toggleShowFactsAsNodes: () =>  this.root.ui.cytoscapeLayoutStore.toggleShowFactsAsNodes(),
            toggleShowFactEdgeLabels: () =>  this.root.ui.cytoscapeLayoutStore.toggleShowFactEdgeLabels(),
            toggleShowRetractions: () =>  this.root.ui.cytoscapeLayoutStore.toggleShowRetractions()
        }
    }

    @computed get filterOptions() {
        return {
            objectTypeFilters: this.root.refineryStore.objectTypeFilters,
            endTimestamp: this.root.refineryStore.endTimestamp,
            setEndTimestamp: (newEnd : Date) => this.root.refineryStore.setEndTimestamp(newEnd),
            toggleObjectTypeFilter: (objectTypeFilter: ObjectTypeFilter) => this.root.refineryStore.toggleObjectTypeFilter(objectTypeFilter)
        }
    }
}

export default RefineryOptionsStore;