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
            showFactEdgeLabels: this.root.ui.cytoscapeLayoutStore.graphOptions.showFactEdgeLabels,
            showRetractions: this.root.ui.cytoscapeLayoutStore.graphOptions.showRetractions,
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